import { useEffect, useRef, useState } from "react";
import {
  getChatId,
  listenToMessages,
  sendMessage,
} from "../firebase/chat";
import { listenToUserStatus } from "../firebase/presence";
import ThemeToggle from "./ThemeToggle";

const REPLY_THRESHOLD = 50;
const MAX_DRAG = 80;

function getMessageDateLabel(timestamp) {
  if (!timestamp) {
    return "";
  }

  const messageDate = timestamp.toDate();
  const today = new Date();

  const messageDay = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );

  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const differenceInDays =
    Math.floor(
      (todayDay - messageDay) / (1000 * 60 * 60 * 24)
    );

  if (differenceInDays === 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Chat({ user, contact, onBack }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);

  const [contactStatus, setContactStatus] = useState({
    online: false,
    lastSeen: null,
  });

  const chatId = getChatId(user.uid, contact.uid);

  /* =========================================================
     CONTACT PRESENCE
     ========================================================= */

  useEffect(() => {
    const unsubscribe = listenToUserStatus(
      contact.uid,
      (status) => {
        setContactStatus(status);
      }
    );

    return unsubscribe;
  }, [contact.uid]);

  /* =========================================================
     LISTEN TO MESSAGES
     ========================================================= */

  useEffect(() => {
    const unsubscribe = listenToMessages(
      chatId,
      (newMessages) => {
        setMessages(newMessages);
      }
    );

    return unsubscribe;
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);


  /* =========================================================
     SELECT MESSAGE FOR REPLY
     ========================================================= */

  const handleReply = (message) => {
    setReplyingTo({
      messageId: message.id,
      senderId: message.senderId,
      text: message.text,
    });
  };

  /* =========================================================
     CANCEL REPLY
     ========================================================= */

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  /* =========================================================
     SEND MESSAGE
     ========================================================= */

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const text = messageText.trim();

    if (!text || sending) {
      return;
    }

    try {
      setSending(true);

      await sendMessage(
        chatId,
        user.uid,
        contact.uid,
        text,
        replyingTo
      );

      setMessageText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <main
      className="
        h-[100dvh]
        bg-[#FFFFFF] dark:bg-[#0d1211]
        text-[#10201f] dark:text-[#FFFFFF]
        flex flex-col
        overflow-hidden
        transition-colors duration-300
      "
    >
      {/* =====================================================
          CHAT HEADER
          ===================================================== */}

      <header
        className="
          h-16 flex-shrink-0
          bg-white dark:bg-[#111817]
          border-b
          border-[#d9e2e1] dark:border-[#303c39]
          px-4 sm:px-6
          flex items-center justify-between
          transition-colors duration-300
        "
      >
        {/* Left side */}
        <div className="flex items-center gap-3 min-w-0">

          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="
              flex-shrink-0
              w-10 h-10
              rounded-lg
              bg-[#eaf0ef] dark:bg-[#26322f]
              text-[#10201f] dark:text-[#FFFFFF]
              font-semibold
              hover:bg-[#d9e2e1]
              dark:hover:bg-[#26322f]
              transition-colors duration-200
              cursor-pointer">
            ←
          </button>

          <div className="flex items-center gap-3 min-w-0">
              {contact?.photoURL ? (
                <img
                  src={contact.photoURL}
                  alt={`${contact.fullName || "Contact"} profile`}
                  className="
                    w-10 h-10
                    rounded-full
                    object-cover
                    flex-shrink-0
                    border border-[#d9e2e1] dark:border-[#303c39]"/>
                ) : (

                <div
                  className="
                    w-10 h-10
                    rounded-full
                    flex-shrink-0
                    flex items-center justify-center
                    bg-[#eaf0ef] dark:bg-[#26322f]
                    border border-[#d9e2e1] dark:border-[#303c39]
                    text-[#10201f] dark:text-white
                    text-sm font-bold">
                  {(contact?.fullName || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

          <div className="min-w-0">
            <h1
              className="
                text-lg font-bold truncate
                text-[#10201f] dark:text-white
                transition-colors duration-300">
              {contact.fullName}
            </h1>

            <p
              className={`
                text-xs font-medium
                transition-colors duration-300
                ${
                  contactStatus.online
                    ? "text-teal-700 dark:text-teal-400"
                    : "text-[#566867] dark:text-[#aab8b5]"
                }`}>
              {contactStatus.online
                ? "● Online"
                : "● Offline"}
            </p>
          </div>
        </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <ThemeToggle />
        </div>
      </header>

      {/* =====================================================
          CHAT AREA
          ===================================================== */}

      <section
        className="
          flex-1 min-h-0
          max-w-3xl w-full mx-auto
          px-4 sm:px-6 py-5
          overflow-hidden
        "
      >
        <div
          className="
            h-full
            bg-white dark:bg-[#151c1b]
            border border-[#d9e2e1] dark:border-[#303c39]
            rounded-2xl
            p-4
            flex flex-col
            shadow-sm dark:shadow-none
            transition-colors duration-300
          "
        >

          {/* =================================================
              MESSAGES
              ================================================= */}

          <div
            className="
              flex-1 min-h-0
              space-y-3
              overflow-y-auto
              overscroll-contain
            "
          >
            {messages.length === 0 ? (
              <div className="h-full grid place-items-center">
                <p
                  className="
                    text-sm
                    text-[#566867] dark:text-[#aab8b5]
                    transition-colors duration-300
                  "
                >
                  No messages yet. Start the conversation.
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isMine =
                  message.senderId === user.uid;

                const dateLabel = getMessageDateLabel(
                  message.createdAt
                );
                const previousMessage = messages[index - 1];
                const previousDateLabel = previousMessage
                  ? getMessageDateLabel(previousMessage.createdAt)
                  : null;

                const shouldShowDate =
                  dateLabel !== previousDateLabel;

                return (
                  <div key={message.id}>
                    {shouldShowDate && dateLabel && (
                      <div className="flex justify-center my-4">
                        <span
                          className="
                            px-3 py-1
                            rounded-full
                            text-xs
                            font-medium
                            bg-[#eaf0ef]
                            dark:bg-[#26322f]
                            text-[#566867]
                            dark:text-[#aab8b5]
                            transition-colors duration-300">
                          {dateLabel}
                        </span>
                      </div>
                    )}

                    <SwipeableMessage
                      message={message}
                      isMine={isMine}
                      onReply={handleReply}
                    />
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* =================================================
              REPLY PREVIEW
              ================================================= */}

          {replyingTo && (
            <div
              className="
                mt-3
                flex items-center gap-3
                rounded-xl
                border
                border-[#b3c2c0]
                dark:border-[#303c39]
                bg-[#eaf0ef]
                dark:bg-[#101615]
                px-3 py-2
                transition-colors duration-300
              "
            >
              {/* Teal indicator */}
              <div
                className="
                  w-1
                  self-stretch
                  rounded-full
                  bg-[#0f766e]
                  flex-shrink-0
                "
              />

              {/* Original message */}
              <div className="min-w-0 flex-1">
                <p
                  className="
                    text-xs font-semibold
                    text-[#0f766e] dark:text-[#2dd4bf]
                  "
                >
                  Replying to message
                </p>

                <p
                  className="
                    text-sm truncate
                    text-[#566867]
                    dark:text-[#aab8b5]
                  "
                >
                  {replyingTo.text}
                </p>
              </div>

              {/* Cancel */}
              <button
                type="button"
                onClick={handleCancelReply}
                aria-label="Cancel reply"
                className="
                  flex-shrink-0
                  w-8 h-8
                  rounded-full
                  grid place-items-center
                  text-[#566867]
                  dark:text-[#aab8b5]
                  hover:bg-[#d9e2e1]
                  dark:hover:bg-[#26322f]
                  transition-colors duration-200
                  cursor-pointer
                "
              >
                ✕
              </button>
            </div>
          )}

          {/* =================================================
              MESSAGE INPUT
              ================================================= */}

          <form
            onSubmit={handleSendMessage}
            className="
              mt-4
              flex gap-2
              flex-shrink-0
            "
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
              }}
              placeholder={
                replyingTo
                  ? "Write a reply..."
                  : "Type a message..."
              }
              className="
                min-w-0 flex-1
                h-11 px-4
                border border-[#b3c2c0]
                dark:border-[#303c39]
                rounded-xl
                bg-white dark:bg-[#151c1b]
                text-[#10201f] dark:text-[#FFFFFF]
                placeholder:text-[#566867]
                dark:placeholder:text-[#aab8b5]
                focus:outline-none
                focus:ring-2
                focus:ring-[#0f766e]
                focus:border-transparent
                transition-colors duration-300
              "
            />

            <button
              type="submit"
              disabled={
                sending || !messageText.trim()
              }
              className="
                flex-shrink-0
                h-11 px-5
                rounded-xl
                bg-[#0f766e]
                hover:bg-[#0b5f58]
                text-[#FFFFFF]
                font-semibold
                transition-all duration-200
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {sending ? "..." : "Send"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}


/* ===========================================================
   SWIPEABLE MESSAGE
   =========================================================== */

function SwipeableMessage({
  message,
  isMine,
  onReply,
}) {
  const startX = useRef(0);
  const currentX = useRef(0);

  const [dragDistance, setDragDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  /* =========================================================
     POINTER DOWN
     ========================================================= */

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    startX.current = event.clientX;
    currentX.current = event.clientX;

    setIsDragging(true);

    try {
      event.currentTarget.setPointerCapture(
        event.pointerId
      );
    } catch (error) {
      console.warn(
        "Could not capture pointer:",
        error
      );
    }
  };

  /* =========================================================
     POINTER MOVE
     ========================================================= */

  const handlePointerMove = (event) => {
    if (!isDragging) {
      return;
    }

    currentX.current = event.clientX;

    const distance =
      currentX.current - startX.current;

    // Only allow movement toward the right.
    const rightSwipeDistance = Math.max(
      0,
      Math.min(distance, MAX_DRAG)
    );

    setDragDistance(rightSwipeDistance);
  };

  /* =========================================================
     FINISH SWIPE
     ========================================================= */

  const finishSwipe = () => {
    const distance =
      currentX.current - startX.current;

    const rightSwipeDistance = Math.max(
      0,
      Math.min(distance, MAX_DRAG)
    );

    if (
      rightSwipeDistance >= REPLY_THRESHOLD
    ) {
      onReply(message);

      if (
        typeof navigator !== "undefined" &&
        typeof navigator.vibrate === "function"
      ) {
        navigator.vibrate(30);
      }
    }

    setIsDragging(false);
    setDragDistance(0);
  };

  /* =========================================================
     POINTER UP
     ========================================================= */

  const handlePointerUp = (event) => {
    try {
      if (
        event.currentTarget.hasPointerCapture(
          event.pointerId
        )
      ) {
        event.currentTarget.releasePointerCapture(
          event.pointerId
        );
      }
    } catch (error) {
      console.warn(
        "Could not release pointer:",
        error
      );
    }

    finishSwipe();
  };

  /* =========================================================
     POINTER CANCEL
     ========================================================= */

  const handlePointerCancel = (event) => {
    try {
      if (
        event.currentTarget.hasPointerCapture(
          event.pointerId
        )
      ) {
        event.currentTarget.releasePointerCapture(
          event.pointerId
        );
      }
    } catch (error) {
      console.warn(
        "Could not release cancelled pointer:",
        error
      );
    }

    setIsDragging(false);
    setDragDistance(0);

    startX.current = 0;
    currentX.current = 0;
  };

  /* =========================================================
     REPLY ICON VISIBILITY
     ========================================================= */

  const replyIconOpacity = Math.min(
    dragDistance / REPLY_THRESHOLD,
    1
  );

  return (
    <div
      className={`
        relative
        flex
        ${
          isMine
            ? "justify-end"
            : "justify-start"
        }
      `}
      style={{
        touchAction: "pan-y",
      }}
    >
      {/* ===================================================
          REPLY ICON
          =================================================== */}

      <span
        aria-hidden="true"
        className="
          absolute
          left-2
          top-1/2
          -translate-y-1/2
          w-8 h-8
          rounded-full
          bg-[#eaf0ef]
          dark:bg-[#26322f]
          text-[#0f766e]
          dark:text-[#0f766e]
          grid place-items-center
          text-lg
          pointer-events-none
        "
        style={{
          opacity: replyIconOpacity,
        }}
      >
        ↩
      </span>

      {/* ===================================================
          MESSAGE BUBBLE
          =================================================== */}

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`
          max-w-[80%]
          px-4 py-2
          rounded-2xl
          select-none
          ${
            isMine
              ? "bg-[#0f766e] text-[#FFFFFF] rounded-br-md"
              : "bg-[#eaf0ef] dark:bg-[#26322f] text-[#10201f] dark:text-[#FFFFFF] rounded-bl-md"
          }
        `}
        style={{
          transform: `translateX(${dragDistance}px)`,
          transition: isDragging
            ? "none"
            : "transform 0.2s ease",
          willChange: "transform",
        }}
      >
        {/* =================================================
            QUOTED MESSAGE
            ================================================= */}

        {message.replyTo && (
          <div
            className={`
              mb-2
              rounded-lg
              border-l-4
              border-[#2dd4bf]
              px-3 py-2
              ${
                isMine
                  ? "bg-black/20"
                  : "bg-[#d9e2e1] dark:bg-[#151c1b]"
              }
            `}
          >
            <p
              className={`
                text-xs
                font-semibold
                ${
                  isMine
                    ? "text-[#FFFFFF]"
                    : "text-[#0f766e] dark:text-[#2dd4bf]"
                }
              `}
            >
              Reply
            </p>
            <p
            className={`
              text-xs
              truncate
            ${
              isMine
              ? "text-[#FFFFFF]"
              : "text-[#566867] dark:text-[#aab8b5]"}`}>
              {message.replyTo.text}
            </p>
          </div>)}

          {/* Message text */}
          <p className="text-sm break-words">
          {message.text}
          {message.createdAt && (
            <span
              className={`block mt-1 text-[10px] text-right ${
                isMine
                  ? "text-[#FFFFFF]"
                  : "text-[#566867] dark:text-[#aab8b5]"}`}>
              {message.createdAt.toDate().toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          )}</p>
      </div>
    </div>
  );
}