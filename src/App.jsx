import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import './styles.css'
import { useBookmarks } from './hooks/useBookmarks'
import { useReminders } from './hooks/useReminders'
import { useI18n } from './i18n'
import { stripHtml, eventsOverlap, fmtTime, getMTYToday } from './utils'
import { trackEvent } from './analytics'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import DayTabs from './components/DayTabs'
import Timeline from './components/Timeline'
import EventModal from './components/EventModal'
import SpeakerIndex from './components/SpeakerIndex'
import AgendaSummary from './components/AgendaSummary'
import Toast from './components/Toast'

function getInitialTheme() {
  const saved = localStorage.getItem('incmty-theme')
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function parseSharedAgenda() {
  const hash = location.hash
  if (hash.startsWith('#agenda=')) {
    try {
      return hash.substring(8).split(',').filter(Boolean)
    } catch { return null }
  }
  return null
}

function App() {
  const { t, toggleLang } = useI18n()
  const [data, setData] = useState(null)
  const [activeDay, setActiveDay] = useState(null)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ stage: null, tematica: null, pilar: null, perfil: null })
  const [bookmarkOnly, setBookmarkOnly] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [view, setView] = useState('agenda') // 'agenda' | 'speakers'
  const [summaryMode, setSummaryMode] = useState(false)
  const [theme, setTheme] = useState(getInitialTheme)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [toast, setToast] = useState(null)
  const [sharedAgenda, setSharedAgenda] = useState(parseSharedAgenda)

  const { bookmarks, toggle: rawToggleBookmark, count: bookmarkCount } = useBookmarks()
  const { enabled: remindersEnabled, toggle: toggleReminders } = useReminders(bookmarks, data?.events)
  const searchTimer = useRef(null)

  // Theme management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('incmty-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      trackEvent('theme_toggle', { theme: next })
      return next
    })
  }, [])

  // Online/Offline detection
  useEffect(() => {
    const onOnline = () => setIsOffline(false)
    const onOffline = () => setIsOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Conflict detection
  const conflictingIds = useMemo(() => {
    if (!data) return new Set()
    const bookmarked = data.events.filter(e => bookmarks[e.id])
    const ids = new Set()
    for (let i = 0; i < bookmarked.length; i++) {
      for (let j = i + 1; j < bookmarked.length; j++) {
        if (eventsOverlap(bookmarked[i], bookmarked[j])) {
          ids.add(bookmarked[i].id)
          ids.add(bookmarked[j].id)
        }
      }
    }
    return ids
  }, [data, bookmarks])

  // Bookmark with conflict check
  const handleToggleBookmark = useCallback((id) => {
    if (!bookmarks[id] && data) {
      const ev = data.events.find(e => e.id === id)
      if (ev) {
        const bookmarkedEvents = data.events.filter(e => bookmarks[e.id])
        const conflict = bookmarkedEvents.find(b => eventsOverlap(ev, b))
        if (conflict) {
          setToast({
            message: t('conflict_with', { name: conflict.name, time: fmtTime(conflict.start) }),
            action: t('add_anyway'),
            onAction: () => { rawToggleBookmark(id); setToast(null) },
          })
          return
        }
      }
    }
    rawToggleBookmark(id)
  }, [bookmarks, data, rawToggleBookmark, t])

  // Share agenda
  const handleShare = useCallback(async () => {
    const ids = Object.keys(bookmarks).join(',')
    const url = `${location.origin}${location.pathname}#agenda=${ids}`
    trackEvent('share_agenda', { event_count: Object.keys(bookmarks).length })

    if (navigator.share) {
      try {
        await navigator.share({ title: 'incMTY 2026 Agenda', url })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      setToast({ message: t('copied') })
    }
  }, [bookmarks, t])

  // Handle shared agenda import
  const handleImportShared = useCallback(() => {
    if (!sharedAgenda || !data) return
    for (const id of sharedAgenda) {
      const numId = parseInt(id, 10) || id
      if (!bookmarks[numId]) rawToggleBookmark(numId)
    }
    setSharedAgenda(null)
    history.replaceState(null, '', location.pathname)
    trackEvent('import_shared_agenda', { event_count: sharedAgenda.length })
  }, [sharedAgenda, data, bookmarks, rawToggleBookmark])

  const handleSearchChange = useCallback((value) => {
    setSearch(value)
    clearTimeout(searchTimer.current)
    if (value.length >= 2) {
      searchTimer.current = setTimeout(() => {
        trackEvent('search', { search_term: value })
      }, 800)
    }
  }, [])

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data.json')
      .then(r => r.json())
      .then(d => {
        setData(d)
        const today = getMTYToday()
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
        {t('loading')}
      </div>
    )
  }

  return (
    <>
      {isOffline && (
        <div className="offline-banner">
          <i className="fa-solid fa-wifi-slash"></i> {t('offline_banner')}
        </div>
      )}
      {sharedAgenda && (
        <div className="shared-banner">
          <span>{t('shared_agenda')} ({sharedAgenda.length} {t('events_count')})</span>
          <button className="btn btn-sm btn-primary" onClick={handleImportShared}>
            {t('import_bookmarks')}
          </button>
          <button className="btn btn-sm" onClick={() => { setSharedAgenda(null); history.replaceState(null, '', location.pathname) }}>
            {t('dismiss')}
          </button>
        </div>
      )}
      <Header
        data={data}
        search={search}
        onSearchChange={handleSearchChange}
        bookmarks={bookmarks}
        bookmarkOnly={bookmarkOnly}
        onToggleBookmarkOnly={() => { setBookmarkOnly(v => { trackEvent('toggle_my_events', { enabled: !v }); return !v }); }}
        view={view}
        onViewChange={setView}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleLang={toggleLang}
        remindersEnabled={remindersEnabled}
        onToggleReminders={toggleReminders}
        summaryMode={summaryMode}
        onToggleSummaryMode={() => setSummaryMode(v => !v)}
        onShare={handleShare}
      />
      <div className="main">
        {view === 'speakers' ? (
          <div className="content">
            <SpeakerIndex
              events={data.events}
              bookmarks={bookmarks}
              onToggleBookmark={handleToggleBookmark}
              onEventClick={setSelectedEvent}
            />
          </div>
        ) : bookmarkOnly && summaryMode ? (
          <div className="content">
            <AgendaSummary
              events={filteredEvents}
              onEventClick={setSelectedEvent}
            />
          </div>
        ) : (
          <>
            <Sidebar
              data={data}
              filters={filters}
              activeDay={activeDay}
              onFilterChange={handleFilterChange}
              onClear={clearFilters}
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
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
                conflictingIds={conflictingIds}
                filters={filters}
                onToggleBookmark={handleToggleBookmark}
                onEventClick={setSelectedEvent}
              />
            </div>
          </>
        )}
      </div>
      {view === 'agenda' && !summaryMode && (
        <button
          className="sidebar-toggle"
          onClick={() => { trackEvent('sidebar_toggle'); setSidebarOpen(v => !v) }}
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      )}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isBookmarked={!!bookmarks[selectedEvent.id]}
          onToggleBookmark={handleToggleBookmark}
          onClose={() => setSelectedEvent(null)}
          allEvents={data.events}
          bookmarks={bookmarks}
          onEventClick={(ev) => setSelectedEvent(ev)}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          action={toast.action}
          onAction={toast.onAction}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  )
}

export default App
