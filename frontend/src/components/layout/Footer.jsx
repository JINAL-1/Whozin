import { Link } from 'react-router'
import { MAIN_NAV, ROUTES } from '../../routes.js'
import Logo from '../brand/Logo.jsx'

const YEAR = new Date().getFullYear()

function Footer() {
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
            {MAIN_NAV.map((item) => (
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
