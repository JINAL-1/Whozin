import { Link } from 'react-router'
import { ROUTES, navLinksFor } from '../../routes.js'
import { useSession } from '../../services/session.js'
import Logo from '../brand/Logo.jsx'

const YEAR = new Date().getFullYear()

function Footer() {
  const session = useSession()

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__about">
          <Logo height={24} />
          <p>Local events for the Thunder Bay community.</p>
        </div>

        <nav aria-label="Footer">
          <ul className="footer__links">
            <li>
              <Link to={ROUTES.home}>Home</Link>
            </li>
            {navLinksFor(session).map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="footer__note">
          © {YEAR} Whozin. A COMP 3415 team project at Lakehead University.
        </p>
      </div>
    </footer>
  )
}

export default Footer
