import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "./config";

export async function createUserProfile(user) {
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName: user.displayName || "",
    email: user.email || "",
    createdAt: serverTimestamp(),
    online: false,
    lastSeen: serverTimestamp(),
  });

  await setDoc(doc(db, "publicProfiles", user.uid), {
    uid: user.uid,
    fullName: user.displayName || "",
    fullNameLower: (user.displayName || "").toLowerCase().trim(),
  });
}

export async function getUserProfile(uid) {
  const userRef = doc(db, "users", uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    return null;
  }

  return userSnapshot.data();
}

export async function findUserByEmail(email) {
  const usersRef = collection(db, "users");

  const usersQuery = query(
    usersRef,
    where("email", "==", email.toLowerCase().trim())
  );

  const querySnapshot = await getDocs(usersQuery);

  if (querySnapshot.empty) {
    return null;
  }

  return querySnapshot.docs[0].data();
}

export async function searchUsersByName(name) {
  const profilesRef = collection(db, "publicProfiles");

  const searchName = name.toLowerCase().trim();

  const profilesQuery = query(
    profilesRef,
    where("fullNameLower", "==", searchName)
  );

  const querySnapshot = await getDocs(profilesQuery);

  return querySnapshot.docs.map((document) => document.data());
}

export async function sendConnectionRequest(senderId, receiverId) {
  const requestsRef = collection(db, "connectionRequests");

  const existingQuery = query(
    requestsRef,
    where("senderId", "==", senderId),
    where("receiverId", "==", receiverId),
    where("status", "==", "pending")
  );

  const existingSnapshot = await getDocs(existingQuery);

  if (!existingSnapshot.empty) {
    return {
      success: false,
      reason: "already-pending",
    };
  }

  await addDoc(requestsRef, {
    senderId,
    receiverId,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return {
    success: true,
  };
}

export async function getIncomingConnectionRequests(userId) {
  const requestsRef = collection(db, "connectionRequests");

  const requestsQuery = query(
    requestsRef,
    where("receiverId", "==", userId),
    where("status", "==", "pending")
  );

  const querySnapshot = await getDocs(requestsQuery);

  return querySnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export function listenToIncomingConnectionRequests(userId, callback) {
  const requestsRef = collection(db, "connectionRequests");

  const requestsQuery = query(
    requestsRef,
    where("receiverId", "==", userId),
    where("status", "==", "pending")
  );

  return onSnapshot(requestsQuery, (snapshot) => {
    const requests = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    callback(requests);
  });
}

export async function acceptConnectionRequest(requestId) {
  const requestRef = doc(db, "connectionRequests", requestId);

  await setDoc(
    requestRef,
    {
      status: "accepted",
    },
    { merge: true }
  );
}

export async function rejectConnectionRequest(requestId) {
  const requestRef = doc(db, "connectionRequests", requestId);

  await setDoc(
    requestRef,
    {
      status: "rejected",
    },
    { merge: true }
  );
}

export async function getPublicUserProfile(uid) {
  const profileRef = doc(db, "publicProfiles", uid);
  const profileSnapshot = await getDoc(profileRef);

  if (!profileSnapshot.exists()) {
    return null;
  }

  return profileSnapshot.data();
}

export function listenToAcceptedConnections(userId, callback) {
  const requestsRef = collection(db, "connectionRequests");

  const sentQuery = query(
    requestsRef,
    where("senderId", "==", userId),
    where("status", "==", "accepted")
  );

  const receivedQuery = query(
    requestsRef,
    where("receiverId", "==", userId),
    where("status", "==", "accepted")
  );

  let sentRequests = [];
  let receivedRequests = [];

  const updateContacts = async () => {
    const allRequests = [...sentRequests, ...receivedRequests];

    const contacts = await Promise.all(
      allRequests.map(async (request) => {
        const contactId =
          request.senderId === userId
            ? request.receiverId
            : request.senderId;

        const profile = await getPublicUserProfile(contactId);

        return {
          ...request,
          contactId,
          contactProfile: profile,
        };
      })
    );

    callback(contacts);
  };

  const unsubscribeSent = onSnapshot(sentQuery, (snapshot) => {
    sentRequests = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    updateContacts();
  });

  const unsubscribeReceived = onSnapshot(receivedQuery, (snapshot) => {
    receivedRequests = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    updateContacts();
  });

  return () => {
    unsubscribeSent();
    unsubscribeReceived();
  };
}

export function listenToRejectedConnections(userId, callback) {
  const requestsRef = collection(db, "connectionRequests");

  const sentQuery = query(
    requestsRef,
    where("senderId", "==", userId),
    where("status", "==", "rejected")
  );

  const receivedQuery = query(
    requestsRef,
    where("receiverId", "==", userId),
    where("status", "==", "rejected")
  );

  let sentRequests = [];
  let receivedRequests = [];

  const updateRejected = async () => {
    const allRequests = [...sentRequests, ...receivedRequests];

    const rejected = await Promise.all(
      allRequests.map(async (request) => {
        const otherUserId =
          request.senderId === userId
            ? request.receiverId
            : request.senderId;

        const profile = await getPublicUserProfile(otherUserId);

        return {
          ...request,
          otherUserProfile: profile,
        };
      })
    );

    callback(rejected);
  };

  const unsubscribeSent = onSnapshot(sentQuery, (snapshot) => {
    sentRequests = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    updateRejected();
  });

  const unsubscribeReceived = onSnapshot(receivedQuery, (snapshot) => {
    receivedRequests = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    updateRejected();
  });

  return () => {
    unsubscribeSent();
    unsubscribeReceived();
  };
}