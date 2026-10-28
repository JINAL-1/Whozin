import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { MAIN_NAV, ROUTES } from '../../routes.js'
import Logo from '../brand/Logo.jsx'
import Button from '../ui/Button.jsx'
import './Navbar.css'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') closeMenu()
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
            {MAIN_NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className="navbar__link" onClick={closeMenu}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar__account">
            <Button to={ROUTES.login} variant="ghost" onClick={closeMenu}>
              Log in
            </Button>
            <Button to={ROUTES.signup} onClick={closeMenu}>
              Sign up
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
