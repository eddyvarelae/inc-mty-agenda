import { downloadICS, openGoogleCalendarBulk } from '../utils'

export default function Header({ data, search, onSearchChange, bookmarks, bookmarkOnly, onToggleBookmarkOnly }) {
  const bookmarkCount = Object.keys(bookmarks).length

  function exportAll() {
    downloadICS(data.events, 'incmty-2026-all-events.ics')
  }

  function exportBookmarked() {
    const bookmarked = data.events.filter(e => bookmarks[e.id])
    if (bookmarked.length === 0) {
      alert('No events bookmarked yet! Click the star on events to add them to your calendar.')
      return
    }
    downloadICS(bookmarked, 'incmty-2026-my-agenda.ics')
  }

  function addToGoogleCalendar() {
    const bookmarked = data.events.filter(e => bookmarks[e.id])
    if (bookmarked.length === 0) {
      alert('No events bookmarked yet! Click the star on events to add them to your calendar.')
      return
    }
    if (bookmarked.length > 10) {
      if (!confirm(`This will open ${bookmarked.length} tabs in Google Calendar. Continue?`)) return
    }
    openGoogleCalendarBulk(bookmarked)
  }

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          incMTY<small>Festival 2026 Agenda</small>
        </div>
        <div className="search-box">
          <span className="search-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
          <input
            type="text"
            placeholder="Search events, speakers, topics..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
        <div className="header-actions">
          <button
            className={`btn ${bookmarkOnly ? 'btn-primary' : ''}`}
            onClick={onToggleBookmarkOnly}
            title="My Events"
          >
            <i className="fa-solid fa-star"></i>
            <span className="btn-label">My Events</span>
            <span className="bookmark-count">{bookmarkCount}</span>
          </button>
          <button className="btn btn-primary" onClick={exportAll} title="Download all events as .ics">
            <i className="fa-solid fa-calendar-days"></i>
            <span className="btn-label">All .ics</span>
          </button>
          <button className="btn btn-primary" onClick={exportBookmarked} title="Export starred events as .ics">
            <i className="fa-solid fa-file-export"></i>
            <span className="btn-label">Export</span>
          </button>
          <button className="btn btn-primary" onClick={addToGoogleCalendar} title="Add starred events to Google Calendar">
            <i className="fa-brands fa-google"></i>
            <span className="btn-label">Google Cal</span>
          </button>
        </div>
      </div>
    </header>
  )
}
