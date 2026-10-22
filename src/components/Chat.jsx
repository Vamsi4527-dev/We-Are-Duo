import { useEffect, useRef, useState } from "react";
import {
  getChatId,
  listenToMessages,
  sendMessage,
  markMessageDelivered,
  markMessageRead,
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
      (todayDay - messageDay) /
        (1000 * 60 * 60 * 24)
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

export default function Chat({
  user,
  contact,
  onBack,
}) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
const previousMessageCountRef = useRef(0);
  const deliveredMessageIdsRef = useRef(new Set());
  const readMessageIdsRef = useRef(new Set());

  const handleMarkMessageRead = (message) => {
  if (
    message.senderId === user.uid ||
    message.readAt ||
    readMessageIdsRef.current.has(message.id)
  ) {
    return;
  }

  readMessageIdsRef.current.add(message.id);

  markMessageRead(chatId, message.id).catch((error) => {
    readMessageIdsRef.current.delete(message.id);

    console.error(
      "Failed to mark message as read:",
      error
    );
  });
};

  const [contactStatus, setContactStatus] =
    useState({
      online: false,
      lastSeen: null,
    });

  // Profile photo viewer
  const [selectedPhoto, setSelectedPhoto] =
    useState(null);

  const chatId = getChatId(
    user.uid,
    contact.uid
  );

  /* =========================================================
     CONTACT PRESENCE
     ========================================================= */

  useEffect(() => {
    const unsubscribe =
      listenToUserStatus(
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
    const unsubscribe=
    listenToMessages(
      chatId,
      (newMessages) => {
        setMessages(newMessages);

        newMessages.forEach((message) => {
          if (
            message.senderId !== user.uid &&
            !message.deliveredAt &&
            !deliveredMessageIdsRef.current.has(message.id)) {
            deliveredMessageIdsRef.current.add(message.id);

            markMessageDelivered(chatId, message.id).catch((error) => {
              deliveredMessageIdsRef.current.delete(message.id);
              console.error(
                "Failed to mark message as delivered:",
                error
              );
            });
          }
        });
      }
    );
  return unsubscribe;}, 
  [chatId, user.uid]);

  useEffect(() => {
  const container = messagesContainerRef.current;

  if (!container) {
    return;
  }

  const previousCount = previousMessageCountRef.current;
  const currentCount = messages.length;

  const isInitialLoad =
    previousCount === 0 && currentCount > 0;

  const hasNewMessage =
    currentCount > previousCount;

  const isNearBottom =
    container.scrollHeight -
      container.scrollTop -
      container.clientHeight <
    120;

  if (
    isInitialLoad ||
    (hasNewMessage && isNearBottom)
  ) {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }

  previousMessageCountRef.current = currentCount;
}, [messages]);

  /* =========================================================
     CLOSE PROFILE PHOTO VIEWER WITH ESCAPE
     ========================================================= */

  useEffect(() => {
    if (!selectedPhoto) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedPhoto]);

  /* =========================================================
     OPEN PROFILE PHOTO
     ========================================================= */

  const handleOpenPhoto = () => {
    if (!contact?.photoURL) {
      return;
    }

    setSelectedPhoto({
      photoURL: contact.photoURL,
      fullName:
        contact.fullName || "Profile Photo",
    });
  };

  /* =========================================================
     CLOSE PROFILE PHOTO
     ========================================================= */

  const handleClosePhoto = () => {
    setSelectedPhoto(null);
  };

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
      console.error(
        "Failed to send message:",
        error
      );
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
          {/* Back Button */}
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
              cursor-pointer
            "
          >
            ←
          </button>

          {/* Contact Information */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Clickable Profile Photo */}
            <button
              type="button"
              onClick={handleOpenPhoto}
              disabled={!contact?.photoURL}
              aria-label={`View ${
                contact?.fullName ||
                "Contact"
              } profile photo`}
              className={`
                flex-shrink-0
                rounded-full
                ${
                  contact?.photoURL
                    ? "cursor-pointer hover:opacity-90 transition-opacity duration-200"
                    : "cursor-default"
                }
              `}
            >
              {contact?.photoURL ? (
                <img
                  src={contact.photoURL}
                  alt={`${
                    contact.fullName ||
                    "Contact"
                  } profile`}
                  className="
                    w-10 h-10
                    rounded-full
                    object-cover
                    flex-shrink-0
                    border
                    border-[#d9e2e1]
                    dark:border-[#303c39]
                  "
                />
              ) : (
                <div
                  className="
                    w-10 h-10
                    rounded-full
                    flex-shrink-0
                    flex items-center justify-center
                    bg-[#eaf0ef] dark:bg-[#26322f]
                    border
                    border-[#d9e2e1]
                    dark:border-[#303c39]
                    text-[#10201f]
                    dark:text-white
                    text-sm font-bold
                  "
                >
                  {(contact?.fullName || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </button>

            {/* Name + Status */}
            <div className="min-w-0">
              <h1
                className="
                  text-lg font-bold truncate
                  text-[#10201f] dark:text-white
                  transition-colors duration-300
                "
              >
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
                  }
                `}
              >
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
            ref={messagesContainerRef}
            className="
              flex-1 min-h-0
              space-y-3
              overflow-y-auto
              overscroll-contain">
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
              messages.map(
                (message, index) => {
                  const isMine =
                    message.senderId ===
                    user.uid;

                  const dateLabel =
                    getMessageDateLabel(
                      message.createdAt
                    );

                  const previousMessage =
                    messages[index - 1];

                  const previousDateLabel =
                    previousMessage
                      ? getMessageDateLabel(
                          previousMessage.createdAt
                        )
                      : null;

                  const shouldShowDate =
                    dateLabel !==
                    previousDateLabel;

                  return (
                    <div
                      key={message.id}
                    >
                      {shouldShowDate &&
                        dateLabel && (
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
                                transition-colors duration-300
                              "
                            >
                              {dateLabel}
                            </span>
                          </div>
                        )}

                      <SwipeableMessage
                        message={message}
                        isMine={isMine}
                        onReply={handleReply}
                        onRead={handleMarkMessageRead}/>
                    </div>
                  );
                }
              )
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
                    text-[#0f766e]
                    dark:text-[#2dd4bf]
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
                setMessageText(
                  e.target.value
                );
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
                text-[#10201f]
                dark:text-[#FFFFFF]
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
                sending ||
                !messageText.trim()
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

      {/* =====================================================
          PROFILE PHOTO VIEWER
          ===================================================== */}

      {selectedPhoto && (
        <div
          className="
            fixed inset-0
            z-[100]
            bg-black/80
            flex items-center justify-center
            p-4
          "
          role="dialog"
          aria-modal="true"
          aria-label="Profile photo viewer"
          onClick={handleClosePhoto}
        >
          <div
            className="
              relative
              w-full max-w-lg
              flex flex-col items-center
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClosePhoto}
              aria-label="Close profile photo"
              className="
                absolute
                right-0
                -top-12
                w-10 h-10
                rounded-full
                bg-white/10
                hover:bg-white/20
                text-white
                text-2xl
                flex items-center justify-center
                transition-colors duration-200
                cursor-pointer
              "
            >
              ×
            </button>

            {/* Large Profile Photo */}
            <img
              src={selectedPhoto.photoURL}
              alt={`${selectedPhoto.fullName} profile`}
              className="
                max-w-full
                max-h-[75vh]
                rounded-2xl
                object-contain
                border border-white/20
                shadow-2xl
              "
            />

            {/* Name */}
            <p
              className="
                mt-4
                text-lg
                font-semibold
                text-white
                text-center
              "
            >
              {selectedPhoto.fullName}
            </p>
          </div>
        </div>
      )}
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
  onRead,
}) {
  const startX = useRef(0);
  const currentX = useRef(0);
  const messageRef = useRef(null);

  useEffect(() => {
  if (
    isMine ||
    message.readAt ||
    !messageRef.current
  ) {
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (
        entry.isIntersecting &&
        entry.intersectionRatio >= 0.6
      ) {
        onRead(message);
        observer.disconnect();
      }
    },
    {
      threshold: [0.6],
    }
  );

  observer.observe(messageRef.current);

  return () => {
    observer.disconnect();
  };
}, [
  isMine,
  message.readAt,
  message.id,
  onRead,
]);

  const [dragDistance, setDragDistance] =
    useState(0);

  const [isDragging, setIsDragging] =
    useState(false);

  /* =========================================================
     POINTER DOWN
     ========================================================= */

  const handlePointerDown = (event) => {
    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
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
      currentX.current -
      startX.current;

    // Only allow movement toward the right.
    const rightSwipeDistance = Math.max(
      0,
      Math.min(distance, MAX_DRAG)
    );

    setDragDistance(
      rightSwipeDistance
    );
  };

  /* =========================================================
     FINISH SWIPE
     ========================================================= */

  const finishSwipe = () => {
    const distance =
      currentX.current -
      startX.current;

    const rightSwipeDistance = Math.max(
      0,
      Math.min(distance, MAX_DRAG)
    );

    if (
      rightSwipeDistance >=
      REPLY_THRESHOLD
    ) {
      onReply(message);

      if (
        typeof navigator !==
          "undefined" &&
        typeof navigator.vibrate ===
          "function"
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
        }`}
      style={{
        touchAction: "pan-y",
      }}>
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
          pointer-events-none"


        style={{
          opacity: replyIconOpacity,
        }}>
        ↩
      </span>

      {/* ===================================================
          MESSAGE BUBBLE
          =================================================== */}

      <div
        ref={messageRef}
        onPointerDown={
          handlePointerDown
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerUp={
          handlePointerUp
        }
        onPointerCancel={
          handlePointerCancel
        }
        className={`
          max-w-[80%]
          px-4 py-2
          rounded-2xl
          select-none
          ${
            isMine
              ? "bg-[#0f766e] text-[#FFFFFF] rounded-br-md"
              : "bg-[#eaf0ef] dark:bg-[#26322f] text-[#10201f] dark:text-[#FFFFFF] rounded-bl-md"
          }`}
        style={{
          transform: `translateX(${dragDistance}px)`,
          transition: isDragging
            ? "none"
            : "transform 0.2s ease",
          willChange: "transform",
        }}>
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
              }`}>
            <p
              className={`
                text-xs
                font-semibold
                ${
                  isMine
                    ? "text-[#FFFFFF]"
                    : "text-[#0f766e] dark:text-[#2dd4bf]"
                }`}>
              Reply
            </p>

            <p
              className={`
                text-xs
                truncate
                ${
                  isMine
                    ? "text-[#FFFFFF]"
                    : "text-[#566867] dark:text-[#aab8b5]"
                }`}>
              {message.replyTo.text}
            </p>
          </div>
        )}

        {/* Message text */}
        <p className="text-sm break-words">
          {message.text}

          {message.createdAt && (
            <span
            className={`
              mt-1
              flex
              items-center
              justify-end
              gap-1
              text-[10px]
              ${
                isMine
                  ? "text-[#FFFFFF]"
                  : "text-[#566867] dark:text-[#aab8b5]"
              }`}>
            <span>
              {message.createdAt
                .toDate()
                .toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }
                )}
            </span>

            {isMine && (
              <span
                className={`
                  text-[14px]
                  ${
                    message.readAt
                      ? "text-sky-300"
                      : ""
                  }
                `}
                aria-label={
                  message.readAt
                    ? "Read"
                    : message.deliveredAt
                    ? "Delivered"
                    : "Sent"
                }>
                {message.readAt
                  ? "✓✓"
                  : message.deliveredAt
                  ? "✓✓"
                  : "✓"}
              </span>
            )}
          </span>
          )}
        </p>
      </div>
    </div>
  );
}