export function fmtTime(iso) {
  const d = new Date(iso)
  const mty = new Date(d.getTime() - 6 * 60 * 60 * 1000)
  const h = mty.getUTCHours()
  const m = mty.getUTCMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export function fmtTimeRange(start, end) {
  return `${fmtTime(start)} – ${fmtTime(end)}`
}

export function fmtDayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`
}

export function stripHtml(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html || ''
  return tmp.textContent || ''
}

export function truncate(str, len) {
  if (!str || str.length <= len) return str || ''
  return str.substring(0, len) + '...'
}

function escapeIcs(text) {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

export function makeICS(events) {
  let lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//incMTY Agenda//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:incMTY 2026',
    'X-WR-TIMEZONE:America/Monterrey',
  ]

  for (const ev of events) {
    const start = ev.start.replace(/[-:]/g, '').replace('.000Z', 'Z')
    const end = ev.end.replace(/[-:]/g, '').replace('.000Z', 'Z')
    let desc = stripHtml(ev.description)
    const speakers = ev.speakers.map(s => s.name).join(', ')
    if (speakers) desc += `\n\nSpeakers: ${speakers}`

    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${ev.guid || ev.id}@incmty2026`)
    lines.push(`DTSTART:${start}`)
    lines.push(`DTEND:${end}`)
    lines.push(`SUMMARY:${escapeIcs(ev.name)}`)
    lines.push(`DESCRIPTION:${escapeIcs(desc)}`)
    if (ev.location) lines.push(`LOCATION:${escapeIcs(ev.location)}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n') + '\r\n'
}

export function googleCalendarUrl(ev) {
  const start = ev.start.replace(/[-:]/g, '').replace('.000Z', 'Z')
  const end = ev.end.replace(/[-:]/g, '').replace('.000Z', 'Z')
  let desc = stripHtml(ev.description)
  const speakers = ev.speakers.map(s => s.name).join(', ')
  if (speakers) desc += `\n\nSpeakers: ${speakers}`

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.name,
    dates: `${start}/${end}`,
    details: desc.substring(0, 1500),
    location: ev.location || '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// MTY timezone offset: UTC-6 (CST)
const MTY_OFFSET = -6

function toMTY(date) {
  const d = new Date(date)
  return new Date(d.getTime() + MTY_OFFSET * 60 * 60 * 1000)
}

export function getMTYToday() {
  return toMTY(new Date()).toISOString().substring(0, 10)
}

export function isToday(dateStr) {
  return dateStr === getMTYToday()
}

export function isTomorrow(dateStr) {
  const today = toMTY(new Date())
  const tomorrow = new Date(today)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  return dateStr === tomorrow.toISOString().substring(0, 10)
}

export function minutesUntil(isoStart) {
  return (new Date(isoStart).getTime() - Date.now()) / 60000
}

export function getEventStatus(start, end) {
  const now = Date.now()
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (now >= s && now <= e) return 'live'
  if (now < s && (s - now) <= 30 * 60000) return 'starting-soon'
  if (now > e) return 'past'
  return 'upcoming'
}

export function eventsOverlap(a, b) {
  return new Date(a.start) < new Date(b.end) && new Date(b.start) < new Date(a.end)
}

export function openGoogleCalendarBulk(events) {
  // Open first event immediately, rest with small delays to avoid popup blockers
  events.forEach((ev, i) => {
    setTimeout(() => {
      window.open(googleCalendarUrl(ev), '_blank')
    }, i * 600)
  })
}

export function downloadICS(events, filename) {
  const ics = makeICS(events)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
