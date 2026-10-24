import {
  onDisconnect,
  onValue,
  ref,
  set,
  serverTimestamp,
} from "firebase/database";

import { realtimeDb } from "./config";

export function trackUserPresence(uid) {
  const connectedRef = ref(realtimeDb, ".info/connected");
  const userStatusRef = ref(realtimeDb, `status/${uid}`);

  return onValue(connectedRef, async (snapshot) => {
    if (snapshot.val() === false) {
      return;
    }

    try {
      await onDisconnect(userStatusRef).set({
        online: false,
        lastSeen: serverTimestamp(),
      });

      await set(userStatusRef, {
        online: true,
        lastSeen: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error setting presence:", error);
    }
  });
}

export async function setUserOnline(uid) {
  const userStatusRef = ref(realtimeDb, `status/${uid}`);

  // Register disconnect behavior first
  await onDisconnect(userStatusRef).set({
    online: false,
    lastSeen: serverTimestamp(),
  });

  // Then mark the user as online
  await set(userStatusRef, {
    online: true,
    lastSeen: serverTimestamp(),
  });
}

export async function setUserOffline(uid) {
  const userStatusRef = ref(realtimeDb, `status/${uid}`);

  await set(userStatusRef, {
    online: false,
    lastSeen: serverTimestamp(),
  });
}

export function listenToUserStatus(uid, callback) {
  const userStatusRef = ref(realtimeDb, `status/${uid}`);

  return onValue(userStatusRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback({
        online: false,
        lastSeen: null,
      });

      return;
    }

    callback(snapshot.val());
  });
}

export async function setUserTyping(
  chatId,
  uid
) {
  if (!chatId || !uid) {
    return;
  }

  const typingRef = ref(
    realtimeDb,
    `typing/${chatId}/${uid}`
  );

  await onDisconnect(typingRef).remove();

  await set(typingRef, true);
}

export async function setUserNotTyping(
  chatId,
  uid
) {
  if (!chatId || !uid) {
    return;
  }

  const typingRef = ref(
    realtimeDb,
    `typing/${chatId}/${uid}`
  );

  await set(typingRef, false);
}

export function listenToTypingStatus(
  chatId,
  uid,
  callback
) {
  if (!chatId || !uid) {
    callback(false);
    return () => {};
  }

  const typingRef = ref(
    realtimeDb,
    `typing/${chatId}/${uid}`
  );

  return onValue(
    typingRef,
    (snapshot) => {
      callback(snapshot.val() === true);
    }
  );
}