export function filterEvents(events, { keyword = '', location = '' } = {}) {
  const keywordTerm = keyword.trim().toLowerCase()
  const locationTerm = location.trim().toLowerCase()

  return events.filter((event) => {
    const keywordText = [event.title, event.category, event.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    const eventLocation = [event.location, event.city]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesKeyword = !keywordTerm || keywordText.includes(keywordTerm)
    const matchesLocation = !locationTerm || eventLocation.includes(locationTerm)

    return matchesKeyword && matchesLocation
  })
}
