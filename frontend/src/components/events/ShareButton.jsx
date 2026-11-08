import { useEffect, useState } from 'react'
import Button from '../ui/Button.jsx'
import FormField from '../ui/FormField.jsx'
import './ShareButton.css'

const MESSAGE_TIME_MS = 4000

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  // Older browsers without the Clipboard API
  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.appendChild(field)
  field.select()
  const copied = typeof document.execCommand === 'function' && document.execCommand('copy')
  field.remove()

  if (!copied) throw new Error('Copy failed')
}

// Copies a link to the clipboard and shows "Link copied".
// If the browser blocks copying, the link is shown so it can be copied by hand.
function ShareButton({ url }) {
  const [status, setStatus] = useState('idle')
  const [copies, setCopies] = useState(0)

  // Hide "Link copied" after a few seconds. Copying again restarts the timer.
  useEffect(() => {
    if (status !== 'copied') return undefined
    const timer = setTimeout(() => setStatus('idle'), MESSAGE_TIME_MS)
    return () => clearTimeout(timer)
  }, [status, copies])

  async function handleCopy() {
    try {
      await copyText(url)
      setStatus('copied')
      setCopies((count) => count + 1)
    } catch {
      setStatus('failed')
    }
  }

  return (
    <div className="share">
      <div className="share__row">
        <Button variant="secondary" onClick={handleCopy}>
          Copy link
        </Button>
        <p className="share__status" role="status">
          {status === 'copied' ? 'Link copied' : ''}
        </p>
      </div>
      {status === 'failed' && (
        <FormField
          className="share__fallback"
          label="Copy this link"
          hint="Your browser blocked copying. Select the link below and copy it."
          value={url}
          readOnly
          onFocus={(event) => event.target.select()}
        />
      )}
    </div>
  )
}

export default ShareButton
