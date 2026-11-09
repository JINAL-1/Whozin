
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

export async function registerForEvent(eventId) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to register for this event.");
  }

  const response = await fetch(
    `${API_URL}/api/registrations/${encodeURIComponent(eventId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.error || "Unable to register for this event."
    );
  }

  return result;
}
