import { useState, useCallback } from 'react'

const STORAGE_KEY = 'incmty-bookmarks'

function loadBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(loadBookmarks)

  const toggle = useCallback((id) => {
    setBookmarks(prev => {
      const next = { ...prev }
      if (next[id]) delete next[id]
      else next[id] = true
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { bookmarks, toggle, count: Object.keys(bookmarks).length }
}
