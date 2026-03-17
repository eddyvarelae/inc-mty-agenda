import { useState } from 'react'
import { fmtDayLabel, fmtTimeRange, stripHtml, truncate, downloadICS, googleCalendarUrl } from '../utils'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'

function SpeakerCard({ speaker }) {
  const [expanded, setExpanded] = useState(false)
  const bio = speaker.bio ? stripHtml(speaker.bio) : ''
  const hasPicture = speaker.picture && !speaker.picture.includes('missing')

  return (
    <div className="speaker-card">
      {hasPicture && <img src={speaker.picture} alt={speaker.name} loading="lazy" />}
      <div className="speaker-info">
        <div className="speaker-name">
          {speaker.name}{' '}
          {speaker.linkedin && (
            <a href={speaker.linkedin} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
              <i className="fa-brands fa-linkedin"></i>
            </a>
          )}
        </div>
        {speaker.position && <div className="speaker-position">{speaker.position}</div>}
        {bio && (
          <>
            <div className={`speaker-bio ${expanded ? 'expanded' : ''}`}>
              {expanded ? bio : truncate(bio, 300)}
            </div>
            {bio.length > 300 && (
              <button className="bio-toggle" onClick={() => setExpanded(!expanded)}>
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function EventModal({ event, isBookmarked, onToggleBookmark, onClose }) {
  const gcal = useGoogleCalendar()
  if (!event) return null

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleExport(e) {
    e.stopPropagation()
    downloadICS([event], `incmty-${event.name.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.ics`)
  }

  async function handleGoogleCal(e) {
    e.stopPropagation()
    try {
      await gcal.addEvents([event])
    } catch (err) {
      alert(`Failed: ${err.message}`)
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-time">
          {fmtDayLabel(event.start.substring(0, 10))} &middot; {fmtTimeRange(event.start, event.end)}
        </div>
        <div className="modal-title">{event.name}</div>
        {event.location && (
          <div className="modal-location"><i className="fa-solid fa-location-dot"></i> {event.location}</div>
        )}
        <div className="modal-actions">
          <button
            className={`btn ${isBookmarked ? 'btn-primary' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleBookmark(event.id) }}
          >
            <i className={`fa-${isBookmarked ? 'solid' : 'regular'} fa-star`}></i> {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
          <button className="btn" onClick={handleExport}>
            <i className="fa-solid fa-calendar-plus"></i> .ics
          </button>
          {gcal.isConfigured ? (
            <button
              className="btn btn-google"
              onClick={handleGoogleCal}
              disabled={gcal.status === 'loading'}
            >
              <i className="fa-brands fa-google"></i>
              {gcal.status === 'loading' ? ' Adding...' : gcal.status === 'success' ? ' Added!' : ' Google Calendar'}
            </button>
          ) : (
            <a
              className="btn"
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
            >
              <i className="fa-brands fa-google"></i> Google Calendar
            </a>
          )}
        </div>
        <div
          className="modal-desc"
          dangerouslySetInnerHTML={{ __html: event.description || '<em style="color:var(--text-dim)">No description available</em>' }}
        />
        {event.speakers.length > 0 && (
          <div className="modal-speakers">
            <h3>Speakers</h3>
            {event.speakers.map(s => <SpeakerCard key={s.name} speaker={s} />)}
          </div>
        )}
        {event.categories.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <div className="event-tags">
              {event.categories.map(c => <span key={c} className="tag">{c}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
