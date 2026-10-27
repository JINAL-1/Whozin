// Thunder Bay is on Eastern time, so dates are shown in that zone
// no matter where the browser is.
const TIME_ZONE = 'America/Toronto'
const LOCALE = 'en-CA'

export function getDateParts(isoString) {
  const date = new Date(isoString)
  const part = (options) =>
    new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, ...options }).format(date)

  return {
    month: part({ month: 'short' }).replace('.', ''),
    day: part({ day: 'numeric' }),
    weekday: part({ weekday: 'short' }).replace('.', ''),
    time: part({ hour: 'numeric', minute: '2-digit' }),
    full: part({ dateStyle: 'full', timeStyle: 'short' }),
  }
}

export function formatPrice(price) {
  if (price === undefined || price === null) return null
  if (Number(price) === 0) return 'Free'

  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: Number.isInteger(Number(price)) ? 0 : 2,
  }).format(price)
}
