
import './Add2Cal.css'

// Escape special characters required by the iCalendar format.
function escapeIcsText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

// Format a UTC date for an .ics file.
function formatIcsDate(date) {
  return date.toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}

// Create and download an .ics calendar file.
function downloadCalendar(event) {
  const { id, title, startsAt, location } = event

  const startDate = new Date(startsAt)

  if (Number.isNaN(startDate.getTime())) {
    console.error('Invalid event date:', startsAt)
    return false
  }

  // Use a default duration of 1 hour.
  const endDate = new Date(
    startDate.getTime() + 60 * 60 * 1000
  )

  const calendarContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WHOZIN//Events//EN',
    'BEGIN:VEVENT',
    `UID:whozin-${id}@whozin`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `LOCATION:${escapeIcsText(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([calendarContent], {
    type: 'text/calendar;charset=utf-8',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `whozin-event-${id}.ics`

  document.body.appendChild(link)
  link.click()
  link.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)

  return true
}

function Add2Cal({ event }) {
  function handleAddToCalendar() {
    downloadCalendar(event)
  }

  return (
    <button
      type="button"
      className="add2cal-button"
      onClick={handleAddToCalendar}
      aria-label={`Add ${event.title} to calendar`}
    >
      <span aria-hidden="true">📅</span>
      Add to Calendar
    </button>
  )
}

export default Add2Cal
