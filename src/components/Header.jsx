import { downloadICS } from '../utils'
import { useGoogleCalendar } from '../hooks/useGoogleCalendar'
import { useI18n } from '../i18n'
import { trackEvent } from '../analytics'

export default function Header({
  data, search, onSearchChange, bookmarks, bookmarkOnly, onToggleBookmarkOnly,
  view, onViewChange, theme, onToggleTheme, onToggleLang,
  remindersEnabled, onToggleReminders,
  summaryMode, onToggleSummaryMode, onShare,
}) {
  const { t, lang } = useI18n()
  const bookmarkCount = Object.keys(bookmarks).length
  const gcal = useGoogleCalendar()

  function exportAll() {
    trackEvent('export_all_ics', { event_count: data.events.length })
    downloadICS(data.events, 'incmty-2026-all-events.ics')
  }

  function exportBookmarked() {
    const bookmarked = data.events.filter(e => bookmarks[e.id])
    if (bookmarked.length === 0) return
    trackEvent('export_bookmarked_ics', { event_count: bookmarked.length })
    downloadICS(bookmarked, 'incmty-2026-my-agenda.ics')
  }

  async function addToGoogleCalendar() {
    const bookmarked = data.events.filter(e => bookmarks[e.id])
    if (bookmarked.length === 0) return
    trackEvent('google_cal_bulk_add', { event_count: bookmarked.length })
    try {
      await gcal.addEvents(bookmarked)
    } catch (err) {
      alert(`Failed to add events: ${err.message}`)
    }
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
            placeholder={t('search_placeholder')}
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
        <div className="header-actions">
          {/* View toggles */}
          <button
            className={`btn ${view === 'speakers' ? 'btn-primary' : ''}`}
            onClick={() => { trackEvent('view_change', { view: view === 'speakers' ? 'agenda' : 'speakers' }); onViewChange(view === 'speakers' ? 'agenda' : 'speakers') }}
            title={t('speakers_tab')}
          >
            <i className="fa-solid fa-users"></i>
            <span className="btn-label">{t('speakers_tab')}</span>
          </button>

          <button
            className={`btn ${bookmarkOnly ? 'btn-primary' : ''}`}
            onClick={onToggleBookmarkOnly}
            title={t('my_events')}
          >
            <i className="fa-solid fa-star"></i>
            <span className="btn-label">{t('my_events')}</span>
            {bookmarkCount > 0 && <span className="bookmark-count">{bookmarkCount}</span>}
          </button>

          {/* Summary/Timeline toggle (visible when bookmarkOnly) */}
          {bookmarkOnly && bookmarkCount > 0 && (
            <button
              className="btn"
              onClick={() => { trackEvent('toggle_summary_mode', { enabled: !summaryMode }); onToggleSummaryMode() }}
              title={summaryMode ? t('timeline_view') : t('summary_view')}
            >
              <i className={`fa-solid ${summaryMode ? 'fa-list-ul' : 'fa-table-list'}`}></i>
              <span className="btn-label">{summaryMode ? t('timeline_view') : t('summary_view')}</span>
            </button>
          )}

          {/* Share */}
          {bookmarkCount > 0 && (
            <button className="btn" onClick={onShare} title={t('share_agenda')}>
              <i className="fa-solid fa-share-nodes"></i>
              <span className="btn-label">{t('share')}</span>
            </button>
          )}

          {/* Reminders */}
          <button
            className={`btn ${remindersEnabled ? 'btn-primary' : ''}`}
            onClick={onToggleReminders}
            title={remindersEnabled ? t('reminders_on') : t('enable_reminders')}
          >
            <i className={`fa-solid ${remindersEnabled ? 'fa-bell' : 'fa-bell-slash'}`}></i>
            <span className="btn-label">{remindersEnabled ? t('reminders_on') : t('enable_reminders')}</span>
          </button>

          {/* Export buttons */}
          <button className="btn" onClick={exportAll} title={t('all_ics')}>
            <i className="fa-solid fa-calendar-days"></i>
            <span className="btn-label">{t('all_ics')}</span>
          </button>
          <button className="btn" onClick={exportBookmarked} title={t('export_label')}>
            <i className="fa-solid fa-file-export"></i>
            <span className="btn-label">{t('export_label')}</span>
          </button>
          {gcal.isConfigured && (
            <button
              className="btn btn-google"
              onClick={addToGoogleCalendar}
              disabled={gcal.status === 'loading'}
              title={t('google_cal')}
            >
              <i className="fa-brands fa-google"></i>
              <span className="btn-label">
                {gcal.status === 'loading'
                  ? `${gcal.progress.done}/${gcal.progress.total}`
                  : gcal.status === 'success'
                    ? t('added')
                    : t('google_cal')}
              </span>
              {gcal.status === 'loading' && <i className="fa-solid fa-spinner fa-spin"></i>}
              {gcal.status === 'success' && <i className="fa-solid fa-check"></i>}
            </button>
          )}

          {/* Theme toggle */}
          <button className="btn btn-icon" onClick={onToggleTheme} title={theme === 'dark' ? t('light_mode') : t('dark_mode')}>
            <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          {/* Language toggle */}
          <button className="btn btn-icon" onClick={onToggleLang} title={lang === 'en' ? 'Español' : 'English'}>
            <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{lang === 'en' ? 'ES' : 'EN'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
