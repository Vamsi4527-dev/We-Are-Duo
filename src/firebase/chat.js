import {
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "./config";

export function getChatId(userId1, userId2) {
  return [userId1, userId2].sort().join("_");
}

export const MAX_MESSAGE_LENGTH = 2000;

export async function sendMessage(
  chatId,
  senderId,
  receiverId,
  text,
  replyTo = null
) {
  // Input validation
  if (!text || typeof text !== "string") {
    throw new Error("Message text is required.");
  }

  const trimmedText = text.trim();

  if (trimmedText.length === 0) {
    throw new Error("Message cannot be empty.");
  }

  if (trimmedText.length > MAX_MESSAGE_LENGTH) {
    throw new Error(
      `Message exceeds maximum limit of ${MAX_MESSAGE_LENGTH} characters.`
    );
  }

  // Verify chat ID integrity
  const expectedChatId = getChatId(senderId, receiverId);

  if (chatId !== expectedChatId) {
    throw new Error("Invalid chat session ID.");
  }

  const chatRef = doc(db, "chats", chatId);

  const messagesRef = collection(
    db,
    "chats",
    chatId,
    "messages"
  );

  const messageRef = doc(messagesRef);

  const messageData = {
  senderId,
  text: trimmedText,
  createdAt: serverTimestamp(),
  deliveredAt: null,
  readAt: null,
};

  // Add sanitized reply information only when replying to a message
  if (replyTo && replyTo.messageId && replyTo.text) {
    messageData.replyTo = {
      messageId: String(replyTo.messageId).slice(0, 100),
      senderId: String(replyTo.senderId).slice(0, 100),
      text: String(replyTo.text).slice(0, MAX_MESSAGE_LENGTH),
    };
  }

  // Write chat + message together
  const batch = writeBatch(db);

  batch.set(
  chatRef,
  {
    participants: [senderId, receiverId].sort(),
    [`unreadCount_${receiverId}`]: increment(1),
  },
  { merge: true }
);

  batch.set(messageRef, messageData);

  await batch.commit();
}


export async function markMessageDelivered(chatId, messageId) {
  if (!chatId || !messageId) {
    throw new Error("Chat ID and message ID are required.");
  }

  const messageRef = doc(
    db,
    "chats",
    chatId,
    "messages",
    messageId
  );

  await updateDoc(messageRef, {
    deliveredAt: serverTimestamp(),
  });
}

export async function markMessageRead(chatId, messageId) {
  if (!chatId || !messageId) {
    throw new Error("Chat ID and message ID are required.");
  }

  const messageRef = doc(
    db,
    "chats",
    chatId,
    "messages",
    messageId
  );

  await updateDoc(messageRef, {
    readAt: serverTimestamp(),
  });
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

export async function markChatAsRead(chatId, uid) {
  if (!chatId || !uid) {
    throw new Error("Chat ID and user ID are required.");
  }

  const chatRef = doc(db, "chats", chatId);

  await updateDoc(chatRef, {
    [`unreadCount_${uid}`]: 0,
  });
}

export function listenToChatUnreadCount(chatId, uid, callback) {
  if (!chatId || !uid) {
    callback(0);
    return () => {};
  }

  const chatRef = doc(db, "chats", chatId);

  return onSnapshot(chatRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(0);
      return;
    }

    const data = snapshot.data();

    callback(data[`unreadCount_${uid}`] || 0);
  });
}