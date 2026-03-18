import { useMemo } from 'react'
import { fmtTime, fmtDayLabel } from '../utils'
import { useI18n } from '../i18n'
import { trackEvent } from '../analytics'

export default function AgendaSummary({ events, onEventClick }) {
  const { t } = useI18n()

  const days = useMemo(() => {
    trackEvent('agenda_summary_view', { event_count: events.length })
    const map = new Map()
    const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start))
    for (const ev of sorted) {
      const day = ev.start.substring(0, 10)
      if (!map.has(day)) map.set(day, [])
      map.get(day).push(ev)
    }
    return map
  }, [events])

  if (events.length === 0) {
    return (
      <div className="agenda-summary">
        <h2>{t('my_day')}</h2>
        <div className="empty-state">
          <div className="icon"><i className="fa-solid fa-calendar-check"></i></div>
          <p>{t('no_bookmarks_summary')}</p>
        </div>
      </div>
    )
  }

  function calcStats(dayEvents) {
    let totalMin = 0
    for (const ev of dayEvents) {
      totalMin += (new Date(ev.end) - new Date(ev.start)) / 60000
    }
    // Gaps: time between consecutive events
    let gapMin = 0
    for (let i = 1; i < dayEvents.length; i++) {
      const gap = (new Date(dayEvents[i].start) - new Date(dayEvents[i - 1].end)) / 60000
      if (gap > 0) gapMin += gap
    }
    return { totalMin, gapMin }
  }

  function fmtDuration(min) {
    const h = Math.floor(min / 60)
    const m = Math.round(min % 60)
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }

  return (
    <div className="agenda-summary">
      <h2>{t('my_day')}</h2>
      {[...days.entries()].map(([day, dayEvents]) => {
        const { totalMin, gapMin } = calcStats(dayEvents)
        return (
          <div key={day} className="summary-day">
            <div className="summary-day-header">
              <span className="summary-day-label">{fmtDayLabel(day)}</span>
              <span className="summary-day-stats">
                {t('total_time')}: {fmtDuration(totalMin)} &middot; {t('free_time')}: {fmtDuration(gapMin)}
              </span>
            </div>
            <div className="summary-events">
              {dayEvents.map(ev => (
                <div
                  key={ev.id}
                  className="summary-event"
                  onClick={() => onEventClick(ev)}
                >
                  <span className="summary-time">{fmtTime(ev.start)}</span>
                  <span className="summary-name">{ev.name}</span>
                  <span className="summary-location">{ev.location || ''}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
