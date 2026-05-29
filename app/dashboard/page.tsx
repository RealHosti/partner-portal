'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Bookmark,
  Calendar,
  ChevronRight,
  FileText,
  ImageIcon,
  Link2,
  MessageSquare,
  MessagesSquare,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Settings2,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getProfileCompletion } from '@/lib/profile-completion'
import { usePortalSession } from '@/hooks/use-auth-profile'

type HubStats = {
  unreadMessages: number
  pendingAppointments: number
  forumTopics: number
  publishedPosts: number
}

type TimelinePost = {
  id: string
  author: string
  handle: string
  initials: string
  time: string
  badge?: string
  title?: string
  body: string
  href?: string
  actionLabel?: string
  image?: string
  metrics: {
    replies: number
    shares: number
    saves: number
  }
}

const demoStats: HubStats = {
  unreadMessages: 3,
  pendingAppointments: 1,
  forumTopics: 7,
  publishedPosts: 4,
}

const partnerContacts = [
  {
    initials: 'ZH',
    name: 'Zoe Huang',
    handle: '@zoe_huang',
    role: 'Sales Representative',
    company: 'HOLLYLAND',
  },
  {
    initials: 'EF',
    name: 'Elyas Fehri',
    handle: '@elyas_creator',
    role: 'Social Content Creator',
    company: 'Nitrodo',
  },
  {
    initials: 'MS',
    name: 'Manmohen Singh',
    handle: '@manmohen_singh',
    role: 'Key Account Manager',
    company: 'Gcore',
  },
]

const trends = [
  { label: 'Streaming Hardware', meta: '12 offene Kontakte' },
  { label: 'Q3 Kampagnen', meta: '4 Briefings aktiv' },
  { label: 'Creator Placements', meta: '7 Forum-Beitraege' },
]

