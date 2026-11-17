import { useSyncExternalStore } from 'react'

const MINUTE = 60 * 1000

// Check the clock every 15 seconds. The value only changes once a minute,
// so pages re-render at most once a minute.
function subscribe(onChange) {
  const timer = setInterval(onChange, 15 * 1000)
  return () => clearInterval(timer)
}

const currentMinute = () => Math.floor(Date.now() / MINUTE) * MINUTE

// The current time, rounded down to the minute. Pages that list events use
// it so an event disappears when it starts, even if the page stays open.
export function useNow() {
  return useSyncExternalStore(subscribe, currentMinute, currentMinute)
}
