import './Logo.css'

// The dot of the "i" is a map pin. Letters use currentColor so the
// wordmark follows the text colour of wherever it is placed.
const LETTERS = [
  'M4 20 L12.5 52 L22 28 L31.5 52 L40 20',
  'M56 2 L56 52 M56 34 C56 24 62 20 69 20 C76 20 82 24 82 34 L82 52',
  'M113 20 A16 16 0 1 1 113 52 A16 16 0 1 1 113 20 Z',
  'M144 20 L170 20 L144 52 L170 52',
  'M185 24 L185 52',
  'M200 20 L200 52 M200 34 C200 24 206 20 213 20 C220 20 226 24 226 34 L226 52',
]

const PIN = 'M185 13 C180.5 8 175 3.5 175 -3 A10 10 0 1 1 195 -3 C195 3.5 189.5 8 185 13 Z'

function Logo({ height = 32, className = '' }) {
  return (
    <svg
      className={`logo ${className}`.trim()}
      viewBox="-2 -15 234 76"
      height={height}
      width={(height * 234) / 76}
      role="img"
      aria-label="Whozin"
      focusable="false"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {LETTERS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path className="logo__pin" d={PIN} />
    </svg>
  )
}

export default Logo
