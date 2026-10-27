import Button from '../components/ui/Button.jsx'
import { ROUTES } from '../routes.js'
import './StatusPage.css'

function NotFound() {
  return (
    <section className="status-page container" aria-labelledby="status-title">
      <h1 id="status-title">Page not found</h1>
      <p>The link may be out of date or mistyped. Try searching for events instead.</p>
      <div className="status-page__actions">
        <Button to={ROUTES.search}>Find events</Button>
        <Button to={ROUTES.home} variant="secondary">
          Go to the homepage
        </Button>
      </div>
    </section>
  )
}

export default NotFound
