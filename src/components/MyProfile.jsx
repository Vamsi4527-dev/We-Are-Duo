import { useEffect, useState } from "react";
import {
  getUserProfile,
  updateUserPhoto,
} from "../firebase/users";
import { uploadProfilePicture } from "../firebase/imageUpload";

export default function MyProfile({ user, onBack }) {
  const [photoURL, setPhotoURL] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    async function loadProfile() {
      try {
        const profile = await getUserProfile(user.uid);

        setPhotoURL(profile?.photoURL || "");
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    }

    loadProfile();
  }, [user]);

  async function handleUpload() {
    if (!selectedFile || !user?.uid) {
      return;
    }

    try {
      setUploading(true);

      const uploadedPhotoURL =
        await uploadProfilePicture(selectedFile);

      await updateUserPhoto(
        user.uid,
        uploadedPhotoURL
      );

      setPhotoURL(uploadedPhotoURL);
      setSelectedFile(null);
    } catch (error) {
      console.error(
        "Failed to upload profile picture:",
        error
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    if (!user?.uid || !photoURL) {
      return;
    }

    try {
      setRemoving(true);

      await updateUserPhoto(user.uid, "");

      setPhotoURL("");
    } catch (error) {
      console.error(
        "Failed to remove profile picture:",
        error
      );
    } finally {
      setRemoving(false);
    }
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#FFFFFF] dark:bg-[#0d1211]
        px-4 py-6
        transition-colors duration-300
      "
    >
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={onBack}
            className="
              px-4 py-2
              rounded-lg
              bg-[#eaf0ef] dark:bg-[#26322f]
              text-[#10201f] dark:text-white
              text-sm font-semibold
              hover:bg-[#d9e2e1] dark:hover:bg-[#303c39]
              transition-colors duration-300
              cursor-pointer
            "
          >
            ← Back
          </button>

          <h1
            className="
              text-xl font-bold
              text-[#10201f] dark:text-white
            "
          >
            My Profile
          </h1>

          <div className="w-[72px]" />
        </div>

        {/* Profile Card */}
        <div
          className="
            rounded-2xl
            border border-[#d9e2e1] dark:border-[#303c39]
            bg-white dark:bg-[#151c1b]
            p-6
            transition-colors duration-300
          "
        >

          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="
                  w-28 h-28
                  rounded-full
                  object-cover
                  border border-[#d9e2e1] dark:border-[#303c39]
                "
              />
            ) : (
              <div
                className="
                  w-28 h-28
                  rounded-full
                  bg-[#eaf0ef] dark:bg-[#26322f]
                  border border-[#d9e2e1] dark:border-[#303c39]
                  flex items-center justify-center
                  text-4xl font-bold
                  text-[#566867] dark:text-[#aab8b5]
                "
              >
                {(user?.displayName || user?.email || "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          {/* Choose Photo */}
          <div className="mt-4">

            {/* Hidden File Input */}
            <input
              id="profile-photo-input"
              type="file"
              accept="image/*"
              onChange={(event) => {
                setSelectedFile(
                  event.target.files?.[0] || null
                );
              }}
              className="hidden"
            />

            {/* Styled File Button */}
            <label
              htmlFor="profile-photo-input"
              className="
                w-full
                h-11
                rounded-lg
                border border-[#d9e2e1] dark:border-[#303c39]
                bg-[#eaf0ef] dark:bg-[#26322f]
                text-[#10201f] dark:text-white
                text-sm font-semibold
                flex items-center justify-center
                hover:bg-[#d9e2e1] dark:hover:bg-[#303c39]
                transition-colors duration-300
                cursor-pointer
              "
            >
              📷 Choose Photo
            </label>

            {/* Selected File Name */}
            {selectedFile && (
              <p
                className="
                  mt-2
                  text-xs
                  text-center
                  text-[#566867] dark:text-[#aab8b5]
                  truncate
                "
                title={selectedFile.name}
              >
                {selectedFile.name}
              </p>
            )}
          </div>

          {/* Upload Photo */}
          {selectedFile && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="
                mt-4
                w-full
                rounded-lg
                bg-[#10201f]
                dark:bg-white
                px-4 py-2.5
                text-sm font-semibold
                text-white
                dark:text-[#10201f]
                hover:opacity-90
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition-opacity duration-300
                cursor-pointer
              "
            >
              {uploading
                ? "Uploading..."
                : "Upload Photo"}
            </button>
          )}

          {/* Remove Photo */}
          {photoURL && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={removing}
              className="
                mt-3
                w-full
                rounded-lg
                border border-[#d9e2e1] dark:border-[#303c39]
                bg-white dark:bg-[#151c1b]
                px-4 py-2.5
                text-sm font-semibold
                text-[#10201f] dark:text-white
                hover:bg-[#eaf0ef] dark:hover:bg-[#26322f]
                disabled:opacity-50
                disabled:cursor-not-allowed
                transition-colors duration-300
                cursor-pointer
              "
            >
              {removing
                ? "Removing..."
                : "Remove Photo"}
            </button>
          )}

          {/* Name */}
          <div className="mt-6 mb-5">
            <p
              className="
                text-xs font-semibold
                text-[#566867] dark:text-[#aab8b5]
              "
            >
              Name
            </p>

            <p
              className="
                mt-1
                text-base font-semibold
                text-[#10201f] dark:text-white
              "
            >
              {user?.displayName || "Not set"}
            </p>
          </div>

          {/* Email */}
          <div>
            <p
              className="
                text-xs font-semibold
                text-[#566867] dark:text-[#aab8b5]
              "
            >
              Email
            </p>

            <p
              className="
                mt-1
                text-base font-semibold
                text-[#10201f] dark:text-white
                break-all
              "
            >
              {user?.email || "Not available"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}