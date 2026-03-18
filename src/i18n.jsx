import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const translations = {
  en: {
    search_placeholder: 'Search events, speakers, topics...',
    my_events: 'My Events',
    all_ics: 'All .ics',
    export_label: 'Export',
    google_cal: 'Google Cal',
    adding: 'Adding...',
    added: 'Added!',
    share: 'Share',
    speakers_tab: 'Speakers',
    agenda_tab: 'Agenda',
    enable_reminders: 'Reminders',
    reminders_on: 'Reminders On',

    filters: 'Filters',
    stage_venue: 'Stage / Venue',
    topic: 'Topic',
    track: 'Track',
    audience: 'Audience',
    clear_all: 'Clear all filters',

    all_days: 'All Days',
    today: 'Today',
    tomorrow: 'Tomorrow',

    events_count: 'events',
    speakers_count: 'speakers',
    filtered: 'Filtered',
    no_events: 'No events match your filters',
    happening_now: 'Happening Now',
    coming_up: 'Coming Up',
    earlier_today: 'Earlier Today',

    remove_bookmark: 'Remove bookmark',
    bookmark: 'Bookmark',
    more: 'more',
    live: 'LIVE',
    starting_soon: 'In {min} min',

    bookmarked: 'Bookmarked',
    speakers_heading: 'Speakers',
    show_less: 'Show less',
    show_more: 'Show more',
    no_description: 'No description available',
    google_calendar: 'Google Calendar',
    similar_events: 'You might also like',

    conflict_with: 'Conflicts with: {name} at {time}',
    add_anyway: 'Add anyway',
    dismiss: 'Dismiss',

    share_agenda: 'Share My Agenda',
    shared_agenda: 'Shared Agenda',
    import_bookmarks: 'Import to My Events',
    copied: 'Link copied!',

    offline_banner: "You're offline — showing cached data",

    reminder_title: 'incMTY 2026',
    reminder_body: '{name} starts in 15 minutes — {location}',

    my_day: 'My Day at a Glance',
    total_time: 'Total time',
    free_time: 'Free',
    summary_view: 'Summary',
    timeline_view: 'Timeline',
    no_bookmarks_summary: 'Star some events to see your day at a glance',

    search_speakers: 'Search speakers...',
    sessions: 'sessions',
    no_speakers_found: 'No speakers found',
    all_sessions: 'All sessions by {name}',
    back_to_speakers: 'Back to speakers',

    light_mode: 'Light mode',
    dark_mode: 'Dark mode',
    loading: 'Loading...',
  },
  es: {
    search_placeholder: 'Buscar eventos, ponentes, temas...',
    my_events: 'Mis Eventos',
    all_ics: 'Todo .ics',
    export_label: 'Exportar',
    google_cal: 'Google Cal',
    adding: 'Agregando...',
    added: '¡Listo!',
    share: 'Compartir',
    speakers_tab: 'Ponentes',
    agenda_tab: 'Agenda',
    enable_reminders: 'Recordatorios',
    reminders_on: 'Recordatorios On',

    filters: 'Filtros',
    stage_venue: 'Escenario / Sede',
    topic: 'Temática',
    track: 'Pilar',
    audience: 'Perfil',
    clear_all: 'Limpiar filtros',

    all_days: 'Todos',
    today: 'Hoy',
    tomorrow: 'Mañana',

    events_count: 'eventos',
    speakers_count: 'ponentes',
    filtered: 'Filtrado',
    no_events: 'No hay eventos con estos filtros',
    happening_now: 'En Vivo',
    coming_up: 'Próximamente',
    earlier_today: 'Anteriores',

    remove_bookmark: 'Quitar favorito',
    bookmark: 'Favorito',
    more: 'más',
    live: 'EN VIVO',
    starting_soon: 'En {min} min',

    bookmarked: 'Guardado',
    speakers_heading: 'Ponentes',
    show_less: 'Ver menos',
    show_more: 'Ver más',
    no_description: 'Sin descripción disponible',
    google_calendar: 'Google Calendar',
    similar_events: 'También te puede interesar',

    conflict_with: 'Conflicto con: {name} a las {time}',
    add_anyway: 'Agregar igual',
    dismiss: 'Cerrar',

    share_agenda: 'Compartir Agenda',
    shared_agenda: 'Agenda Compartida',
    import_bookmarks: 'Importar a Mis Eventos',
    copied: '¡Link copiado!',

    offline_banner: 'Sin conexión — mostrando datos en caché',

    reminder_title: 'incMTY 2026',
    reminder_body: '{name} comienza en 15 minutos — {location}',

    my_day: 'Mi Día de un Vistazo',
    total_time: 'Tiempo total',
    free_time: 'Libre',
    summary_view: 'Resumen',
    timeline_view: 'Timeline',
    no_bookmarks_summary: 'Marca eventos con estrella para ver tu día de un vistazo',

    search_speakers: 'Buscar ponentes...',
    sessions: 'sesiones',
    no_speakers_found: 'No se encontraron ponentes',
    all_sessions: 'Sesiones de {name}',
    back_to_speakers: 'Volver a ponentes',

    light_mode: 'Modo claro',
    dark_mode: 'Modo oscuro',
    loading: 'Cargando...',
  },
}

const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('incmty-lang')
    if (saved) return saved
    return navigator.language.startsWith('es') ? 'es' : 'en'
  })

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'es' : 'en'
      localStorage.setItem('incmty-lang', next)
      return next
    })
  }, [])

  const t = useCallback((key, params) => {
    let str = translations[lang]?.[key] || translations.en[key] || key
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v)
      })
    }
    return str
  }, [lang])

  const value = useMemo(() => ({ lang, toggleLang, t }), [lang, toggleLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
