// Whozin is for Thunder Bay, so "today" means today on Eastern time,
// even when the server runs on UTC.
const TIME_ZONE = 'America/Toronto';

// Today's date as YYYY-MM-DD, the same format as the event_date column.
function todayInThunderBay(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const part = (type) => parts.find((item) => item.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

module.exports = { todayInThunderBay };
