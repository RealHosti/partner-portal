'use client'

import { useEffect } from 'react'
import { withBasePath } from '@/lib/supabase/config'

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
      return
    }

    void navigator.serviceWorker.register(withBasePath('/sw.js')).catch(() => {
      // The app still works without offline support.
    })
  }, [])

  return null
}
