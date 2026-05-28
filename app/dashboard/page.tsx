'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Bookmark,
  BriefcaseBusiness,
  Calendar,
  ChevronRight,
  CheckCircle2,
  ContactRound,
  Globe2,
  MapPin,
  MessageSquare,
  MessagesSquare,
  Newspaper,
  Radio,
  Sparkles,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { usePortalSession } from '@/hooks/use-auth-profile'
import { getProfileCompletion } from '@/lib/profile-completion'

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
    href: '/dashboard/contacts',
    label: 'Kontakte qualifizieren',
    detail: 'Partnerprofile, Firmenkontext und Kontaktwege im Desktop-Verzeichnis pflegen.',
    icon: ContactRound,
  },
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

const spotlightContacts = [
  {
    initials: 'ZH',
    name: 'Zoe Huang',
    role: 'Sales Representative',
    company: 'HOLLYLAND',
    date: 'Heute',
  },
  {
    initials: 'EF',
    name: 'Elyas Fehri',
    role: 'Social Content Creator',
    company: 'Nitrodo',
    date: 'Gestern',
  },
  {
    initials: 'MS',
    name: 'Manmohen Singh',
    role: 'Key Account Manager',
    company: 'Gcore',
    date: 'Fr. 22. Aug.',
  },
]

const releaseNotes = [
  'Partnerprofile mit freiwilligen Kontaktdaten',
  'Unternehmen mit Staff-Freigabe',
  'Kontaktverzeichnis im Desktop-Layout',
]

export default function DashboardPage() {
  const { profile, isDemo } = usePortalSession()
  const [stats, setStats] = useState<HubStats>(demoStats)
  const completion = getProfileCompletion(profile)
  const missingProfileItems = completion.missing.slice(0, 3)

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

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="portal-panel overflow-hidden p-0">
          <div className="border-b border-border/70 p-5">
            <p className="text-sm uppercase tracking-[0.22em] text-primary">Informationen</p>
            <h3 className="mt-1 text-2xl font-semibold">Partner Programm 2026</h3>
          </div>
          <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4 border-b border-border/70 p-5 md:border-b-0 md:border-r">
              <InfoRow icon={<Calendar className="size-4" />} label="Zeitraum" value="Kooperationen, Briefings und Releases laufend" />
              <InfoRow icon={<MapPin className="size-4" />} label="Ort" value="Realhosti Partner Portal" />
              <InfoRow icon={<Globe2 className="size-4" />} label="URL" value="partners.realhosti.de" />
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="size-4" />
                  <span className="text-xs uppercase tracking-[0.18em]">App-Logik</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Kontakte, Inbox, Live-Chat, Forum, Blog und Firmenfreigaben sitzen in einem Desktop-Cockpit.
                </p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm leading-6 text-muted-foreground">
                Inspiriert vom mobilen Event-Flow: scannen, merken, qualifizieren, anschreiben. Auf Desktop ist daraus eine Arbeitsoberflaeche geworden, in der Firmenkontakte und Creator-Profile direkt neben Nachrichten und Aufgaben liegen.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {releaseNotes.map((note) => (
                  <div key={note} className="rounded-lg border border-border/70 bg-secondary/30 p-3">
                    <CheckCircle2 className="mb-2 size-4 text-primary" />
                    <p className="text-sm leading-5">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="portal-panel p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-primary">Profil vervollstaendigen</p>
              <h3 className="mt-1 text-2xl font-semibold">{completion.percent}% bereit</h3>
            </div>
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground glow-orange">
              <Sparkles className="size-6" />
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${completion.percent}%` }} />
          </div>
          <div className="mt-5 space-y-3">
            {missingProfileItems.length ? (
              missingProfileItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-lg border border-border/70 bg-secondary/30 p-3">
                  <div className="flex size-8 items-center justify-center rounded-md bg-background text-primary">
                    <BriefcaseBusiness className="size-4" />
                  </div>
                  <p className="text-sm">{item.label} fehlt noch</p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-primary/35 bg-primary/10 p-3 text-sm">
                Dein Profil ist fuer Partnerkontakte stark genug gepflegt.
              </div>
            )}
          </div>
          <Button asChild className="mt-5 h-11 w-full rounded-lg">
            <Link href="/dashboard/settings">
              Profil bearbeiten
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </aside>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="portal-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-primary">Neue Kontakte</p>
              <h3 className="mt-1 text-2xl font-semibold">Lead-Liste</h3>
            </div>
            <Button asChild variant="outline" className="h-10 rounded-lg">
              <Link href="/dashboard/contacts">
                Alle Kontakte
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-5 divide-y divide-border/70">
            {spotlightContacts.map((contact) => (
              <Link key={contact.name} href="/dashboard/contacts" className="flex items-center gap-3 py-4 transition hover:text-primary">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 font-semibold text-primary">
                  {contact.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{contact.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{contact.role} · {contact.company}</p>
                </div>
                <time className="hidden text-xs text-muted-foreground sm:block">{contact.date}</time>
              </Link>
            ))}
          </div>
        </div>

        <div className="portal-panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-primary">Merkliste</p>
              <h3 className="mt-1 text-2xl font-semibold">Naechste Aktionen</h3>
            </div>
            <Bookmark className="size-5 text-primary" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ActionTile title="Kontakt pruefen" detail="Firma und Rolle bestaetigen" href="/dashboard/contacts" />
            <ActionTile title="Briefing senden" detail="Deliverables und Timing" href="/dashboard/messages/new" />
            <ActionTile title="Forum nutzen" detail="Assets und Fragen sammeln" href="/dashboard/forum" />
          </div>
        </div>
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

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm leading-5">{value}</p>
      </div>
    </div>
  )
}

function ActionTile({ title, detail, href }: { title: string; detail: string; href: string }) {
  return (
    <Link href={href} className="rounded-lg border border-border/70 bg-secondary/30 p-4 transition hover:border-primary/60">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{detail}</p>
      <ChevronRight className="mt-4 size-4 text-primary" />
    </Link>
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
