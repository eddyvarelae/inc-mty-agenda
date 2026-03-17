import { fmtTime, fmtDayLabel } from '../utils'
import EventCard from './EventCard'

export default function Timeline({ events, activeDay, bookmarks, filters, onToggleBookmark, onEventClick }) {
  const speakerCount = new Set(events.flatMap(e => e.speakers.map(s => s.name))).size
  const hasFilters = Object.values(filters).some(v => v)

  if (events.length === 0) {
    return (
      <>
        <div className="stats-bar">
          <div className="stat"><strong>0</strong> events</div>
        </div>
        <div className="empty-state">
          <div className="icon"><i className="fa-solid fa-filter-circle-xmark"></i></div>
          <p>No events match your filters</p>
        </div>
      </>
    )
  }

  // Group by start time
  const grouped = new Map()
  for (const ev of events) {
    const key = ev.start
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(ev)
  }

  return (
    <>
      <div className="stats-bar">
        <div className="stat"><strong>{events.length}</strong> events</div>
        <div className="stat"><strong>{speakerCount}</strong> speakers</div>
        {hasFilters && <div className="stat" style={{ color: 'var(--accent)' }}>Filtered</div>}
      </div>
      <div className="timeline">
        {[...grouped.entries()].map(([time, evs]) => (
          <div className="time-block" key={time}>
            <div className="time-label">
              {!activeDay && (
                <span style={{ opacity: 0.5, marginRight: '0.5rem' }}>
                  {fmtDayLabel(time.substring(0, 10))}
                </span>
              )}
              {fmtTime(time)}
            </div>
            <div className="events-grid">
              {evs.map(ev => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  isBookmarked={!!bookmarks[ev.id]}
                  onToggleBookmark={onToggleBookmark}
                  onClick={() => onEventClick(ev)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
