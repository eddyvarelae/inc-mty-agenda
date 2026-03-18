# How We Made the incMTY 2026 Agenda App

**From zero to a full-featured PWA in under 32 hours — built by one developer and one AI.**

---

## The Problem

incMTY is one of Latin America's largest entrepreneurship and innovation festivals. Four days. 205 events. 244 speakers. 16 stages. The official platform (Eventtia) worked, but we wanted something faster, more personal, and usable offline — a companion app that felt like it was built *for* attendees, not *at* them.

We decided to build our own.

---

## The Timeline

### Day 1 — Monday, March 17, 2026

#### 8:39 AM — The First Commit

It started with a HAR file. We captured the network traffic from the Eventtia platform, reverse-engineered the API responses, and extracted all 205 events, 244 speakers, and 16 stages into a single `data.json` file (6,900+ lines of structured data).

The first commit was already a working app: React 19 + Vite 8, a dark-themed timeline view with day tabs, filter chips (by stage, topic, track, audience), full-text search, bookmarks with localStorage, and .ics export. All of it rendered from that one static JSON file — no backend, no API keys, no database.

**Stack decision:** Static JSON + React SPA. No server. Deployable anywhere. Works forever. The festival data doesn't change once published, so there's no reason to hit an API.

#### 8:50 AM — Folder Restructure

Moved everything from `app/` into the root directory. Standard Vite project structure. Quick cleanup.

#### 8:56 AM — Netlify Deploy

Added `netlify.toml`, pointed it at the repo, and had a live URL within minutes. Two commits to get the config right (the `base` directory tripped us up for 2 minutes). Site was live.

#### 10:54 AM — Visual Polish

Replaced placeholder emoji icons with Font Awesome. Custom favicon. Updated the page title. Small things that make it feel real.

#### 10:55 AM — Brand Color

Changed the accent from the default blue to `#2914ff` — incMTY's signature electric indigo. One line of CSS, but suddenly it *felt* like an incMTY product.

#### 11:02 AM — Mobile UX

On mobile, the header buttons were too wide and the filter sidebar was awkward. Made buttons icon-only on small screens (`btn-label` hidden) and turned the sidebar into a full-screen bottom sheet overlay with backdrop blur. This was the moment it became genuinely usable on a phone.

#### 11:07 AM – 11:24 AM — Google Calendar Integration

Three commits in 17 minutes:
1. Basic Google Calendar links (open in new tab)
2. Full Google Calendar API integration — OAuth flow, creates an "incMTY 2026" calendar on the user's account, bulk-adds all bookmarked events with progress UI
3. Added the OAuth client ID

This was the first "wow" moment. Bookmark your events, hit one button, and they appear in your Google Calendar. No copy-paste, no .ics file.

#### 11:46 AM — PWA Manifest

Added `manifest.json` and `apple-touch-icon`. The app could now be installed on home screens. On iOS it gets the custom icon and launches full-screen.

#### 2:39 PM — Analytics

Wired up GA4 with custom event tracking: search queries, filter clicks, bookmark adds/removes, exports, sidebar toggles, event opens. Every user action we'd want to understand later.

**End of Day 1:** A fully functional, deployed, mobile-friendly PWA with search, filters, bookmarks, .ics export, Google Calendar API integration, and analytics. ~1,200 lines of code. Built in about 6 hours.

---

### Day 2 — Tuesday, March 18, 2026

#### 4:16 PM — The Big Feature Push

Day 2 was about going from "functional" to "delightful." We implemented 10 features in a single session:

**1. Internationalization (EN/ES)**
Created a React Context-based i18n system with ~80 translation strings. Every UI label, button, placeholder, and message now works in both English and Spanish. Auto-detects browser language, toggle in the header, persists to localStorage.

**2. Dark/Light Theme Toggle**
The app was born dark. We added a complete light theme via CSS custom properties on `[data-theme="light"]` — white backgrounds, adjusted surfaces, readable contrast. Theme initializes before React renders (no flash of wrong theme). Sun/moon icon toggle in the header.

**3. Live Status Badges**
Events now show their temporal state: a pulsing red "LIVE" badge for in-progress events, an orange "In X min" badge for events starting within 30 minutes, and reduced opacity for past events. The `getEventStatus()` utility checks against real time. When viewing today's date, the timeline splits into "Happening Now," "Coming Up," and "Earlier Today" sections, and auto-scrolls to the current section.

