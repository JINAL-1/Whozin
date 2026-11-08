import { useId } from 'react'
import { getShareLinks, shareMessage } from '../../utils/shareLinks.js'
import Button from '../ui/Button.jsx'
import './ShareLinks.css'

// Buttons that open email, WhatsApp, Facebook or X with the event link filled in.
// Where the browser supports it (mostly phones), "More options" opens the
// device's own share menu.
function ShareLinks({ title, url }) {
  const labelId = useId()
  const canUseDeviceShare = typeof navigator.share === 'function'

  async function handleDeviceShare() {
    try {
      await navigator.share({ title, text: shareMessage(title), url })
    } catch {
      // Closing the share menu without picking an app is not an error.
    }
  }

  return (
    <div className="share-links">
      <p className="share-links__label" id={labelId}>
        Or share to
      </p>
      <ul className="share-links__list" aria-labelledby={labelId}>
        {getShareLinks({ title, url }).map((link) => (
          <li key={link.name}>
            <a
              className="btn btn--secondary btn--sm"
              href={link.href}
              target={link.newTab ? '_blank' : undefined}
              rel={link.newTab ? 'noopener noreferrer' : undefined}
            >
              {link.name}
              {link.newTab && <span className="visually-hidden"> (opens in a new tab)</span>}
            </a>
          </li>
        ))}
        {canUseDeviceShare && (
          <li>
            <Button variant="secondary" size="sm" onClick={handleDeviceShare}>
              More options
            </Button>
          </li>
        )}
      </ul>
    </div>
  )
}

export default ShareLinks
