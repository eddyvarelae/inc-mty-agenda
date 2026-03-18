import { useEffect, useRef, useMemo } from 'react'
import { fmtTime, fmtDayLabel, getEventStatus, isToday } from '../utils'
import { useI18n } from '../i18n'
import EventCard from './EventCard'

export default function Timeline({ events, activeDay, bookmarks, conflictingIds, filters, onToggleBookmark, onEventClick }) {
  const { t } = useI18n()
  const speakerCount = new Set(events.flatMap(e => e.speakers.map(s => s.name))).size
  const hasFilters = Object.values(filters).some(v => v)
  const currentRef = useRef(null)

  const viewingToday = activeDay && isToday(activeDay)

  // Group events into sections for today view
  const sections = useMemo(() => {
    if (!viewingToday) return null
    const now = [], soon = [], upcoming = [], past = []
    for (const ev of events) {
      const status = getEventStatus(ev.start, ev.end)
      if (status === 'live') now.push(ev)
      else if (status === 'starting-soon') soon.push(ev)
      else if (status === 'past') past.push(ev)
      else upcoming.push(ev)
    }
    return { now: [...now, ...soon], upcoming, past }
  }, [viewingToday, events])

  // Auto-scroll to current section on today view
  useEffect(() => {
    if (viewingToday && currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [viewingToday])

  if (events.length === 0) {
    return (
      <>
        <div className="stats-bar">
          <div className="stat"><strong>0</strong> {t('events_count')}</div>
        </div>
        <div className="empty-state">
          <div className="icon"><i className="fa-solid fa-filter-circle-xmark"></i></div>
          <p>{t('no_events')}</p>
        </div>
      </>
    )
  }

  function renderTimeBlock(evs, key) {
    // Group by start time
    const grouped = new Map()
    for (const ev of evs) {
      const k = ev.start
      if (!grouped.has(k)) grouped.set(k, [])
      grouped.get(k).push(ev)
    }
    return [...grouped.entries()].map(([time, items]) => (
      <div className="time-block" key={`${key}-${time}`}>
        <div className="time-label">
          {!activeDay && (
            <span style={{ opacity: 0.5, marginRight: '0.5rem' }}>
              {fmtDayLabel(time.substring(0, 10))}
            </span>
          )}
          {fmtTime(time)}
        </div>
        <div className="events-grid">
          {items.map(ev => (
            <EventCard
              key={ev.id}
              event={ev}
              isBookmarked={!!bookmarks[ev.id]}
              hasConflict={conflictingIds?.has(ev.id)}
              onToggleBookmark={onToggleBookmark}
              onClick={() => onEventClick(ev)}
            />
          ))}
        </div>
      </div>
    ))
  }

  return (
    <>
      <div className="stats-bar">
        <div className="stat"><strong>{events.length}</strong> {t('events_count')}</div>
        <div className="stat"><strong>{speakerCount}</strong> {t('speakers_count')}</div>
        {hasFilters && <div className="stat" style={{ color: 'var(--accent)' }}>{t('filtered')}</div>}
      </div>
      <div className="timeline">
        {viewingToday && sections ? (
          <>
            {sections.now.length > 0 && (
              <>
                <div className="section-divider" ref={currentRef}>
                  <span className="section-label live-label">{t('happening_now')}</span>
                </div>
                {renderTimeBlock(sections.now, 'now')}
              </>
            )}
            {sections.upcoming.length > 0 && (
              <>
                <div className="section-divider" ref={sections.now.length === 0 ? currentRef : null}>
                  <span className="section-label">{t('coming_up')}</span>
                </div>
                {renderTimeBlock(sections.upcoming, 'upcoming')}
              </>
            )}
            {sections.past.length > 0 && (
              <>
                <div className="section-divider">
                  <span className="section-label">{t('earlier_today')}</span>
                </div>
                {renderTimeBlock(sections.past, 'past')}
              </>
            )}
          </>
        ) : (
          renderTimeBlock(events, 'all')
        )}
      </div>
    </>
  )
}
