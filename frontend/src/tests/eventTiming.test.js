import { describe, expect, it } from 'vitest'
import { hasStarted, upcomingOnly } from '../utils/eventTiming.js'

const now = new Date('2026-11-20T19:00:00').getTime()
const at = (startsAt, id = startsAt) => ({ id, startsAt })

describe('hasStarted', () => {
  it('is false before the start time', () => {
    expect(hasStarted(at('2026-11-20T19:01:00'), now)).toBe(false)
  })

  it('is true at the start time and after it', () => {
    expect(hasStarted(at('2026-11-20T19:00:00'), now)).toBe(true)
    expect(hasStarted(at('2026-11-20T08:00:00'), now)).toBe(true)
  })

  it('never treats an event without a valid date as finished', () => {
    expect(hasStarted(at('not a date'), now)).toBe(false)
  })
})

describe('upcomingOnly', () => {
  it('keeps events that have not started, soonest first, each once', () => {
    const events = [
      at('2026-11-22T10:00:00', 'c'),
      at('2026-11-20T18:00:00', 'past'),
      at('2026-11-20T20:00:00', 'a'),
      at('2026-11-21T09:00:00', 'b'),
      at('2026-11-20T20:00:00', 'a'),
      at('not a date', 'no-date'),
    ]

    expect(upcomingOnly(events, now).map((event) => event.id)).toEqual(['a', 'b', 'c'])
  })
})
