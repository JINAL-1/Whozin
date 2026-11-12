import { useMemo, useSyncExternalStore } from 'react'

// Login and sign up save the JWT and the user ({ id, email, role }) under these keys.
const TOKEN_KEY = 'token'
const USER_KEY = 'user'
const CHANGE_EVENT = 'whozin:session-change'

function read(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

// When the token stops working, in milliseconds. Null if the token has no expiry.
function readExpiry(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(payload))
    return typeof exp === 'number' ? exp * 1000 : null
  } catch {
    return null
  }
}

function readUser(value) {
  try {
    const user = JSON.parse(value)
    return user && typeof user === 'object' ? user : null
  } catch {
    return null
  }
}

function parseSession(snapshot) {
  const [token, user] = JSON.parse(snapshot)
  if (!token) return null

  return { token, user: readUser(user), expiresAt: readExpiry(token) }
}

function readSnapshot() {
  return JSON.stringify([read(TOKEN_KEY), read(USER_KEY)])
}

function subscribe(onChange) {
  window.addEventListener('storage', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)

  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

// Logs the user out in this tab and tells the rest of the app.
export function endSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  } catch {
    // Storage is blocked, so there is nothing saved to remove.
  }

  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function isExpired(session, now = Date.now()) {
  return Boolean(session?.expiresAt && session.expiresAt <= now)
}

// The logged-in user, or null. Updates when someone logs in or out,
// including in another tab.
export function useSession() {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, readSnapshot)
  return useMemo(() => parseSession(snapshot), [snapshot])
}

// A login that expired while the site was closed is cleared before any page
// loads, so pages ask the user to log in instead of sending an old token.
if (isExpired(parseSession(readSnapshot()))) endSession()
