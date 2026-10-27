
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== "false";

export async function createEvent(eventData) {
  if (DEMO_MODE) {
    return {
      demo: true,
      event: {
        ...eventData,
        id: "demo-event",
      },
    };
  }

  const response = await fetch(`${API_URL}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(eventData),
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(result.message || "Unable to publish event.");
  }

  return {
    demo: false,
    event: result.event || result,
  };
}
