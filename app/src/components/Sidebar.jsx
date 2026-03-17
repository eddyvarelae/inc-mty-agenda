const FILTER_SECTIONS = [
  { key: 'stage', label: 'Stage / Venue', dataKey: 'stages' },
  { key: 'tematica', label: 'Topic', dataKey: 'tematicas' },
  { key: 'pilar', label: 'Track', dataKey: 'pilares' },
  { key: 'perfil', label: 'Audience', dataKey: 'perfiles' },
]

export default function Sidebar({ data, filters, activeDay, onFilterChange, onClear, open }) {
  const dayEvents = activeDay
    ? data.events.filter(e => e.start.startsWith(activeDay))
    : data.events

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      {FILTER_SECTIONS.map(({ key, label, dataKey }) => (
        <div className="filter-section" key={key}>
          <div className="filter-title">{label}</div>
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
                  onClick={() => onFilterChange(key, active ? null : item)}
                >
                  {display}<span className="count">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
      <div style={{ marginTop: '1rem' }}>
        <button className="btn btn-sm" onClick={onClear} style={{ width: '100%' }}>
          Clear all filters
        </button>
      </div>
    </aside>
  )
}
