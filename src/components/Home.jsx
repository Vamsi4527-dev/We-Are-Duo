import { useEffect, useState } from "react";
import { logoutUser } from "../firebase/auth";
import { setUserOffline } from "../firebase/presence";
import {
  getUserProfile,
  searchUsersByName,
  sendConnectionRequest,
  getPublicUserProfile,
  acceptConnectionRequest,
  rejectConnectionRequest,
  listenToIncomingConnectionRequests,
  listenToAcceptedConnections,
  listenToRejectedConnections,
} from "../firebase/users";
import Logo from "./Logo";
import { listenToUserStatus } from "../firebase/presence";

export default function Home({ user, onOpenChat }) {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [requestLoading, setRequestLoading] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [incomingRequestsLoading, setIncomingRequestsLoading] =
    useState(true);

  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);

  const [contactStatuses, setContactStatuses] = useState({});
  const [rejectedRequests, setRejectedRequests] = useState([]);

  // Load current user's profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        setProfileLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // Listen for incoming connection requests
  useEffect(() => {
    if (!user?.uid) {
      setIncomingRequestsLoading(false);
      return;
    }

    setIncomingRequestsLoading(true);

    const unsubscribe = listenToIncomingConnectionRequests(
      user.uid,
      async (requests) => {
        try {
          const requestsWithProfiles = await Promise.all(
            requests.map(async (request) => {
              const senderProfile = await getPublicUserProfile(
                request.senderId
              );

              return {
                ...request,
                senderProfile,
              };
            })
          );

          setIncomingRequests(requestsWithProfiles);
        } catch (error) {
          console.error(
            "Failed to load incoming connection requests:",
            error
          );
        } finally {
          setIncomingRequestsLoading(false);
        }
      }
    );

    return unsubscribe;
  }, [user]);

  // Listen for accepted contacts
  useEffect(() => {
    if (!user?.uid) {
      setContactsLoading(false);
      return;
    }

    setContactsLoading(true);

    const unsubscribe = listenToAcceptedConnections(
      user.uid,
      (acceptedContacts) => {
        setContacts(acceptedContacts);
        setContactsLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  // Listen for rejected connection requests
  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const unsubscribe = listenToRejectedConnections(
      user.uid,
      (rejected) => {
        setRejectedRequests(rejected);
      }
    );

    return unsubscribe;
  }, [user]);

  // Listen for online/offline status of every contact
  useEffect(() => {
    const unsubscribers = contacts.map((contact) => {
      const contactUid = contact.contactProfile?.uid;

      if (!contactUid) {
        return null;
      }

      return listenToUserStatus(contactUid, (status) => {
        setContactStatuses((currentStatuses) => ({
          ...currentStatuses,
          [contactUid]: status,
        }));
      });
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, [contacts]);

  // Search users
  const handleSearch = async (e) => {
    e.preventDefault();

    setSearchError("");
    setSearchResults([]);

    const name = searchName.trim();

    if (!name) {
      setSearchError("Enter a name.");
      return;
    }

    try {
      setSearchLoading(true);

      const results = await searchUsersByName(name);

      const filteredResults = results.filter(
        (result) => result.uid !== user?.uid
      );

      if (filteredResults.length === 0) {
        setSearchError("No users found with that name.");
        return;
      }

      setSearchResults(filteredResults);
    } catch (error) {
      console.error("User search failed:", error);
      setSearchError("Unable to search for user. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Send connection request
  const handleAddContact = async (receiverId) => {
    setRequestMessage("");

    try {
      setRequestLoading(receiverId);

      const result = await sendConnectionRequest(
        user.uid,
        receiverId
      );

      if (result.success) {
        setRequestMessage("Connection request sent.");
      } else if (result.reason === "already-pending") {
        setRequestMessage("Connection request already sent.");
      }
    } catch (error) {
      console.error("Connection request failed:", error);
      setRequestMessage("Unable to send connection request.");
    } finally {
      setRequestLoading("");
    }
  };

  // Accept connection request
  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptConnectionRequest(requestId);
    } catch (error) {
      console.error(
        "Failed to accept connection request:",
        error
      );
    }
  };

  // Reject connection request
  const handleRejectRequest = async (requestId) => {
    try {
      await rejectConnectionRequest(requestId);
    } catch (error) {
      console.error(
        "Failed to reject connection request:",
        error
      );
    }
  };

  // Log out
  const handleLogout = async () => {
  try {
    await setUserOffline(user.uid);
    await logoutUser();
  } catch (error) {
    console.error("Failed to log out:", error);
  }
};

  return (
    <main className="min-h-screen bg-[#f3f6f6]">
      <header className="h-16 bg-white border-b border-[#d9e2e1] px-4 sm:px-6 flex items-center justify-between">
        <div>

          <Logo size="base"/>

          <p className="text-xs text-[#566867]">
            conversations for two.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-[#eaf0ef] text-[#10201f] text-sm font-semibold hover:bg-[#d9e2e1] transition cursor-pointer"
        >
          Log out
        </button>
      </header>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#10201f]">
            Contacts
          </h2>

          <p className="mt-1 text-xs text-[#566867]">
            {profileLoading
              ? "Loading profile..."
              : `Welcome ${profile?.fullName || user?.email}`}
          </p>
        </div>

        {/* Incoming connection requests */}
        {incomingRequestsLoading ? (
          <p className="mb-6 text-sm text-[#566867]">
            Loading connection requests...
          </p>
        ) : incomingRequests.length > 0 ? (
          <div className="mb-6 bg-white border border-[#d9e2e1] rounded-2xl p-5">
            <h3 className="text-lg font-bold text-[#10201f]">
              Connection Requests
            </h3>

            <div className="mt-3 space-y-3">
              {incomingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-[#d9e2e1] rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-[#10201f]">
                      {request.senderProfile?.fullName ||
                        "Unknown user"}
                    </p>

                    <p className="text-sm text-[#566867]">
                      Wants to connect with you.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleAcceptRequest(request.id)
                      }
                      className="px-3 py-2 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-[#0b5f58] transition"
                    >
                      Accept
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleRejectRequest(request.id)
                      }
                      className="px-3 py-2 rounded-lg bg-[#eaf0ef] text-[#10201f] text-xs font-semibold hover:bg-[#d9e2e1] transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Contacts */}
        <div className="mb-6 bg-white border border-[#d9e2e1] rounded-2xl p-5">
          <h3 className="text-lg font-bold text-[#10201f]">
            Your Contacts
          </h3>

          {contactsLoading ? (
            <p className="mt-3 text-sm text-[#566867]">
              Loading contacts...
            </p>
          ) : contacts.length === 0 ? (
            <p className="mt-3 text-sm text-[#566867]">
              Your contacts will appear here.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border border-[#d9e2e1] rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-semibold text-[#10201f]">
                      {contact.contactProfile?.fullName ||
                        "Unknown user"}
                    </p>

                    <p className="text-sm text-[#566867]">
                      {contactStatuses[
                        contact.contactProfile?.uid
                      ]?.online
                        ? "Online"
                        : "Offline"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenChat(contact.contactProfile)
                    }
                    className="px-3 py-2 rounded-lg bg-teal-700 hover:bg-[#0b5f58] text-white text-xs font-semibold transition"
                  >
                    Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Find someone */}
        <div className="mb-6 bg-white border border-[#d9e2e1] rounded-2xl p-5">
          <h3 className="text-lg font-bold text-[#10201f]">
            Find someone
          </h3>

          <p className="mt-1 text-sm text-[#566867]">
            Search by name.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-4 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Enter name"
              className="flex-1 h-11 px-4 border border-[#b3c2c0] rounded-[10px] bg-white text-[#10201f] placeholder:text-[#566867]/60 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition"
            />

            <button
              type="submit"
              disabled={searchLoading}
              className="h-11 px-5 rounded-[10px] bg-teal-700 hover:bg-[#0b5f58] text-white font-semibold transition cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              {searchLoading ? "Searching..." : "Search"}
            </button>
          </form>

          {searchError && (
            <p
              className="mt-3 text-sm text-[#b42318]"
              role="alert"
            >
              {searchError}
            </p>
          )}

          {searchResults.map((result) => (
            <div
              key={result.uid}
              className="mt-4 border border-[#d9e2e1] rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold text-[#10201f]">
                  {result.fullName}
                </p>

                <p className="text-sm text-[#566867]">
                  User found
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleAddContact(result.uid)}
                disabled={requestLoading === result.uid}
                className="text-xs font-semibold text-teal-700 hover:text-[#0b5f58] disabled:opacity-50"
              >
                {requestLoading === result.uid
                  ? "Sending..."
                  : "Add"}
              </button>
            </div>
          ))}

          {requestMessage && (
            <p className="mt-3 text-sm text-teal-700">
              {requestMessage}
            </p>
          )}
        </div>

        {/* Rejected requests */}
        {rejectedRequests.length > 0 && (
          <div className="bg-white border border-[#d9e2e1] rounded-2xl p-5">
            <h3 className="text-lg font-bold text-[#10201f]">
              Rejected Requests
            </h3>

            <div className="mt-3 space-y-3">
              {rejectedRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-[#d9e2e1] rounded-xl p-4"
                >
                  <p className="font-semibold text-[#10201f]">
                    {request.otherUserProfile?.fullName ||
                      "Unknown user"}
                  </p>

                  <p className="text-sm text-[#566867]">
                    Connection request rejected.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}