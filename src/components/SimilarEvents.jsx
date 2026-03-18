import { useMemo } from 'react'
import { fmtTimeRange, fmtDayLabel } from '../utils'
import { useI18n } from '../i18n'
import { trackEvent } from '../analytics'

function scoreSimilarity(event, candidate) {
  let score = 0
  if (event.tematica && event.tematica === candidate.tematica) score += 4
  if (event.pilar && event.pilar === candidate.pilar) score += 3
  const eventSpeakers = new Set(event.speakers.map(s => s.name))
  for (const s of candidate.speakers) {
    if (eventSpeakers.has(s.name)) score += 2
  }
  if (event.stage && event.stage === candidate.stage) score += 1
  return score
}

export default function SimilarEvents({ event, allEvents, bookmarks, onEventClick }) {
  const { t } = useI18n()

  const similar = useMemo(() => {
    return allEvents
      .filter(e => e.id !== event.id && !bookmarks[e.id])
      .map(e => ({ event: e, score: scoreSimilarity(event, e) }))
      .filter(e => e.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(e => e.event)
  }, [event, allEvents, bookmarks])

  if (similar.length === 0) return null

  return (
    <div className="similar-events">
      <h3>{t('similar_events')}</h3>
      <div className="similar-events-list">
        {similar.map(ev => (
          <div
            key={ev.id}
            className="similar-event-card"
            onClick={() => { trackEvent('similar_event_click', { source_id: event.id, target_id: ev.id }); onEventClick(ev) }}
          >
            <div className="event-time">
              {fmtDayLabel(ev.start.substring(0, 10))} &middot; {fmtTimeRange(ev.start, ev.end)}
            </div>
            <div className="event-title">{ev.name}</div>
            {ev.location && (
              <div className="event-location">
                <i className="fa-solid fa-location-dot"></i> {ev.location}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
