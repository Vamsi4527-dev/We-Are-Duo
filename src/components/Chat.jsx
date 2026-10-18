import { useEffect, useState } from "react";
import {
  getChatId,
  listenToMessages,
  sendMessage,
} from "../firebase/chat";
import { listenToUserStatus } from "../firebase/presence";
import ThemeToggle from "./ThemeToggle";

export default function Chat({ user, contact, onBack }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const [contactStatus, setContactStatus] = useState({
    online: false,
    lastSeen: null,
  });

  const chatId = getChatId(user.uid, contact.uid);

  useEffect(() => {
    const unsubscribe = listenToUserStatus(
      contact.uid,
      (status) => {
        setContactStatus(status);
      }
    );

    return unsubscribe;
  }, [contact.uid]);

  useEffect(() => {
    const unsubscribe = listenToMessages(
      chatId,
      (newMessages) => {
        setMessages(newMessages);
      }
    );

    return unsubscribe;
  }, [chatId]);

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
        text
      );

      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f6f6] dark:bg-[#0d1211] text-[#10201f] dark:text-white flex flex-col transition-colors duration-300">

      {/* Chat Header */}
      <header
        className="h-16 bg-white dark:bg-[#111817] border-b
        border-[#d9e2e1] dark:border-[#293432]
        px-4 sm:px-6 flex items-center justify-between
        transition-colors duration-300"
      >
        {/* Left side */}
        <div className="flex items-center gap-3 min-w-0">

          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex-shrink-0 w-10 h-10 rounded-lg
            bg-[#eaf0ef] dark:bg-[#202a28]
            text-[#10201f] dark:text-white
            font-semibold
            hover:bg-[#d9e2e1] dark:hover:bg-[#2c3936]
            transition-colors duration-200 cursor-pointer"
          >
            ←
          </button>

          <div className="min-w-0">
            <h1
              className="text-lg font-bold truncate
              text-[#10201f] dark:text-white
              transition-colors duration-300"
            >
              {contact.fullName}
            </h1>

            <p
              className={`text-xs font-medium transition-colors duration-300 ${
                contactStatus.online
                  ? "text-teal-700 dark:text-teal-400"
                  : "text-[#566867] dark:text-[#aab8b5]"
              }`}
            >
              {contactStatus.online
                ? "● Online"
                : "● Offline"}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <ThemeToggle />
        </div>
      </header>

      {/* Chat Area */}
      <section
        className="flex-1 max-w-3xl w-full mx-auto
        px-4 sm:px-6 py-5"
      >
        <div
          className="min-h-[calc(100vh-150px)]
          bg-white dark:bg-[#151c1b]
          border border-[#d9e2e1] dark:border-[#303c39]
          rounded-2xl p-4 flex flex-col
          shadow-sm dark:shadow-none
          transition-colors duration-300"
        >
          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto">

            {messages.length === 0 ? (
              <div className="h-full grid place-items-center">
                <p
                  className="text-sm
                  text-[#566867] dark:text-[#aab8b5]
                  transition-colors duration-300"
                >
                  No messages yet. Start the conversation.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isMine =
                  message.senderId === user.uid;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isMine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%]
                      px-4 py-2 rounded-2xl
                      transition-colors duration-300 ${
                        isMine
                          ? "bg-teal-700 text-white rounded-br-md"
                          : "bg-[#eaf0ef] dark:bg-[#26322f] text-[#10201f] dark:text-white rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm break-words">
                        {message.text}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className="mt-4 flex gap-2"
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) =>
                setMessageText(e.target.value)
              }
              placeholder="Type a message..."
              className="min-w-0 flex-1 h-11 px-4
              border border-[#b3c2c0]
              dark:border-[#46534f]
              rounded-xl
              bg-white dark:bg-[#101615]
              text-[#10201f] dark:text-white
              placeholder:text-[#566867]
              dark:placeholder:text-[#7f908b]
              focus:outline-none
              focus:ring-2 focus:ring-teal-700
              focus:border-transparent
              transition-colors duration-300"
            />

            <button
              type="submit"
              disabled={
                sending || !messageText.trim()
              }
              className="flex-shrink-0 h-11 px-5
              rounded-xl
              bg-teal-700
              hover:bg-[#0b5f58]
              text-white font-semibold
              transition-all duration-200
              disabled:opacity-50
              disabled:cursor-not-allowed"
            >
              {sending ? "..." : "Send"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}