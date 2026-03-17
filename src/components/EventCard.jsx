import { fmtTimeRange } from '../utils'
import { trackEvent } from '../analytics'

export default function EventCard({ event, isBookmarked, onToggleBookmark, onClick }) {
  const speakers = event.speakers.slice(0, 3)
  const moreCount = event.speakers.length - 3

  const tags = []
  if (event.tematica) tags.push(event.tematica)
  if (event.perfil) tags.push(event.perfil)

  return (
    <div className="event-card" onClick={() => { trackEvent('event_open', { event_id: event.id, event_name: event.name }); onClick() }}>
      <button
        className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
        onClick={e => { e.stopPropagation(); onToggleBookmark(event.id) }}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
      >
        <i className={`fa-${isBookmarked ? 'solid' : 'regular'} fa-star`}></i>
      </button>
      <div className="event-time">{fmtTimeRange(event.start, event.end)}</div>
      <div className="event-title">{event.name}</div>
      {event.location && (
        <div className="event-location">
          <i className="fa-solid fa-location-dot"></i>
          {event.location}
        </div>
      )}
      {speakers.length > 0 && (
        <div className="event-speakers">
          {speakers.map(s => (
            <span key={s.name} className="speaker-badge">
              {s.picture && !s.picture.includes('missing') && (
                <img src={s.picture} alt={s.name} loading="lazy" />
              )}
              {s.name}
            </span>
          ))}
          {moreCount > 0 && (
            <span className="speaker-badge">+{moreCount} more</span>
          )}
        </div>
      )}
      {tags.length > 0 && (
        <div className="event-tags">
          {tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}
    </div>
  )
}
