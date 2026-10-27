
import { useState } from "react";
import { createEvent } from "../services/eventApi";
import "../styles/CreateEvent.css";

const initialForm = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  image: "",
  ticketType: "free",
};

export function validateEvent(form) {
  const errors = {};

  if (!form.title.trim()) {
    errors.title = "Event title is required.";
  }

  if (!form.description.trim()) {
    errors.description = "Description is required.";
  }

  if (!form.date) {
    errors.date = "Event date is required.";
  } else {
    const today = new Date();
    const localToday = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    if (form.date < localToday) {
      errors.date = "Event date cannot be in the past.";
    }
  }

  if (!form.time) {
    errors.time = "Event time is required.";
  }

  if (!form.location.trim()) {
    errors.location = "Location is required.";
  }

  if (!["free", "paid"].includes(form.ticketType)) {
    errors.ticketType = "Select a valid ticket option.";
  }

  if (form.image.trim()) {
    try {
      const url = new URL(form.image);
      if (!["http:", "https:"].includes(url.protocol)) {
        errors.image = "Enter a valid HTTP or HTTPS image URL.";
      }
    } catch {
      errors.image = "Enter a valid image URL.";
    }
  }

  return errors;
}

export default function CreateEvent() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setMessage("");
    setStatus("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateEvent(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatus("error");
      setMessage("Please correct the highlighted fields.");
      return;
    }

    setLoading(true);
    setMessage("");
    setStatus("");

    try {
      const result = await createEvent(form);

      setStatus("success");
      setMessage(
        result.demo
          ? "Demo successful! The form is valid, but the event was not saved to the database."
          : "Event published successfully!"
      );

      if (!result.demo) {
        setForm(initialForm);
      }
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Unable to create event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="create-event-page">
      <div className="create-event-container">
        <header className="create-event-header">
          <span className="create-event-eyebrow">WHOZIN EVENTS</span>
          <h1>Create an Event</h1>
          <p>
            Share your event with the Thunder Bay community.
            Fill out the information below to get started.
          </p>
        </header>

        <form
          className="create-event-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="form-section-title">
            <h2>Event details</h2>
            <p>Fields marked with * are required.</p>
          </div>

          <div className="form-field">
            <label htmlFor="title">Event title *</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g. Thunder Bay Music Night"
              value={form.title}
              onChange={handleChange}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <span id="title-error" className="field-error">
                {errors.title}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              rows="5"
              placeholder="Tell people what your event is about..."
              value={form.description}
              onChange={handleChange}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="date">Event date *</label>
              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                aria-invalid={Boolean(errors.date)}
              />
              {errors.date && (
                <span className="field-error">{errors.date}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="time">Start time *</label>
              <input
                id="time"
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                aria-invalid={Boolean(errors.time)}
              />
              {errors.time && (
                <span className="field-error">{errors.time}</span>
              )}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="location">Location *</label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="e.g. Thunder Bay Community Auditorium"
              value={form.location}
              onChange={handleChange}
              aria-invalid={Boolean(errors.location)}
            />
            {errors.location && (
              <span className="field-error">{errors.location}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="image">Event image URL</label>
            <input
              id="image"
              name="image"
              type="url"
              placeholder="https://example.com/event-poster.jpg"
              value={form.image}
              onChange={handleChange}
              aria-invalid={Boolean(errors.image)}
            />
            <small>
              Optional for this prototype. Use a publicly accessible image URL.
            </small>
            {errors.image && (
              <span className="field-error">{errors.image}</span>
            )}
          </div>

          {form.image && !errors.image && (
            <div className="image-preview">
              <img
                src={form.image}
                alt="Event poster preview"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          <fieldset className="ticket-fieldset">
            <legend>Ticket options *</legend>
            <div className="ticket-options">
              <label className="ticket-option">
                <input
                  type="radio"
                  name="ticketType"
                  value="free"
                  checked={form.ticketType === "free"}
                  onChange={handleChange}
                />
                <span>Free event</span>
              </label>

              <label className="ticket-option">
                <input
                  type="radio"
                  name="ticketType"
                  value="paid"
                  checked={form.ticketType === "paid"}
                  onChange={handleChange}
                />
                <span>Paid event</span>
              </label>
            </div>
            {errors.ticketType && (
              <span className="field-error">{errors.ticketType}</span>
            )}
          </fieldset>

          {message && (
            <div
              className={`form-message ${status}`}
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="publish-button"
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish Event"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
