'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  ContactRound,
  Compass,
  Home,
  LogOut,
  MessageSquare,
  MessagesSquare,
  Newspaper,
  PanelLeft,
  PenLine,
  Settings,
  Shield,
  Zap,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { PortalSessionProvider, usePortalSession } from '@/hooks/use-auth-profile'
import { getProfileCompletion } from '@/lib/profile-completion'

const navItems = [
  { href: '/dashboard', label: 'Startseite', icon: Home },
  { href: '/dashboard/forum', label: 'Entdecken', icon: Compass },
  { href: '/dashboard/appointments', label: 'Benachrichtigungen', icon: Bell },
  { href: '/dashboard/contacts', label: 'Kontakte', icon: ContactRound },
  { href: '/dashboard/messages', label: 'Nachrichten', icon: MessageSquare },
  { href: '/dashboard/chat', label: 'Chat', icon: MessagesSquare },
  { href: '/dashboard/blog', label: 'Releases', icon: Newspaper },
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
    <div className="min-h-svh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-background lg:flex xl:w-72">
        <div className="px-5 pb-3 pt-4">
          <Link href="/dashboard" className="flex size-12 items-center justify-center rounded-full text-primary transition hover:bg-secondary/60">
            <Zap className="size-7" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group inline-flex max-w-full items-center gap-4 rounded-full px-4 py-3 text-xl transition',
                  active
                    ? 'font-bold text-foreground'
                    : 'font-medium text-foreground/82 hover:bg-secondary/65 hover:text-foreground',
                )}
              >
                <span className="relative">
                  <item.icon className="size-6" />
                  {item.label === 'Benachrichtigungen' ? (
                    <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      1
                    </span>
                  ) : null}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}

          <Button asChild className="mt-4 h-12 w-full rounded-full text-base font-bold xl:w-[88%]">
            <Link href="/dashboard/messages/new">
              <PenLine className="size-5" />
              Posten
            </Link>
          </Button>
        </nav>

        <div className="p-3">
          <Link href="/dashboard/settings" className="block rounded-full p-3 transition hover:bg-secondary/65">
            <div className="flex items-center gap-3">
              <Avatar />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{profile?.twitch_display_name ?? 'Partner'}</p>
                <p className="truncate text-xs text-muted-foreground">@{profile?.twitch_username ?? 'twitch'}</p>
              </div>
              {profile?.is_admin ? (
                <Badge className="hidden bg-primary text-primary-foreground xl:inline-flex">
                  <Shield className="size-3" />
                  Admin
                </Badge>
              ) : null}
              <MoreHorizontal className="size-5 text-muted-foreground" />
            </div>
            <div className="ml-14 mt-2 h-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${completion.percent}%` }} />
            </div>
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64 xl:pl-72">
        <header className="sticky top-0 z-20 border-b border-border/80 bg-background/88 backdrop-blur-xl lg:hidden">
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

        <main className="mx-auto w-full max-w-7xl px-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-4 lg:px-0 lg:pb-0">
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
        className="size-11 rounded-full border border-primary/50 object-cover"
      />
    )
  }

  return (
    <div className="flex size-11 items-center justify-center rounded-full border border-primary/50 bg-secondary font-display text-2xl text-primary">
      {(profile?.twitch_display_name ?? 'P').charAt(0)}
    </div>
  )
}