export default function DashboardPage() {
  const { profile, isDemo } = usePortalSession()
  const [stats, setStats] = useState<HubStats>(demoStats)
  const completion = getProfileCompletion(profile)

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

  const posts = useMemo<TimelinePost[]>(
    () => [
      {
        id: 'portal-status',
        author: 'Realhosti Partner Ops',
        handle: '@realhosti',
        initials: 'RH',
        time: 'jetzt',
        badge: isDemo ? 'Demo Daten' : 'Live',
        title: 'Aktueller Stand im Partner Portal',
        body: `Du hast ${stats.unreadMessages} ungelesene Nachrichten, ${stats.pendingAppointments} offene Termine, ${stats.forumTopics} Forum-Themen und ${stats.publishedPosts} veroeffentlichte Updates. Alles, was gerade wichtig ist, laeuft direkt ueber diesen Feed.`,
        href: '/dashboard/messages',
        actionLabel: 'Inbox ansehen',
        metrics: { replies: stats.unreadMessages, shares: stats.forumTopics, saves: stats.publishedPosts },
      },
      {
        id: 'profile',
        author: profile?.twitch_display_name ?? 'Partner Profil',
        handle: `@${profile?.twitch_username ?? 'partner'}`,
        initials: getInitials(profile?.twitch_display_name ?? 'Partner'),
        time: 'heute',
        badge: `${completion.percent}% Profil`,
        title: 'Profilstaerke entscheidet ueber bessere Kontakte',
        body: completion.missing.length
          ? `Noch offen: ${completion.missing.slice(0, 3).map((item) => item.label).join(', ')}. Danach sehen Unternehmen schneller, wer du bist, was du machst und wie sie dich erreichen.`
          : 'Dein Profil ist stark gepflegt. Unternehmen sehen Firma, Rolle, Kontaktwege und Social Links auf einen Blick.',
        href: '/dashboard/settings',
        actionLabel: 'Profil bearbeiten',
        metrics: { replies: completion.missing.length, shares: completion.percent, saves: 1 },
      },
      {
        id: 'contacts',
        author: 'Kontakt Radar',
        handle: '@partners',
        initials: 'KR',
        time: 'vor 20 Min.',
        badge: 'Lead-Liste',
        title: 'Neue Partnerkontakte zum Qualifizieren',
        body: 'Zoe Huang, Elyas Fehri und Manmohen Singh sind als Beispielkontakte im Directory sichtbar. Dort pruefst du Firma, Rolle, Kontaktwege, Social Links und Kontext.',
        href: '/dashboard/contacts',
        actionLabel: 'Kontakte oeffnen',
        metrics: { replies: 3, shares: 5, saves: 2 },
      },
      {
        id: 'company',
        author: 'Company Approval',
        handle: '@staff',
        initials: 'CA',
        time: 'heute',
        badge: 'Staff Flow',
        title: 'Unternehmen muessen freigegeben werden',
        body: 'Wenn ein Nutzer ein Unternehmen registriert, landet es in der Freigabe. Staff, Moderator oder Admin bestaetigen die Zuordnung, bevor sie als offizieller Firmenkontakt erscheint.',
        href: '/dashboard/settings',
        actionLabel: 'Freigaben pruefen',
        metrics: { replies: 1, shares: 2, saves: 4 },
      },
    ],
    [completion.missing, completion.percent, isDemo, profile, stats],
  )

  return (
    <div className="grid min-h-svh gap-0 xl:grid-cols-[minmax(0,680px)_360px] 2xl:grid-cols-[minmax(0,720px)_380px]">
      <section className="min-w-0 border-x border-border/80 bg-background/72">
        <div className="sticky top-16 z-10 border-b border-border/80 bg-background/92 backdrop-blur-xl lg:top-0">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <h2 className="text-xl font-semibold">Startseite</h2>
              <p className="text-xs text-muted-foreground">Was gerade im Partnerprogramm passiert</p>
            </div>
            <Button asChild variant="ghost" size="icon" className="rounded-full" aria-label="Feed Einstellungen">
              <Link href="/dashboard/settings">
                <Settings2 className="size-5" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 border-t border-border/60 text-sm font-semibold">
            <button type="button" className="relative h-12 text-foreground">
              Fuer dich
              <span className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-primary" />
            </button>
            <button type="button" className="h-12 text-muted-foreground transition hover:bg-secondary/45 hover:text-foreground">
              Firmen
            </button>
          </div>
        </div>

        <Composer
          avatarUrl={profile?.twitch_avatar_url}
          name={profile?.twitch_display_name ?? 'Partner'}
        />

        <div className="divide-y divide-border/80">
          {posts.map((post) => (
            <TimelinePostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <aside className="hidden min-w-0 border-r border-border/80 bg-background/60 px-5 py-4 xl:block">
        <div className="sticky top-20 space-y-4 lg:top-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Portal durchsuchen"
              className="h-11 rounded-full border-border/80 bg-secondary/35 pl-10"
            />
          </div>

          <RightPanel title="Jetzt wichtig">
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Profil</span>
                  <span className="font-semibold text-primary">{completion.percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${completion.percent}%` }} />
                </div>
              </div>
              <div className="grid gap-2">
                <QuickState href="/dashboard/messages" icon={<MessageSquare className="size-4" />} label="Ungelesen" value={stats.unreadMessages} />
                <QuickState href="/dashboard/appointments" icon={<Calendar className="size-4" />} label="Termine" value={stats.pendingAppointments} />
                <QuickState href="/dashboard/forum" icon={<Users className="size-4" />} label="Forum" value={stats.forumTopics} />
              </div>
            </div>
          </RightPanel>

          <RightPanel title="Was passiert">
            <div className="divide-y divide-border/70">
              {trends.map((trend) => (
                <Link key={trend.label} href="/dashboard/forum" className="block rounded-2xl px-1 py-3 transition hover:bg-secondary/35 hover:text-primary">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Trending im Partnerportal</p>
                      <p className="mt-1 font-semibold">{trend.label}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{trend.meta}</p>
                    </div>
                    <MoreHorizontal className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </RightPanel>

          <RightPanel title="Wen anschauen">
            <div className="space-y-3">
              {partnerContacts.map((contact) => (
                <Link key={contact.name} href="/dashboard/contacts" className="flex items-center gap-3 rounded-full p-2 transition hover:bg-secondary/45">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/45 bg-primary/15 font-semibold text-primary">
                    {contact.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{contact.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{contact.role} - {contact.company}</p>
                  </div>
                  <Button size="sm" className="h-8 rounded-full px-3">
                    Oeffnen
                  </Button>
                </Link>
              ))}
            </div>
          </RightPanel>
        </div>
      </aside>
    </div>
  )
}

function Composer({ avatarUrl, name }: { avatarUrl?: string | null; name: string }) {
  return (
    <section className="border-b border-border/80 p-4">
      <div className="flex gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="size-11 rounded-full border border-primary/45 object-cover" />
        ) : (
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/45 bg-primary/15 font-semibold text-primary">
            {getInitials(name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <textarea
            placeholder="Was gibt's Neues in deiner Kooperation?"
            rows={3}
            className="w-full resize-none border-0 bg-transparent p-0 text-lg outline-none placeholder:text-muted-foreground"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-3">
            <div className="flex items-center gap-1 text-primary">
              <ComposerIcon icon={<ImageIcon className="size-4" />} label="Bild" />
              <ComposerIcon icon={<Link2 className="size-4" />} label="Link" />
              <ComposerIcon icon={<Calendar className="size-4" />} label="Termin" />
              <ComposerIcon icon={<FileText className="size-4" />} label="Briefing" />
            </div>
            <Button asChild className="h-9 rounded-full px-5">
              <Link href="/dashboard/messages/new">
                Posten
                <Send className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function ComposerIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Button variant="ghost" size="icon" className="size-9 rounded-full text-primary" aria-label={label}>
      {icon}
    </Button>
  )
}

function TimelinePostCard({ post }: { post: TimelinePost }) {
  return (
    <article className="p-4 transition hover:bg-secondary/20">
      <div className="flex gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/45 bg-primary/15 font-semibold text-primary">
          {post.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-semibold">{post.author}</p>
                <p className="text-sm text-muted-foreground">{post.handle}</p>
                <span className="text-sm text-muted-foreground">-</span>
                <time className="text-sm text-muted-foreground">{post.time}</time>
              </div>
              {post.badge ? (
                <Badge variant="outline" className="mt-2 rounded-full border-primary/45 px-3 text-primary">
                  {post.badge}
                </Badge>
              ) : null}
            </div>
            <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground" aria-label="Mehr">
              <MoreHorizontal className="size-4" />
            </Button>
          </div>

          {post.title ? <h3 className="mt-3 text-xl font-semibold">{post.title}</h3> : null}
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.body}</p>

          {post.href ? (
            <Link href={post.href} className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-border/75 px-4 text-sm font-semibold transition hover:border-primary/60 hover:bg-secondary/35">
              <span>{post.actionLabel ?? 'Oeffnen'}</span>
              <ChevronRight className="size-4 text-primary" />
            </Link>
          ) : null}

          <div className="mt-4 grid max-w-md grid-cols-4 text-muted-foreground">
            <PostMetric icon={<MessageSquare className="size-4" />} value={post.metrics.replies} label="Antworten" />
            <PostMetric icon={<MessagesSquare className="size-4" />} value={post.metrics.shares} label="Diskussion" />
            <PostMetric icon={<Bookmark className="size-4" />} value={post.metrics.saves} label="Gespeichert" />
            <PostMetric icon={<Plus className="size-4" />} value="" label="Aktion" />
          </div>
        </div>
      </div>
    </article>
  )
}

function PostMetric({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <button type="button" className="flex items-center gap-2 rounded-full px-2 py-1 text-xs transition hover:bg-secondary/35 hover:text-primary" aria-label={label}>
      {icon}
      <span>{value}</span>
    </button>
  )
}

function RightPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border/80 bg-secondary/20 p-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function QuickState({
  href,
  icon,
  label,
  value,
}: {
  href: string
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-full bg-background/45 px-3 py-2.5 transition hover:bg-secondary/55">
      <span className="text-primary">{icon}</span>
      <span className="min-w-0 flex-1 text-sm">{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </Link>
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.charAt(0) ?? 'P'
  const second = parts[1]?.charAt(0) ?? ''
  return `${first}${second}`.toUpperCase()
}
