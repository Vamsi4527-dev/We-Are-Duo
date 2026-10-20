const IMAGE_UPLOAD_URL =
  "https://soft-hall-e0c3.ramkhangutamaneni1234.workers.dev";

export async function uploadProfilePicture(file) {
  if (!file) {
    throw new Error("Please select an image.");
  }

  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(IMAGE_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Image upload failed.");
  }

  if (!data.url) {
    throw new Error("Image URL was not returned.");
  }

  return data.url;
}
