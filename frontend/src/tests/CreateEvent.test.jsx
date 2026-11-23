
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

vi.mock("../services/eventApi", () => ({
  createEvent: vi.fn(),
}));

import CreateEvent from "../pages/CreateEvent";
import { validateEvent } from "../utils/validateEvent";
import { createEvent } from "../services/eventApi";

describe("Create Event validation", () => {
  it("rejects missing required fields", () => {
    const errors = validateEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      image: "",
      ticketType: "free",
    });

    expect(errors.title).toBeDefined();
    expect(errors.description).toBeDefined();
    expect(errors.date).toBeDefined();
    expect(errors.time).toBeDefined();
    expect(errors.location).toBeDefined();
  });

  it("accepts a valid future event", () => {
    const errors = validateEvent({
      title: "Music Night",
      description: "Live music in Thunder Bay",
      date: "2099-11-14",
      time: "19:00",
      location: "Thunder Bay",
      image: "",
      ticketType: "free",
    });

    expect(errors).toEqual({});
  });

  it("rejects events with dates in the past", () => {
    const errors = validateEvent({
      title: "Past Event",
      description: "This event has already happened",
      date: "2020-01-01",
      time: "19:00",
      location: "Thunder Bay",
      image: "",
      ticketType: "free",
    });
  
    expect(errors.date).toBe("Event date cannot be in the past.");
  });
  
  it("rejects invalid ticket types", () => {
    const errors = validateEvent({
      title: "Music Night",
      description: "Live music in Thunder Bay",
      date: "2099-11-14",
      time: "19:00",
      location: "Thunder Bay",
      image: "",
      ticketType: "invalid",
    });
  
    expect(errors.ticketType).toBe("Select a valid ticket option.");
  });
  
  it("rejects invalid image URLs", () => {
    const errors = validateEvent({
      title: "Music Night",
      description: "Live music in Thunder Bay",
      date: "2099-11-14",
      time: "19:00",
      location: "Thunder Bay",
      image: "javascript:alert('hello')",
      ticketType: "free",
    });
  
    expect(errors.image).toBe("Enter a valid HTTP or HTTPS image URL.");
  });
});

describe("Create Event form", () => {
  it("shows validation errors on empty submission", () => {
    render(<CreateEvent />);

    fireEvent.click(
      screen.getByRole("button", { name: /publish event/i })
    );

    expect(
      screen.getByText("Event title is required.")
    ).toBeInTheDocument();

    expect(createEvent).not.toHaveBeenCalled();
  });

  it("submits valid event information", async () => {
    createEvent.mockResolvedValue({
      demo: false,
      event: { id: 1 },
    });

    render(<CreateEvent />);

    fireEvent.change(screen.getByLabelText(/event title/i), {
      target: { value: "Music Night" },
    });

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Live music in Thunder Bay" },
    });

    fireEvent.change(screen.getByLabelText(/event date/i), {
      target: { value: "2099-11-14" },
    });

    fireEvent.change(screen.getByLabelText(/start time/i), {
      target: { value: "19:00" },
    });

    fireEvent.change(screen.getByLabelText(/location/i), {
      target: { value: "Thunder Bay" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /publish event/i })
    );

    expect(
      await screen.findByText("Event published successfully!")
    ).toBeInTheDocument();

    expect(createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Music Night",
        location: "Thunder Bay",
      })
    );
  });

  it("displays a server error", async () => {
    createEvent.mockRejectedValue(
      new Error("Server unavailable")
    );

    render(<CreateEvent />);

    fireEvent.change(screen.getByLabelText(/event title/i), {
      target: { value: "Music Night" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Live music in Thunder Bay" },
    });
    fireEvent.change(screen.getByLabelText(/event date/i), {
      target: { value: "2099-11-14" },
    });
    fireEvent.change(screen.getByLabelText(/start time/i), {
      target: { value: "19:00" },
    });
    fireEvent.change(screen.getByLabelText(/location/i), {
      target: { value: "Thunder Bay" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /publish event/i })
    );

    expect(
      await screen.findByText("Server unavailable")
    ).toBeInTheDocument();
  });
});
