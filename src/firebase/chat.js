import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "./config";

export function getChatId(userId1, userId2) {
  return [userId1, userId2].sort().join("_");
}

export async function sendMessage(
  chatId,
  senderId,
  receiverId,
  text,
  replyTo = null
) {
  const chatRef = doc(db, "chats", chatId);

  await setDoc(
    chatRef,
    {
      participants: [senderId, receiverId].sort(),
    },
    { merge: true }
  );

  const messagesRef = collection(
    db,
    "chats",
    chatId,
    "messages"
  );

  const messageData = {
    senderId,
    text: text.trim(),
    createdAt: serverTimestamp(),
  };

  // Add reply information only when replying to a message
  if (replyTo) {
    messageData.replyTo = {
      messageId: replyTo.messageId,
      senderId: replyTo.senderId,
      text: replyTo.text,
    };
  }

  await addDoc(messagesRef, messageData);
}

export function listenToMessages(chatId, callback) {
  const messagesRef = collection(
    db,
    "chats",
    chatId,
    "messages"
  );

  const messagesQuery = query(
    messagesRef,
    orderBy("createdAt", "asc")
  );

  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    callback(messages);
  });
}