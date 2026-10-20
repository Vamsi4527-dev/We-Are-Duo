import { useEffect, useState } from "react";
import { logoutUser } from "../firebase/auth";
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
import { setUserOffline } from "../firebase/presence";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

function ProfileAvatar({ profile, size = "w-11 h-11" }) {
  const displayName =
    profile?.fullName ||
    profile?.displayName ||
    profile?.email ||
    "?";

  const initial = displayName
    .charAt(0)
    .toUpperCase();

  if (profile?.photoURL) {
    return (
      <img
        src={profile.photoURL}
        alt={`${displayName} profile`}
        className={`
          ${size}
          rounded-full
          object-cover
          flex-shrink-0
          border border-[#d9e2e1] dark:border-[#303c39]
        `}
      />
    );
  }

  return (
    <div
      className={`
        ${size}
        rounded-full
        flex items-center justify-center
        flex-shrink-0
        bg-[#eaf0ef] dark:bg-[#26322f]
        border border-[#d9e2e1] dark:border-[#303c39]
        text-[#10201f] dark:text-white
        font-bold
      `}
    >
      {initial}
    </div>
  );
}

export default function Home({
  user,
  onOpenChat,
  onOpenProfile,
}) {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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
              const senderProfile =
                await getPublicUserProfile(
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
        setSearchError(
          "No users found with that name."
        );
        return;
      }

      setSearchResults(filteredResults);
    } catch (error) {
      console.error("User search failed:", error);
      setSearchError(
        "Unable to search for user. Please try again."
      );
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
        setRequestMessage(
          "Connection request sent."
        );
      } else if (result.reason === "already-pending") {
        setRequestMessage(
          "Connection request already pending."
        );
      } else if (
        result.reason === "already-connected"
      ) {
        setRequestMessage(
          "You are already connected with this user."
        );
      } else if (result.reason === "self-request") {
        setRequestMessage(
          "You cannot send a connection request to yourself."
        );
      }
    } catch (error) {
      console.error(
        "Connection request failed:",
        error
      );
      setRequestMessage(
        "Unable to send connection request."
      );
    } finally {
      setRequestLoading("");
    }
  };

  // Accept connection request with authorization
  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptConnectionRequest(
        requestId,
        user?.uid
      );
    } catch (error) {
      console.error(
        "Failed to accept connection request:",
        error
      );
    }
  };

  // Reject connection request with authorization
  const handleRejectRequest = async (requestId) => {
    try {
      await rejectConnectionRequest(
        requestId,
        user?.uid
      );
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
      if (user?.uid) {
        await setUserOffline(user.uid);
      }

      await logoutUser();
    } catch (error) {
      console.error(
        "Failed to log out:",
        error
      );
    }
  };

  return (
    <main
      className="
        min-h-screen
        bg-[#FFFFFF] dark:bg-[#0d1211]
        transition-colors duration-300
      "
    >
      {/* Home Header */}
      <header
        className="
          h-16
          bg-white dark:bg-[#111817]
          border-b border-[#d9e2e1] dark:border-[#303c39]
          px-4 sm:px-6
          flex items-center
          transition-colors duration-300
        "
      >
        {/* Logo */}
        <div className="min-w-0">
          <Logo size="base" />

          <p className="text-xs text-[#566867] dark:text-[#aab8b5]">
            conversations for two.
          </p>
        </div>

        {/* Header Controls */}
        <div className="ml-auto flex items-center gap-3">

          {/* Hamburger Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setMenuOpen(
                  (current) => !current
                )
              }
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="
                w-10 h-10
                rounded-lg
                flex items-center justify-center
                text-[#10201f] dark:text-white
                hover:bg-[#eaf0ef] dark:hover:bg-[#26322f]
                transition-colors duration-300
                cursor-pointer
              "
            >
              <span className="text-2xl leading-none">
                ☰
              </span>
            </button>

            {menuOpen && (
              <div
                className="
                  absolute right-0 top-12
                  w-44
                  rounded-xl
                  border border-[#d9e2e1] dark:border-[#303c39]
                  bg-white dark:bg-[#151c1b]
                  shadow-lg
                  p-2
                  z-50
                  transition-colors duration-300
                "
              >
                {/* Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="
                    w-full
                    flex items-center
                    px-3 py-2.5
                    rounded-lg
                    text-left
                    text-sm font-semibold
                    text-[#10201f] dark:text-white
                    hover:bg-[#eaf0ef] dark:hover:bg-[#26322f]
                    transition-colors duration-300
                    cursor-pointer
                  "
                >
                  👤
                  <span className="ml-3">
                    Profile
                  </span>
                </button>

                {/* Log out */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    w-full
                    flex items-center
                    px-3 py-2.5
                    rounded-lg
                    text-left
                    text-sm font-semibold
                    text-[#10201f] dark:text-white
                    hover:bg-[#eaf0ef] dark:hover:bg-[#26322f]
                    transition-colors duration-300
                    cursor-pointer
                  "
                >
                  🚪
                  <span className="ml-3">
                    Log out
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

        {/* Page Heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#10201f] dark:text-[#FFFFFF]">
            Contacts
          </h2>

          <p className="mt-1 text-xs text-[#566867] dark:text-[#aab8b5]">
            {profileLoading
              ? "Loading profile..."
              : `Welcome ${
                  profile?.fullName ||
                  user?.email
                }`}
          </p>
        </div>

        {/* Incoming Connection Requests */}
        {incomingRequestsLoading ? (
          <p className="mb-6 text-sm text-[#566867] dark:text-[#aab8b5]">
            Loading connection requests...
          </p>
        ) : incomingRequests.length > 0 ? (
          <div
            className="
              mb-6
              bg-white dark:bg-[#151c1b]
              border border-[#d9e2e1] dark:border-[#303c39]
              rounded-2xl
              p-5
              transition-colors duration-300
            "
          >
            <h3 className="text-lg font-bold text-[#10201f] dark:text-[#FFFFFF]">
              Connection Requests
            </h3>

            <div className="mt-3 space-y-3">
              {incomingRequests.map(
                (request) => (
                  <div
                    key={request.id}
                    className="
                      border border-[#d9e2e1] dark:border-[#303c39]
                      bg-white dark:bg-[#151c1b]
                      rounded-xl
                      p-4
                      flex items-center justify-between
                      gap-4
                      transition-colors duration-300
                    "
                  >
                    {/* Sender */}
                    <div className="flex items-center gap-3 min-w-0">
                      <ProfileAvatar
                        profile={
                          request.senderProfile
                        }
                        size="w-12 h-12"
                      />

                      <div className="min-w-0">
                        <p className="font-semibold text-[#10201f] dark:text-[#FFFFFF] truncate">
                          {request.senderProfile
                            ?.fullName ||
                            "Unknown user"}
                        </p>

                        <p className="text-sm text-[#566867] dark:text-[#aab8b5]">
                          Wants to connect with you.
                        </p>
                      </div>
                    </div>

                    {/* Request Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleAcceptRequest(
                            request.id
                          )
                        }
                        className="
                          px-3 py-2
                          rounded-lg
                          bg-[#0f766e]
                          text-[#FFFFFF]
                          text-xs font-semibold
                          hover:bg-[#0f766e]
                          transition-colors duration-300
                          cursor-pointer
                        "
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleRejectRequest(
                            request.id
                          )
                        }
                        className="
                          px-3 py-2
                          rounded-lg
                          bg-[#eaf0ef] dark:bg-[#26322f]
                          text-[#10201f] dark:text-[#FFFFFF]
                          text-xs font-semibold
                          hover:bg-[#d9e2e1] dark:hover:bg-[#26322f]
                          transition-colors duration-300
                          cursor-pointer
                        "
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ) : null}

        {/* Contacts */}
        <div
          className="
            mb-6
            bg-white dark:bg-[#151c1b]
            border border-[#d9e2e1] dark:border-[#303c39]
            rounded-2xl
            p-5
            transition-colors duration-300
          "
        >
          <h3 className="text-lg font-bold text-[#10201f] dark:text-[#FFFFFF]">
            Your Contacts
          </h3>

          {contactsLoading ? (
            <p className="mt-3 text-sm text-[#566867] dark:text-[#aab8b5]">
              Loading contacts...
            </p>
          ) : contacts.length === 0 ? (
            <p className="mt-3 text-sm text-[#566867] dark:text-[#aab8b5]">
              Your contacts will appear here.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="
                    border border-[#d9e2e1] dark:border-[#303c39]
                    bg-white dark:bg-[#151c1b]
                    rounded-xl
                    p-4
                    flex items-center justify-between
                    gap-4
                    transition-colors duration-300
                  "
                >
                  {/* Contact */}
                  <div className="flex items-center gap-3 min-w-0">
                    <ProfileAvatar
                      profile={
                        contact.contactProfile
                      }
                      size="w-12 h-12"
                    />

                    <div className="min-w-0">
                      <p className="font-semibold text-[#10201f] dark:text-[#FFFFFF] truncate">
                        {contact.contactProfile
                          ?.fullName ||
                          "Unknown user"}
                      </p>

                      <p className="text-sm text-[#566867] dark:text-[#aab8b5]">
                        Connected
                      </p>
                    </div>
                  </div>

                  {/* Chat */}
                  <button
                    type="button"
                    onClick={() =>
                      onOpenChat(
                        contact.contactProfile
                      )
                    }
                    className="
                      flex-shrink-0
                      px-3 py-2
                      rounded-lg
                      bg-[#0f766e]
                      hover:bg-[#0f766e]
                      text-[#FFFFFF]
                      text-xs font-semibold
                      transition-colors duration-300
                      cursor-pointer
                    "
                  >
                    Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Find Someone */}
        <div
          className="
            mb-6
            bg-white dark:bg-[#151c1b]
            border border-[#d9e2e1] dark:border-[#303c39]
            rounded-2xl
            p-5
            transition-colors duration-300
          "
        >
          <h3 className="text-lg font-bold text-[#10201f] dark:text-[#FFFFFF]">
            Find someone
          </h3>

          <p className="mt-1 text-sm text-[#566867] dark:text-[#aab8b5]">
            Search by name.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-4 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={searchName}
              onChange={(e) =>
                setSearchName(e.target.value)
              }
              placeholder="Enter name"
              className="
                min-w-0
                flex-1
                h-11
                px-4
                border border-[#b3c2c0] dark:border-[#46534f]
                rounded-[10px]
                bg-white dark:bg-[#101615]
                text-[#10201f] dark:text-[#FFFFFF]
                placeholder:text-[#566867]/60
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
              disabled={searchLoading}
              className="
                flex-shrink-0
                h-11
                px-5
                rounded-[10px]
                bg-[#0f766e]
                hover:bg-[#0f766e]
                text-[#FFFFFF]
                font-semibold
                transition-colors duration-300
                cursor-pointer
                disabled:opacity-70
                disabled:cursor-wait
              "
            >
              {searchLoading
                ? "Searching..."
                : "Search"}
            </button>
          </form>

          {searchError && (
            <p
              className="mt-3 text-sm text-[#b42318] dark:text-[#2dd4bf]"
              role="alert"
            >
              {searchError}
            </p>
          )}

          {searchResults.map((result) => (
            <div
              key={result.uid}
              className="
                mt-4
                border border-[#d9e2e1] dark:border-[#303c39]
                bg-white dark:bg-[#151c1b]
                rounded-xl
                p-4
                flex items-center justify-between
                gap-4
                transition-colors duration-300
              "
            >
              {/* Search Result */}
              <div className="flex items-center gap-3 min-w-0">
                <ProfileAvatar
                  profile={result}
                  size="w-11 h-11"
                />

                <div className="min-w-0">
                  <p className="font-semibold text-[#10201f] dark:text-[#FFFFFF] truncate">
                    {result.fullName}
                  </p>

                  <p className="text-sm text-[#566867] dark:text-[#aab8b5]">
                    User found
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleAddContact(result.uid)
                }
                disabled={
                  requestLoading === result.uid
                }
                className="
                  flex-shrink-0
                  text-xs
                  font-semibold
                  text-[#0f766e] dark:text-[#2dd4bf]
                  hover:text-[#0b5f58] dark:hover:text-[#0f766e]
                  disabled:opacity-50
                  cursor-pointer
                "
              >
                {requestLoading === result.uid
                  ? "Sending..."
                  : "Add"}
              </button>
            </div>
          ))}

          {requestMessage && (
            <p className="mt-3 text-sm text-[#0f766e] dark:text-[#2dd4bf]">
              {requestMessage}
            </p>
          )}
        </div>

        {/* Rejected Requests */}
        {rejectedRequests.length > 0 && (
          <div
            className="
              bg-white dark:bg-[#151c1b]
              border border-[#d9e2e1] dark:border-[#303c39]
              rounded-2xl
              p-5
              transition-colors duration-300
            "
          >
            <h3 className="text-lg font-bold text-[#10201f] dark:text-[#FFFFFF]">
              Rejected Requests
            </h3>

            <div className="mt-3 space-y-3">
              {rejectedRequests.map(
                (request) => (
                  <div
                    key={request.id}
                    className="
                      border border-[#d9e2e1] dark:border-[#303c39]
                      bg-white dark:bg-[#151c1b]
                      rounded-xl
                      p-4
                      transition-colors duration-300
                    "
                  >
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        profile={
                          request.otherUserProfile
                        }
                        size="w-11 h-11"
                      />

                      <div className="min-w-0">
                        <p className="font-semibold text-[#10201f] dark:text-[#FFFFFF]">
                          {request.otherUserProfile
                            ?.fullName ||
                            "Unknown user"}
                        </p>

                        <p className="text-sm text-[#566867] dark:text-[#aab8b5]">
                          Connection request rejected.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}