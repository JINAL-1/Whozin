
function escapeIcsText(value) {
    return String(value ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
  }
  
  export function downloadCalendarEvent(event) {
    const date = String(event.event_date).slice(0, 10).replace(/-/g, '');
    const time = String(event.event_time).slice(0, 8).replace(/:/g, '');
    const normalizedTime = time.length === 4 ? `${time}00` : time;
  
    // Temporary one-hour duration; confirm the intended duration.
    const start = `${date}T${normalizedTime}`;
  
    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//WHOZIN//Event Calendar//EN',
      'BEGIN:VEVENT',
      `UID:whozin-event-${event.id}@whozin`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
      `DTSTART:${start}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `LOCATION:${escapeIcsText(event.location)}`,
      `DESCRIPTION:${escapeIcsText(event.description)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  
    const blob = new Blob([content], {
      type: 'text/calendar;charset=utf-8',
    });
  
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
  
    link.href = url;
    link.download = `whozin-event-${event.id}.ics`;
  
    document.body.appendChild(link);
    link.click();
    link.remove();
  
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  