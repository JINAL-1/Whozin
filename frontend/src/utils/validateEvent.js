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