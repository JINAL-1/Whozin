import { useEffect, useState } from 'react'
import { ROUTES } from '../../routes.js'
import {
  cancelRegistration,
  getRegistrationStatus,
  registerForEvent,
} from '../../services/registrationApi.js'
import { useSession } from '../../services/session.js'
import Button from '../ui/Button.jsx'
import './EventRegistration.css'

function goingLabel(count) {
  if (count === 0) return 'Be the first to register'
  return count === 1 ? '1 person is going' : `${count} people are going`
}

// US-06: free registration. Remembers the attendee's registration after a
// refresh, lets them cancel it, and shows how many people are going.
function EventRegistration({ eventId, initialGoing = 0 }) {
  const session = useSession()
  const isAttendee = session?.user?.role === 'attendee'

  const [going, setGoing] = useState(initialGoing)
  // Which event and login the saved status belongs to, so a different
  // event or account starts out as "checking".
  const statusKey = `${eventId}:${isAttendee ? session.token : ''}`
  const [status, setStatus] = useState({ key: null, registered: false })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAttendee) return undefined
    let active = true

    getRegistrationStatus(eventId)
      .then((registered) => {
        if (active) setStatus({ key: statusKey, registered })
      })
      .catch(() => {
        // If the check fails, show the Register button. Registering again
        // is safe: the server says if they're already registered.
        if (active) setStatus({ key: statusKey, registered: false })
      })

    return () => {
      active = false
    }
  }, [eventId, isAttendee, statusKey])

  const checking = isAttendee && status.key !== statusKey
  const registered = isAttendee && !checking && status.registered

  const handleRegister = async () => {
    setBusy(true)
    setError('')
    setMessage('')

    try {
      await registerForEvent(eventId)
      setStatus({ key: statusKey, registered: true })
      setGoing((count) => count + 1)
      setMessage("You're registered. See you there!")
    } catch (requestError) {
      if (requestError.status === 409) {
        // Already registered, e.g. from another tab.
        setStatus({ key: statusKey, registered: true })
      } else {
        setError(requestError.message || 'Registration failed. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = async () => {
    setBusy(true)
    setError('')
    setMessage('')

    try {
      await cancelRegistration(eventId)
      setStatus({ key: statusKey, registered: false })
      setGoing((count) => Math.max(0, count - 1))
      setMessage('Your registration was cancelled.')
    } catch (requestError) {
      if (requestError.status === 404) {
        setStatus({ key: statusKey, registered: false })
      } else {
        setError(requestError.message || 'Could not cancel. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="event-registration" aria-labelledby="registration-title">
      <h2 id="registration-title">Register</h2>
      <p className="event-registration__going">{goingLabel(going)}</p>

      {!session && (
        <p className="event-registration__note">
          <Button to={ROUTES.login} size="sm">
            Log in to register
          </Button>
        </p>
      )}

      {session && !isAttendee && (
        <p className="event-registration__note">
          Only attendee accounts can register for events.
        </p>
      )}

      {checking && <p role="status">Checking your registration...</p>}

      {isAttendee && !checking && !registered && (
        <Button onClick={handleRegister} disabled={busy}>
          {busy ? 'Registering...' : 'Register for Free'}
        </Button>
      )}

      {registered && (
        <div className="event-registration__registered">
          <p className="event-registration__badge">You're going</p>
          <Button variant="secondary" size="sm" onClick={handleCancel} disabled={busy}>
            {busy ? 'Cancelling...' : 'Cancel registration'}
          </Button>
        </div>
      )}

      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  )
}

export default EventRegistration
