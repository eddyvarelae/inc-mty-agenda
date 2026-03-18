import { useState, useMemo } from 'react'
import { fmtTimeRange, fmtDayLabel } from '../utils'
import { useI18n } from '../i18n'
import { trackEvent } from '../analytics'

export default function SpeakerIndex({ events, bookmarks, onToggleBookmark, onEventClick }) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [selectedSpeaker, setSelectedSpeaker] = useState(null)

  const speakers = useMemo(() => {
    const map = new Map()
    for (const ev of events) {
      for (const s of ev.speakers) {
        if (!map.has(s.name)) {
          map.set(s.name, { ...s, sessions: [] })
        }
        map.get(s.name).sessions.push(ev)
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [events])

  const filtered = useMemo(() => {
    if (!search) return speakers
    const q = search.toLowerCase()
    return speakers.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.position || '').toLowerCase().includes(q) ||
      (s.company || '').toLowerCase().includes(q)
    )
  }, [speakers, search])

  if (selectedSpeaker) {
    const sp = speakers.find(s => s.name === selectedSpeaker)
    if (!sp) return null
    return (
      <div className="speaker-index">
        <button className="btn btn-sm" onClick={() => setSelectedSpeaker(null)} style={{ marginBottom: '1rem' }}>
          <i className="fa-solid fa-arrow-left"></i> {t('back_to_speakers')}
        </button>
        <h2 style={{ marginBottom: '0.5rem' }}>{sp.name}</h2>
        {sp.position && <p style={{ color: 'var(--text-dim)', marginBottom: '1rem' }}>{sp.position}</p>}
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
          {t('all_sessions', { name: sp.name })}
        </h3>
        {sp.sessions.map(ev => (
          <div
            key={ev.id}
            className="speaker-session-card"
            onClick={() => { trackEvent('speaker_session_click', { event_id: ev.id }); onEventClick(ev) }}
          >
            <div className="event-time">{fmtDayLabel(ev.start.substring(0, 10))} &middot; {fmtTimeRange(ev.start, ev.end)}</div>
            <div className="event-title">{ev.name}</div>
            {ev.location && <div className="event-location"><i className="fa-solid fa-location-dot"></i> {ev.location}</div>}
            <button
              className={`bookmark-btn ${bookmarks[ev.id] ? 'active' : ''}`}
              onClick={e => { e.stopPropagation(); onToggleBookmark(ev.id) }}
              style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
            >
              <i className={`fa-${bookmarks[ev.id] ? 'solid' : 'regular'} fa-star`}></i>
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="speaker-index">
      <div className="speaker-search">
        <span className="search-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
        <input
          type="text"
          placeholder={t('search_speakers')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="stats-bar" style={{ marginBottom: '1rem' }}>
        <div className="stat"><strong>{filtered.length}</strong> {t('speakers_count')}</div>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon"><i className="fa-solid fa-user-slash"></i></div>
          <p>{t('no_speakers_found')}</p>
        </div>
      ) : (
        <div className="speaker-grid">
          {filtered.map(s => {
            const hasPicture = s.picture && !s.picture.includes('missing')
            return (
              <div
                key={s.name}
                className="speaker-grid-card"
                onClick={() => { trackEvent('speaker_click', { speaker_name: s.name }); setSelectedSpeaker(s.name) }}
              >
                {hasPicture ? (
                  <img src={s.picture} alt={s.name} loading="lazy" />
                ) : (
                  <div className="speaker-avatar"><i className="fa-solid fa-user"></i></div>
                )}
                <div className="speaker-grid-info">
                  <div className="speaker-name">{s.name}</div>
                  {s.position && <div className="speaker-position">{s.position}</div>}
                  <div className="speaker-session-count">{s.sessions.length} {t('sessions')}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
