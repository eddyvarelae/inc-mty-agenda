import { useI18n } from '../i18n'
import { trackEvent } from '../analytics'

const FILTER_SECTIONS = [
  { key: 'stage', labelKey: 'stage_venue', dataKey: 'stages' },
  { key: 'tematica', labelKey: 'topic', dataKey: 'tematicas' },
  { key: 'pilar', labelKey: 'track', dataKey: 'pilares' },
  { key: 'perfil', labelKey: 'audience', dataKey: 'perfiles' },
]

export default function Sidebar({ data, filters, activeDay, onFilterChange, onClear, open, onClose }) {
  const { t } = useI18n()
  const dayEvents = activeDay
    ? data.events.filter(e => e.start.startsWith(activeDay))
    : data.events

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">{t('filters')}</span>
          <button className="sidebar-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        {FILTER_SECTIONS.map(({ key, labelKey, dataKey }) => (
          <div className="filter-section" key={key}>
            <div className="filter-title">{t(labelKey)}</div>
            <div className="filter-chips">
              {data.filters[dataKey].map(item => {
                const count = dayEvents.filter(e => e[key] === item).length
                const active = filters[key] === item
                const display = item.length > 40 ? item.substring(0, 37) + '...' : item
                return (
                  <div
                    key={item}
                    className={`chip ${active ? 'active' : ''}`}
                    title={item}
                    onClick={() => { trackEvent('filter_click', { filter_type: key, filter_value: active ? 'clear' : item }); onFilterChange(key, active ? null : item) }}
                  >
                    {display}<span className="count">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div style={{ marginTop: '1rem' }}>
          <button className="btn btn-sm" onClick={() => { trackEvent('filter_clear_all'); onClear() }} style={{ width: '100%' }}>
            {t('clear_all')}
          </button>
        </div>
      </aside>
    </>
  )
}
