'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const h = (e: MediaQueryListEvent) => setMatch(e.matches)
    setMatch(mq.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [query])
  return match
}

export function useIsMobile(bp = 720) {
  return useMediaQuery(`(max-width: ${bp}px)`)
}
