import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { ROUTES, navLinksFor } from '../../routes.js'
import { endSession, isExpired, useSession } from '../../services/session.js'
import Logo from '../brand/Logo.jsx'
import Button from '../ui/Button.jsx'
import './Navbar.css'

const ROLE_LABELS = { attendee: 'Attendee', organizer: 'Organizer' }

// setTimeout can't wait longer than about 24 days.
const MAX_TIMER = 2 ** 31 - 1

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const session = useSession()
  const navigate = useNavigate()
  // Re-render on every page change, so a login saved without a page reload
  // (for example after sign up) shows up as soon as the user moves on.
  useLocation()

  const expiresAt = session?.expiresAt ?? null
  const email = session?.user?.email ?? ''
  const roleLabel = ROLE_LABELS[session?.user?.role] ?? 'Signed in'

  // Log out automatically when the login token expires.
  useEffect(() => {
    if (!expiresAt) return undefined

    if (isExpired({ expiresAt })) {
      endSession()
      return undefined
    }

    const timer = setTimeout(endSession, Math.min(expiresAt - Date.now(), MAX_TIMER))
    return () => clearTimeout(timer)
  }, [expiresAt])

  const closeMenu = () => setMenuOpen(false)

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') closeMenu()
  }

  const handleLogOut = () => {
    closeMenu()
    endSession()
    navigate(ROUTES.home)
  }

  return (
    <header className="navbar" onKeyDown={handleKeyDown}>
      <div className="container navbar__inner">
        <Link to={ROUTES.home} className="navbar__brand" aria-label="Whozin home" onClick={closeMenu}>
          <Logo height={30} />
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar__toggle-bars" aria-hidden="true" />
          {menuOpen ? 'Close' : 'Menu'}
        </button>

        <nav
          id="site-menu"
          className={`navbar__menu ${menuOpen ? 'is-open' : ''}`.trim()}
          aria-label="Main"
        >
          <ul className="navbar__links">
            {navLinksFor(session).map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className="navbar__link" onClick={closeMenu}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {session ? (
            <div className="navbar__account">
              <p className="navbar__user">
                <span className="navbar__avatar" aria-hidden="true">
                  {(email[0] ?? '?').toUpperCase()}
                </span>
                <span className="navbar__user-text">
                  <span className="visually-hidden">Logged in as </span>
                  {email && (
                    <span className="navbar__user-email" title={email}>
                      {email}
                    </span>
                  )}
                  <span className="navbar__user-role">{roleLabel}</span>
                </span>
              </p>
              <Button variant="secondary" size="sm" onClick={handleLogOut}>
                Log out
              </Button>
            </div>
          ) : (
            <div className="navbar__account">
              <Button to={ROUTES.login} variant="ghost" onClick={closeMenu}>
                Log in
              </Button>
              <Button to={ROUTES.signup} onClick={closeMenu}>
                Sign up
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
