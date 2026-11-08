export function shareMessage(title) {
  return `Check out ${title} on Whozin`
}

// Links that open another app with the event's link ready to send.
// Every part uses encodeURIComponent, so spaces show as spaces in mail apps.
export function getShareLinks({ title, url }) {
  const message = shareMessage(title)
  const encode = encodeURIComponent

  return [
    {
      name: 'Email',
      href: `mailto:?subject=${encode(title)}&body=${encode(`${message}: ${url}`)}`,
      newTab: false,
    },
    {
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encode(`${message}: ${url}`)}`,
      newTab: true,
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encode(url)}`,
      newTab: true,
    },
    {
      name: 'X',
      href: `https://x.com/intent/tweet?text=${encode(message)}&url=${encode(url)}`,
      newTab: true,
    },
  ]
}
