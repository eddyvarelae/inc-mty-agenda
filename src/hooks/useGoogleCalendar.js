import { useState, useCallback, useRef } from 'react'
import { stripHtml } from '../utils'

const SCOPES = 'https://www.googleapis.com/auth/calendar'
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3'
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export function useGoogleCalendar() {
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const tokenRef = useRef(null)

  const getAccessToken = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google Identity Services not loaded'))
        return
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error))
          } else {
            tokenRef.current = response.access_token
            resolve(response.access_token)
          }
        },
      })
      client.requestAccessToken()
    })
  }, [])

  const apiFetch = useCallback(async (path, options = {}) => {
    const token = tokenRef.current
    const res = await fetch(`${CALENDAR_API}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error?.message || `API error ${res.status}`)
    }
    return res.json()
  }, [])

  const findOrCreateCalendar = useCallback(async (name) => {
    // Check if calendar already exists
    const { items } = await apiFetch('/users/me/calendarList')
    const existing = items?.find(c => c.summary === name)
    if (existing) return existing.id

    // Create new calendar
    const cal = await apiFetch('/calendars', {
      method: 'POST',
      body: JSON.stringify({
        summary: name,
        description: 'Events from incMTY Festival 2026 Agenda',
        timeZone: 'America/Monterrey',
      }),
    })
    return cal.id
  }, [apiFetch])

  const addEvents = useCallback(async (events) => {
    if (!CLIENT_ID) {
      setStatus('error')
      throw new Error('Google Client ID not configured')
    }

    setStatus('loading')
    setProgress({ done: 0, total: events.length })

    try {
      await getAccessToken()
      const calendarId = await findOrCreateCalendar('incMTY 2026')

      // Fetch existing events to avoid duplicates
      const existing = await apiFetch(`/calendars/${encodeURIComponent(calendarId)}/events?maxResults=2500`)
      const existingGuids = new Set(
        (existing.items || []).map(e => e.extendedProperties?.private?.incmtyId).filter(Boolean)
      )

      const toAdd = events.filter(ev => !existingGuids.has(ev.id))
      setProgress({ done: 0, total: toAdd.length })

      if (toAdd.length === 0) {
        setStatus('success')
        setProgress({ done: events.length, total: events.length })
        return
      }

      // Add events in batches of 5 to avoid rate limits
      for (let i = 0; i < toAdd.length; i += 5) {
        const batch = toAdd.slice(i, i + 5)
        await Promise.all(batch.map(ev => {
          let desc = stripHtml(ev.description)
          const speakers = ev.speakers.map(s => s.name).join(', ')
          if (speakers) desc += `\n\nSpeakers: ${speakers}`

          return apiFetch(`/calendars/${encodeURIComponent(calendarId)}/events`, {
            method: 'POST',
            body: JSON.stringify({
              summary: ev.name,
              description: desc,
              location: ev.location || '',
              start: {
                dateTime: ev.start.replace('.000Z', 'Z'),
                timeZone: 'UTC',
              },
              end: {
                dateTime: ev.end.replace('.000Z', 'Z'),
                timeZone: 'UTC',
              },
              extendedProperties: {
                private: { incmtyId: ev.id },
              },
            }),
          })
        }))
        setProgress({ done: Math.min(i + 5, toAdd.length), total: toAdd.length })
      }

      setStatus('success')
    } catch (err) {
      console.error('Google Calendar error:', err)
      setStatus('error')
      throw err
    }
  }, [getAccessToken, findOrCreateCalendar, apiFetch])

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress({ done: 0, total: 0 })
  }, [])

  return { addEvents, status, progress, reset, isConfigured: !!CLIENT_ID }
}
