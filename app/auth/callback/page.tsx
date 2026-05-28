'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function finishLogin() {
      if (!isSupabaseConfigured()) {
        setError('Supabase ist noch nicht konfiguriert.')
        return
      }

      const supabase = createClient()
      const params = new URLSearchParams(window.location.search)
      let code = params.get('code')

      if (!code) {
        const hash = window.location.hash.replace(/^#/, '')
        const queryIndex = hash.indexOf('?')
        const hashQuery =
          hash.startsWith('/auth/callback') && queryIndex >= 0
            ? hash.slice(queryIndex + 1)
            : hash.startsWith('code=') || hash.startsWith('error=')
              ? hash
              : ''
        code = new URLSearchParams(hashQuery).get('code')
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setError(exchangeError.message)
          return
        }
      } else {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          setError('Keine gueltige Twitch Session gefunden.')
          return
        }
      }

      if (active) {
        router.replace('/dashboard')
      }
    }

    void finishLogin()

    return () => {
      active = false
    }
  }, [router])

  return (
    <main className="min-h-svh bg-background text-foreground app-backdrop flex items-center justify-center px-6">
      <div className="portal-panel max-w-sm p-6 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground glow-orange">
          <Zap className="size-7" />
        </div>
        <p className="font-display text-4xl tracking-wide text-primary">Twitch Login</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {error ? 'Der Login konnte nicht abgeschlossen werden.' : 'Session wird vorbereitet.'}
        </p>
        {error ? (
          <>
            <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
            <Button className="mt-5 rounded-lg" onClick={() => router.push('/')}>
              Zur Startseite
            </Button>
          </>
        ) : null}
      </div>
    </main>
  )
}
