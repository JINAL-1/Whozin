// Whozin is for Thunder Bay, so "today" means today on Eastern time,
// even when the server runs on UTC.
const TIME_ZONE = 'America/Toronto';

function partsInThunderBay(now) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  return (type) => parts.find((item) => item.type === type).value;
}

// Today's date as YYYY-MM-DD, the same format as the event_date column.
function todayInThunderBay(now = new Date()) {
  const part = partsInThunderBay(now);
  return `${part('year')}-${part('month')}-${part('day')}`;
}

// The current date and time as YYYY-MM-DD HH:MM:SS in Thunder Bay, to compare
// with an event's start (event_date + event_time), which is stored in local time.
function nowInThunderBay(now = new Date()) {
  const part = partsInThunderBay(now);
  return `${todayInThunderBay(now)} ${part('hour')}:${part('minute')}:${part('second')}`;
}

module.exports = { todayInThunderBay, nowInThunderBay };
