const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

// Sends a request about the logged-in attendee's registration for one event.
async function registrationRequest(eventId, method, fallbackError) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to register for this event.");
  }

  let response;

  try {
    response = await fetch(
      `${API_URL}/api/registrations/${encodeURIComponent(eventId)}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch {
    throw new Error("We couldn't reach the server. Check your connection and try again.");
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(result.error || fallbackError);
    error.status = response.status;
    throw error;
  }

  return result;
}

export function registerForEvent(eventId) {
  return registrationRequest(eventId, "POST", "Unable to register for this event.");
}

// Resolves to true if the logged-in attendee is registered for the event.
export async function getRegistrationStatus(eventId) {
  const result = await registrationRequest(
    eventId,
    "GET",
    "Unable to check your registration."
  );
  return Boolean(result.registered);
}

export function cancelRegistration(eventId) {
  return registrationRequest(
    eventId,
    "DELETE",
    "Unable to cancel your registration."
  );
}
