import { useState, useEffect, useCallback, useRef } from 'react'
import { trackEvent } from '../analytics'

const STORAGE_KEY = 'incmty-reminders'
const REMINDER_MINUTES = 15

export function useReminders(bookmarks, allEvents) {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })
  const timersRef = useRef({})
  const shownRef = useRef(new Set())

  const toggle = useCallback(async () => {
    if (!enabled) {
      if (!('Notification' in window)) {
        alert('This browser does not support notifications')
        return
      }
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return
      localStorage.setItem(STORAGE_KEY, 'true')
      setEnabled(true)
      trackEvent('reminders_enabled')
    } else {
      localStorage.setItem(STORAGE_KEY, 'false')
      setEnabled(false)
      // Clear all timers
      Object.values(timersRef.current).forEach(clearTimeout)
      timersRef.current = {}
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || !allEvents) return

    // Clear previous timers
    Object.values(timersRef.current).forEach(clearTimeout)
    timersRef.current = {}

    const bookmarkedEvents = allEvents.filter(e => bookmarks[e.id])
    const now = Date.now()

    for (const event of bookmarkedEvents) {
      const startTime = new Date(event.start).getTime()
      const reminderTime = startTime - REMINDER_MINUTES * 60 * 1000
      const delay = reminderTime - now

      // Only schedule if reminder time is in the future and within 24 hours
      if (delay > 0 && delay < 24 * 60 * 60 * 1000 && !shownRef.current.has(event.id)) {
        timersRef.current[event.id] = setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification('incMTY 2026', {
              body: `${event.name} starts in 15 minutes — ${event.location || ''}`,
              icon: '/icon-192.png',
              tag: `incmty-${event.id}`,
            })
            shownRef.current.add(event.id)
            trackEvent('reminder_shown', { event_id: event.id })
          }
        }, delay)
      }
    }

    return () => {
      Object.values(timersRef.current).forEach(clearTimeout)
      timersRef.current = {}
    }
  }, [enabled, bookmarks, allEvents])

  return { enabled, toggle }
}
