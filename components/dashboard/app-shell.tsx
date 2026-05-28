'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ContactRound,
  Home,
  LogOut,
  MessageSquare,
  MessagesSquare,
  Newspaper,
  PanelLeft,
  Settings,
  Shield,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { PortalSessionProvider, usePortalSession } from '@/hooks/use-auth-profile'
import { getProfileCompletion } from '@/lib/profile-completion'

const navItems = [
  { href: '/dashboard', label: 'Hub', icon: Home },
  { href: '/dashboard/contacts', label: 'Kontakte', icon: ContactRound },
  { href: '/dashboard/messages', label: 'Inbox', icon: MessageSquare },
  { href: '/dashboard/chat', label: 'Chat', icon: MessagesSquare },
  { href: '/dashboard/forum', label: 'Forum', icon: Users },
  { href: '/dashboard/blog', label: 'Blog', icon: Newspaper },
  { href: '/dashboard/appointments', label: 'Termine', icon: Calendar },
  { href: '/dashboard/settings', label: 'Profil', icon: Settings },
]

export function DashboardAppShell({ children }: { children: React.ReactNode }) {
  return (
    <PortalSessionProvider requireAuth>
      <DashboardChrome>{children}</DashboardChrome>
    </PortalSessionProvider>
  )
}

function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, status, isDemo, isConfigured } = usePortalSession()
  const completion = getProfileCompletion(profile)

  const handleLogout = async () => {
    if (isConfigured) {
      const supabase = createClient()
      await supabase.auth.signOut()
    }

    router.push('/')
  }

  if (status === 'loading' || status === 'guest') {
    return (
      <div className="min-h-svh bg-background text-foreground app-backdrop flex items-center justify-center px-6">
        <div className="portal-panel max-w-sm p-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground glow-orange">
            <Zap className="size-7" />
          </div>
          <p className="font-display text-3xl tracking-wide text-primary">Realhosti</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {status === 'guest' ? 'Session wird geprueft.' : 'Partner Portal wird geladen.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background text-foreground app-backdrop">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border/80 bg-sidebar/92 backdrop-blur-xl lg:flex">
        <div className="border-b border-border/80 p-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground glow-orange">
              <Zap className="size-7" />
            </div>
            <div className="leading-none">
              <p className="font-display text-3xl tracking-wide">
                <span className="text-primary">Real</span>
                <span className="text-foreground">hosti</span>
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Partner Ops
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition',
                  active
                    ? 'bg-primary text-primary-foreground shadow-[0_0_24px_oklch(0.72_0.2_45_/_0.24)]'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <item.icon className="size-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="space-y-3 border-t border-border/80 p-4">
          <Link href="/dashboard/settings" className="portal-panel block p-3 transition hover:border-primary/60">
            <div className="flex items-center gap-3">
              <Avatar />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{profile?.twitch_display_name ?? 'Partner'}</p>
                <p className="truncate text-xs text-muted-foreground">@{profile?.twitch_username ?? 'twitch'}</p>
              </div>
              {profile?.is_admin ? (
                <Badge className="bg-primary text-primary-foreground">
                  <Shield className="size-3" />
                  Admin
                </Badge>
              ) : null}
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">Profilstaerke</span>
                <span className="font-semibold text-primary">{completion.percent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${completion.percent}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  {completion.missing.length ? `${completion.missing.length} offen` : 'vollstaendig'}
                </span>
                <ChevronRight className="size-4" />
              </div>
            </div>
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border/80 bg-background/88 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <PanelLeft className="hidden size-5 text-primary sm:block lg:hidden" />
              <div className="min-w-0">
                <p className="truncate text-sm text-muted-foreground">Willkommen zurueck</p>
                <h1 className="truncate text-lg font-semibold text-foreground">
                  {profile?.twitch_display_name ?? 'Partner'}
                </h1>
              </div>
              {isDemo ? (
                <Badge variant="outline" className="hidden border-primary/60 text-primary sm:inline-flex">
                  Demo
                </Badge>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative rounded-lg" aria-label="Benachrichtigungen">
                <Bell className="size-5" />
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-lg" onClick={handleLogout} aria-label="Abmelden">
                <LogOut className="size-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/94 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {navItems.slice(0, 5).map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition',
                  active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <item.icon className="size-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function Avatar() {
  const { profile } = usePortalSession()

  if (profile?.twitch_avatar_url) {
    return (
      <img
        src={profile.twitch_avatar_url}
        alt={profile.twitch_display_name ?? 'Partner Avatar'}
        className="size-11 rounded-lg border border-primary/50 object-cover"
      />
    )
  }

  return (
    <div className="flex size-11 items-center justify-center rounded-lg border border-primary/50 bg-secondary font-display text-2xl text-primary">
      {(profile?.twitch_display_name ?? 'P').charAt(0)}
    </div>
  )
}
