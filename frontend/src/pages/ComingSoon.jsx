import Button from '../components/ui/Button.jsx'
import { ROUTES } from '../routes.js'
import './StatusPage.css'

// Placeholder for pages that are still being built on other branches.
function ComingSoon({ title }) {
  return (
    <section className="status-page container" aria-labelledby="status-title">
      <h1 id="status-title">{title}</h1>
      <p>This page isn't ready yet. It will be added in an upcoming update.</p>
      <Button to={ROUTES.home} variant="secondary">
        Back to home
      </Button>
    </section>
  )
}

export default ComingSoon
