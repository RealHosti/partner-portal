'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  ChevronRight,
  MessageSquare,
  MessagesSquare,
  Newspaper,
  Radio,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { usePortalSession } from '@/hooks/use-auth-profile'

type HubStats = {
  unreadMessages: number
  pendingAppointments: number
  forumTopics: number
  publishedPosts: number
}

const demoStats: HubStats = {
  unreadMessages: 3,
  pendingAppointments: 1,
  forumTopics: 7,
  publishedPosts: 4,
}

const quickActions = [
  {
    href: '/dashboard/messages/new',
    label: 'Nachricht senden',
    detail: 'Briefing, Angebot oder Rueckfrage direkt an Realhosti schicken.',
    icon: MessageSquare,
  },
  {
    href: '/dashboard/chat',
    label: 'Live-Chat starten',
    detail: 'Schnelle Abstimmung im Partnerraum.',
    icon: MessagesSquare,
  },
  {
    href: '/dashboard/forum',
    label: 'Forum Beitrag',
    detail: 'Ideen, Assets und Kampagnenfragen gemeinsam sammeln.',
    icon: Users,
  },
  {
    href: '/dashboard/blog',
    label: 'Updates lesen',
    detail: 'Releases, Timings und Partner-News an einem Ort.',
    icon: Newspaper,
  },
]

export default function DashboardPage() {
  const { profile, isDemo } = usePortalSession()
  const [stats, setStats] = useState<HubStats>(demoStats)

  useEffect(() => {
    let active = true

    async function loadStats() {
      if (!isSupabaseConfigured() || !profile) {
        setStats(demoStats)
        return
      }

      const supabase = createClient()
      const [messages, appointments, topics, posts] = await Promise.all([
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .or(`recipient_id.eq.${profile.id},sender_id.eq.${profile.id}`)
          .eq('is_read', false),
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('status', 'pending'),
        supabase
          .from('forum_topics')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', profile.id),
        supabase
          .from('blog_posts')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', true),
      ])

      if (active) {
        setStats({
          unreadMessages: messages.count ?? 0,
          pendingAppointments: appointments.count ?? 0,
          forumTopics: topics.count ?? 0,
          publishedPosts: posts.count ?? 0,
        })
      }
    }

    void loadStats()

    return () => {
      active = false
    }
  }, [profile])

  return (
    <div className="space-y-5">
      <section className="portal-panel overflow-hidden p-0">
        <div className="relative min-h-[260px]">
          <Image
            src="/images/banner.png"
            alt="Realhosti Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/78 to-background/10" />
          <div className="relative z-10 flex min-h-[260px] flex-col justify-between p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">
                <Radio className="size-3" />
                Partner Hub
              </Badge>
              {isDemo ? <Badge variant="outline" className="border-primary/60 text-primary">Demo Daten</Badge> : null}
            </div>
            <div className="max-w-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-primary">Realhosti Cooperation Deck</p>
              <h2 className="mt-2 font-display text-6xl leading-none sm:text-7xl">
                Willkommen im
                <span className="block text-primary text-glow-orange">Portal</span>
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                Von Anfrage bis Release: alle Partner-Absprachen laufen hier als app-artiges Cockpit zusammen.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Ungelesen" value={stats.unreadMessages} icon={MessageSquare} href="/dashboard/messages" />
        <StatTile label="Offene Termine" value={stats.pendingAppointments} icon={Calendar} href="/dashboard/appointments" />
        <StatTile label="Forum Topics" value={stats.forumTopics} icon={Users} href="/dashboard/forum" />
        <StatTile label="Blog Releases" value={stats.publishedPosts} icon={Newspaper} href="/dashboard/blog" />
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href} className="portal-panel group p-4 transition hover:border-primary/60">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-secondary text-primary">
                <action.icon className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{action.label}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{action.detail}</p>
              </div>
              <ChevronRight className="mt-3 size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </div>
          </Link>
        ))}
      </section>

      <section className="portal-panel p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-primary">Naechster sinnvoller Schritt</p>
            <h3 className="mt-1 text-xl font-semibold">Erstelle deine erste Partner-Anfrage</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Beschreibe Kampagne, Zeitraum, Deliverables und offene Fragen. Danach kannst du im Chat direkt nachziehen.
            </p>
          </div>
          <Button asChild className="h-11 shrink-0 rounded-lg">
            <Link href="/dashboard/messages/new">
              Anfrage schreiben
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function StatTile({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  href: string
}) {
  return (
    <Link href={href} className="portal-panel p-4 transition hover:border-primary/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-5xl leading-none text-primary">{value}</p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="size-6" />
        </div>
      </div>
    </Link>
  )
}
