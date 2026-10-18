import { useEffect, useState } from "react";
import {
  getChatId,
  listenToMessages,
  sendMessage,
} from "../firebase/chat";

export default function Chat({ user, contact, onBack }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const chatId = getChatId(user.uid, contact.uid);

  useEffect(() => {
    const unsubscribe = listenToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
    });

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

      await sendMessage(chatId, user.uid, contact.uid, text);

      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f6f6] flex flex-col">
      <header className="h-16 bg-white border-b border-[#d9e2e1] px-4 sm:px-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-lg bg-[#eaf0ef] text-[#10201f] font-semibold hover:bg-[#d9e2e1] transition cursor-pointer"
        >
          ←
        </button>

        <div>
          <h1 className="text-lg font-bold text-[#10201f]">
            {contact.fullName}
          </h1>

          <p className="text-xs text-[#566867]">
            Private conversation
          </p>
        </div>
      </header>

      <section className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-5">
        <div className="min-h-[calc(100vh-150px)] bg-white border border-[#d9e2e1] rounded-2xl p-4 flex flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full grid place-items-center">
                <p className="text-sm text-[#566867]">
                  No messages yet. Start the conversation.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isMine = message.senderId === user.uid;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        isMine
                          ? "bg-teal-700 text-white rounded-br-md"
                          : "bg-[#eaf0ef] text-[#10201f] rounded-bl-md"
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

          <form
            onSubmit={handleSendMessage}
            className="mt-4 flex gap-2"
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-11 px-4 border border-[#b3c2c0] rounded-xl bg-white text-[#10201f] placeholder:text-[#566867]/60 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent"
            />

            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="h-11 px-5 rounded-xl bg-teal-700 hover:bg-[#0b5f58] text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "..." : "Send"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}