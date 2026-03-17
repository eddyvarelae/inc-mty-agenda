import { fmtDayLabel } from '../utils'

export default function DayTabs({ dates, events, activeDay, onDayChange }) {
  return (
    <div className="day-tabs">
      <button
        className={`day-tab ${!activeDay ? 'active' : ''}`}
        onClick={() => onDayChange(null)}
      >
        All Days
      </button>
      {dates.map(d => {
        const count = events.filter(e => e.start.startsWith(d)).length
        return (
          <button
            key={d}
            className={`day-tab ${activeDay === d ? 'active' : ''}`}
            onClick={() => onDayChange(d)}
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
