import { fmtDayLabel } from '../utils'
import { trackEvent } from '../analytics'

export default function DayTabs({ dates, events, activeDay, onDayChange }) {
  function handleDayChange(d) {
    trackEvent('day_tab_click', { day: d || 'all' })
    onDayChange(d)
  }

  return (
    <div className="day-tabs">
      <button
        className={`day-tab ${!activeDay ? 'active' : ''}`}
        onClick={() => handleDayChange(null)}
      >
        All Days
      </button>
      {dates.map(d => {
        const count = events.filter(e => e.start.startsWith(d)).length
        return (
          <button
            key={d}
            className={`day-tab ${activeDay === d ? 'active' : ''}`}
            onClick={() => handleDayChange(d)}
          >
            <span className="day-label">{fmtDayLabel(d)}</span>
            {d.substring(8)} Mar{' '}
            <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>({count})</span>
          </button>
        )
      })}
    </div>
  )
}
