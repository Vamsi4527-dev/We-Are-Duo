import {
  onDisconnect,
  onValue,
  ref,
  set,
  serverTimestamp,
} from "firebase/database";

import { realtimeDb } from "./config";

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