import { useState, useEffect, useMemo, useCallback } from 'react'
import './styles.css'
import { useBookmarks } from './hooks/useBookmarks'
import { stripHtml } from './utils'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import DayTabs from './components/DayTabs'
import Timeline from './components/Timeline'
import EventModal from './components/EventModal'

function App() {
  const [data, setData] = useState(null)
  const [activeDay, setActiveDay] = useState(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ stage: null, tematica: null, pilar: null, perfil: null })
  const [bookmarkOnly, setBookmarkOnly] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { bookmarks, toggle: toggleBookmark, count: bookmarkCount } = useBookmarks()

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data.json')
      .then(r => r.json())
      .then(d => {
        setData(d)
        const today = new Date().toISOString().substring(0, 10)
        setActiveDay(d.dates.includes(today) ? today : d.dates[0])
      })
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') setSelectedEvent(null)
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && e.target.tagName !== 'INPUT') {
        e.preventDefault()
        document.querySelector('.search-box input')?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ stage: null, tematica: null, pilar: null, perfil: null })
    setSearch('')
    setBookmarkOnly(false)
  }, [])

  const filteredEvents = useMemo(() => {
    if (!data) return []
    let events = data.events

    if (activeDay) events = events.filter(e => e.start.startsWith(activeDay))
    if (bookmarkOnly) events = events.filter(e => bookmarks[e.id])
    if (filters.stage) events = events.filter(e => e.stage === filters.stage)
    if (filters.tematica) events = events.filter(e => e.tematica === filters.tematica)
    if (filters.pilar) events = events.filter(e => e.pilar === filters.pilar)
    if (filters.perfil) events = events.filter(e => e.perfil === filters.perfil)
    if (search) {
      const q = search.toLowerCase()
      events = events.filter(e =>
        e.name.toLowerCase().includes(q) ||
        stripHtml(e.description).toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.speakers.some(s =>
          s.name.toLowerCase().includes(q) ||
          (s.position || '').toLowerCase().includes(q)
        )
      )
    }

    return events
  }, [data, activeDay, bookmarkOnly, bookmarks, filters, search])

  if (!data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-dim)' }}>
        Loading...
      </div>
    )
  }

  return (
    <>
      <Header
        data={data}
        search={search}
        onSearchChange={setSearch}
        bookmarks={bookmarks}
        bookmarkOnly={bookmarkOnly}
        onToggleBookmarkOnly={() => setBookmarkOnly(v => !v)}
      />
      <div className="main">
        <Sidebar
          data={data}
          filters={filters}
          activeDay={activeDay}
          onFilterChange={handleFilterChange}
          onClear={clearFilters}
          open={sidebarOpen}
        />
        <div className="content">
          <DayTabs
            dates={data.dates}
            events={data.events}
            activeDay={activeDay}
            onDayChange={setActiveDay}
          />
          <Timeline
            events={filteredEvents}
            activeDay={activeDay}
            bookmarks={bookmarks}
            filters={filters}
            onToggleBookmark={toggleBookmark}
            onEventClick={setSelectedEvent}
          />
        </div>
      </div>
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(v => !v)}
      >
        <i className="fa-solid fa-bars"></i>
      </button>
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isBookmarked={!!bookmarks[selectedEvent.id]}
          onToggleBookmark={toggleBookmark}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  )
}

export default App
