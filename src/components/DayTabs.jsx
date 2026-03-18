import { fmtDayLabel, isToday, isTomorrow } from '../utils'
import { useI18n } from '../i18n'
import { trackEvent } from '../analytics'

export default function DayTabs({ dates, events, activeDay, onDayChange }) {
  const { t } = useI18n()

  function handleDayChange(d) {
    trackEvent('day_tab_click', { day: d || 'all' })
    onDayChange(d)
  }

  function dayLabel(d) {
    if (isToday(d)) return t('today')
    if (isTomorrow(d)) return t('tomorrow')
    return null
  }

  return (
    <div className="day-tabs">
      <button
        className={`day-tab ${!activeDay ? 'active' : ''}`}
        onClick={() => handleDayChange(null)}
      >
        {t('all_days')}
      </button>
      {dates.map(d => {
        const count = events.filter(e => e.start.startsWith(d)).length
        const label = dayLabel(d)
        return (
          <button
            key={d}
            className={`day-tab ${activeDay === d ? 'active' : ''}`}
            onClick={() => handleDayChange(d)}
          >
            {label && <span className="day-today-label">{label}</span>}
            <span className="day-label">{fmtDayLabel(d)}</span>
            {d.substring(8)} Mar{' '}
            <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>({count})</span>
          </button>
        )
      })}
    </div>
  )
}
