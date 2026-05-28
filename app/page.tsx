'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  MessageSquare,
  MessagesSquare,
  Newspaper,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react'
import { TwitchLoginButton } from '@/components/auth/twitch-login-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { canUseLocalDemo, isSupabaseConfigured } from '@/lib/supabase/config'

const appModules = [
  { label: 'Direktnachrichten', icon: MessageSquare, detail: 'Briefings, Angebote, Rueckfragen' },
  { label: 'Live-Chat', icon: MessagesSquare, detail: 'Schneller Austausch im Partnerraum' },
  { label: 'Forum', icon: Users, detail: 'Threads, Antworten, Ideen sammeln' },
  { label: 'Blog', icon: Newspaper, detail: 'Updates und Releases wie in einer Event-App' },
  { label: 'Termine', icon: Calendar, detail: 'Slots fuer Calls und Kampagnen' },
]

export default function HomePage() {
  const router = useRouter()
  const configured = isSupabaseConfigured()
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '')
    const queryIndex = hash.indexOf('?')
    const hashQuery =
      hash.startsWith('/auth/callback') && queryIndex >= 0
        ? hash.slice(queryIndex + 1)
        : hash.startsWith('code=') || hash.startsWith('error=')
          ? hash
          : null

    if (hashQuery) {
      router.replace(`/auth/callback/?${hashQuery}`)
    }
  }, [router])

  useEffect(() => {
    let active = true

    async function checkSession() {
      if (!configured) {
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (active) {
        setHasSession(Boolean(user))
      }
    }

    void checkSession()

    return () => {
      active = false
    }
  }, [configured])

  return (
    <main className="min-h-svh overflow-hidden bg-background text-foreground app-backdrop">
      <section className="mx-auto grid min-h-svh max-w-7xl content-center gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <nav className="mb-8 flex items-center justify-between lg:mb-12">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground glow-orange">
                <Zap className="size-7" />
              </div>
              <div className="leading-none">
                <p className="font-display text-4xl tracking-wide">
                  <span className="text-primary">Real</span>
                  <span>hosti</span>
                </p>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Partner App</p>
              </div>
            </div>
            <Badge variant="outline" className="hidden border-primary/60 text-primary sm:inline-flex">
              Twitch OAuth
            </Badge>
          </nav>

          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
              <ShieldCheck className="size-4" />
              Exklusiv fuer Kooperationen und Sponsoring-Partner
            </div>
            <h1 className="font-display text-[clamp(4rem,14vw,8rem)] leading-[0.78] tracking-wide">
              Partner
              <span className="block text-primary text-glow-orange">Portal</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Eine mobile App-Oberflaeche fuer Twitch-Partner: anmelden mit Twitch, direkt schreiben,
              live chatten, Forum nutzen und Blog-Updates erhalten.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {hasSession ? (
                <Button asChild size="lg" className="h-12 rounded-lg px-6 text-base glow-orange">
                  <Link href="/dashboard">Portal oeffnen</Link>
                </Button>
              ) : (
                <TwitchLoginButton />
              )}
              <Button asChild variant="outline" size="lg" className="h-12 rounded-lg border-primary/40 px-6 text-base">
                <Link href="https://twitch.tv/realhosti" target="_blank">
                  Twitch ansehen
                </Link>
              </Button>
            </div>

            {!configured ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {canUseLocalDemo()
                  ? 'Lokale Demo aktiv. Fuer echte Logins .env.local mit Supabase-Daten setzen.'
                  : 'Supabase ist noch nicht konfiguriert. Login ist erst nach dem Setzen der GitHub Secrets aktiv.'}
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <div className="portal-panel overflow-hidden p-0">
            <div className="relative aspect-[16/7] overflow-hidden border-b border-border/80">
              <Image
                src="/images/banner.png"
                alt="Realhosti Gaming Banner"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-primary">Command Center</p>
                  <h2 className="font-display text-5xl leading-none">Kooperationen</h2>
                </div>
                <Badge className="bg-primary text-primary-foreground">Live</Badge>
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {appModules.map((item) => (
                <div key={item.label} className="rounded-lg border border-border/80 bg-secondary/45 p-4">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-background text-primary">
                    <item.icon className="size-5" />
                  </div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute -right-8 -top-8 hidden h-28 w-36 skew-x-[-18deg] border border-primary/35 bg-primary/10 lg:block" />
          <div className="pointer-events-none absolute -bottom-6 -left-6 hidden h-20 w-32 skew-x-[-18deg] bg-foreground/8 lg:block" />
        </div>
      </section>
    </main>
  )
}
