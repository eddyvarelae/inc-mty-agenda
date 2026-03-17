import { downloadICS } from '../utils'

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

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          incMTY<small>Festival 2026 Agenda</small>
        </div>
        <div className="search-box">
          <span className="search-icon">&#128269;</span>
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
          >
            &#9733; My Events <span className="bookmark-count">{bookmarkCount}</span>
          </button>
          <button className="btn btn-primary" onClick={exportAll}>
            &#128197; All Events .ics
          </button>
          <button className="btn btn-primary" onClick={exportBookmarked}>
            &#11088; Export My Events
          </button>
        </div>
      </div>
    </header>
  )
}