**4. Schedule Conflict Detection**
When you bookmark an event that overlaps with an already-bookmarked event, a toast pops up: *"Conflicts with: [Event Name] at [Time]"* with an "Add anyway" button. Conflicting events show an orange warning triangle on their cards. The conflict detection runs as a memo over all bookmarked events.

**5. Speaker Index**
A searchable, alphabetical grid of all 244 speakers — deduplicated from across all events. Each card shows photo, name, position, and session count. Click a speaker to drill into their sessions. Search filters by name, position, or company.

**6. Similar Events ("You might also like")**
At the bottom of every event modal, up to 3 recommended events appear. The scoring algorithm: same topic = 4 points, same track = 3 points, shared speaker = 2 points each, same stage = 1 point. Already-bookmarked events are excluded.

**7. Agenda Summary ("My Day at a Glance")**
When you're viewing bookmarked events, a toggle switches to a compact summary view: one line per event (time, name, location), grouped by day, with total scheduled time and free time gaps calculated. Print-friendly CSS included — hit Cmd+P and you get a clean printout.

**8. Share My Agenda**
Encodes your bookmarked event IDs into the URL hash (`#agenda=12,34,56`). On mobile, uses the Web Share API (native share sheet). On desktop, copies the link to clipboard. When someone opens a shared link, a banner offers to import those events into their own bookmarks.

**9. Event Reminders**
Browser notifications 15 minutes before bookmarked events start. Uses `setTimeout` scheduling (no push server needed — the app must be open in a tab). Requests notification permission on toggle, persists preference to localStorage.

**10. Offline Support**
A service worker (`public/sw.js`) caches the app shell on install and uses cache-first for static assets, network-first for `data.json`. When the device goes offline, a sticky orange banner appears. The app remains fully functional from cache.

**End of Day 2:** 2,817 lines of source code across 19 files. 13 commits total. Every feature working.

---

## Architecture Decisions

A few choices that shaped everything:

- **Static JSON, no backend.** The event data is frozen once the festival schedule is published. A static JSON file is infinitely scalable, works offline, and costs nothing to host. We extracted it once and never looked back.

- **React Context for i18n, not a library.** With ~80 strings and 2 languages, a full i18n library would be overkill. A simple `useI18n()` hook with a `t()` function does the job in 200 lines.

- **CSS custom properties for theming.** No CSS-in-JS, no theme providers, no runtime cost. Just swap `data-theme` on `<html>` and every color updates instantly via CSS variables.

- **Conflict detection in App, not in the bookmark hook.** Keeps `useBookmarks` dead simple (toggle + localStorage) while App handles the conflict UX (toast + "add anyway"). Separation of concerns.

- **URL hash for sharing, not query params.** Works with any static host (Netlify, GitHub Pages, S3). No server-side routing needed. The hash never hits the server.

- **No component library.** Every component is hand-written. The entire CSS is one file. It keeps the bundle small (228 KB JS gzipped to 71 KB) and gives us total control over the mobile experience.

---

## By the Numbers

| Metric | Value |
|--------|-------|
| Total development time | ~8 hours across 2 days |
| Lines of source code | 2,817 |
| Commits | 13 |
| Components | 11 React components |
| Events in dataset | 205 |
| Speakers | 244 |
| Stages/Venues | 16 |
| Festival days covered | 4 (Mar 17–20) |
| Languages | 2 (EN/ES) |
| Bundle size (JS, gzipped) | 71 KB |
| Features shipped | 10 major, dozens of micro |

---

## The Stack

- **React 19** — UI framework
- **Vite 8** — Build tool and dev server
- **Font Awesome 6** — Icons
- **Google Calendar API** — Bulk calendar creation
- **GA4** — Analytics
- **Netlify** — Hosting and CI/CD
- **Claude Code (Opus 4.6)** — AI pair programmer

---

## Credits

Built by **Eddy Varela** with **Claude Code** (Anthropic's Claude Opus 4.6) as AI pair programmer.

Every line of code was written in conversation — describing what we wanted, reviewing what was generated, iterating on the details. The AI handled the implementation. The human handled the vision, the product decisions, and the "does this actually feel good on my phone?" testing.

This is what building software looks like in 2026.
