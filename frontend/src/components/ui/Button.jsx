import { Link } from 'react-router'
import './Button.css'

// Renders a router <Link> when `to` is given, otherwise a <button>.
// variant: 'primary' | 'secondary' | 'ghost'
// size: 'md' | 'sm' | 'lg'
function Button({
  to,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' && `btn--${size}`,
    fullWidth && 'btn--full',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}

export default Button
