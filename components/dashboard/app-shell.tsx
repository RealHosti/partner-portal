'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ComponentType, ReactNode } from 'react'
import {
  Bell,
  Bookmark,
  Bot,
  CircleEllipsis,
  Home,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Rocket,
  Search,
  UserPlus,
  UserRound,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { PortalSessionProvider, usePortalSession } from '@/hooks/use-auth-profile'
import { XAvatar } from '@/components/dashboard/x-ui'

type NavItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  route?: string
  badge?: string
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home, route: '/dashboard' },
  { href: '/dashboard/forum', label: 'Explore', icon: Search, route: '/dashboard/forum' },
  { href: '/dashboard/appointments', label: 'Notifications', icon: Bell, route: '/dashboard/appointments' },
  { href: '/dashboard/contacts', label: 'Follow', icon: UserPlus, route: '/dashboard/contacts' },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageCircle, route: '/dashboard/chat' },
  { href: '/dashboard/blog', label: 'Grok', icon: Bot },
  { href: '/dashboard/blog', label: 'Bookmarks', icon: Bookmark, route: '/dashboard/blog' },
  { href: '/dashboard/messages', label: 'Creator Studio', icon: Rocket, route: '/dashboard/messages' },
  { href: '/dashboard/settings', label: 'Premium', icon: Zap, badge: '50% off' },
  { href: '/dashboard/settings', label: 'Profile', icon: UserRound, route: '/dashboard/settings' },
  { href: '/dashboard/settings', label: 'More', icon: CircleEllipsis },
]

export function DashboardAppShell({ children }: { children: ReactNode }) {
  return (
    <PortalSessionProvider requireAuth>
      <DashboardChrome>{children}</DashboardChrome>
    </PortalSessionProvider>
  )
}

function DashboardChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, status, isConfigured } = usePortalSession()

  const handleLogout = async () => {
    if (isConfigured) {
      const supabase = createClient()
      await supabase.auth.signOut()
    }

    router.push('/')
  }

  if (status === 'loading' || status === 'guest') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-black px-6 text-[#e7e9ea]">
        <div className="text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-[#eff3f4] text-black">
            <span className="text-3xl font-semibold">X</span>
          </div>
          <p className="text-xl font-extrabold">Realhosti Partner Portal</p>
          <p className="mt-2 text-sm text-[#71767b]">
            {status === 'guest' ? 'Session wird geprueft.' : 'Partner Portal wird geladen.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-black text-[#e7e9ea]">
      <div className="mx-auto grid min-h-svh max-w-[1280px] grid-cols-1 lg:grid-cols-[275px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-svh flex-col border-r border-[#2f3336] bg-black px-3 lg:flex">
          <div className="flex h-[53px] items-center px-2">
            <Link href="/dashboard" className="flex size-12 items-center justify-center rounded-full text-[#e7e9ea] transition hover:bg-[#181818]">
              <span className="text-3xl leading-none">X</span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 pt-2">
            {navItems.map((item) => {
              const active = item.route
                ? item.route === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.route)
                : false

              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  className={cn(
                    'group inline-flex max-w-full items-center gap-5 rounded-full px-3 py-3 text-xl leading-6 transition hover:bg-[#181818]',
                    active ? 'font-extrabold text-[#e7e9ea]' : 'font-normal text-[#e7e9ea]',
                  )}
                >
                  <span className="relative">
                    <item.icon className={cn('size-[26px]', active ? 'stroke-[2.6]' : 'stroke-2')} />
                    {item.label === 'Notifications' ? (
                      <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#1d9bf0]" />
                    ) : null}
                    {item.label === 'Grok' ? (
                      <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[#1d9bf0]" />
                    ) : null}
                  </span>
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-md bg-[#1d9bf0] px-1.5 py-0.5 text-xs font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              )
            })}

            <Button asChild className="mt-4 h-[52px] w-[233px] rounded-full bg-[#eff3f4] text-[17px] font-bold text-black hover:bg-[#d7dbdc]">
              <Link href="/dashboard/messages/new">Post</Link>
            </Button>
          </nav>

          <div className="pb-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-full p-3 text-left transition hover:bg-[#181818]"
            >
              <XAvatar
                src={profile?.twitch_avatar_url}
                name={profile?.twitch_display_name ?? 'Partner'}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-[#e7e9ea]">
                  {profile?.twitch_display_name ?? 'Partner'}
                </p>
                <p className="truncate text-[15px] text-[#71767b]">@{profile?.twitch_username ?? 'hostiliuus'}</p>
              </div>
              <MoreHorizontal className="size-5 text-[#e7e9ea]" />
            </button>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#2f3336] bg-black/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {navItems.slice(0, 5).map((item) => {
            const active = item.route
              ? item.route === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.route)
              : false
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex h-14 flex-col items-center justify-center gap-1 rounded-full text-[11px] transition hover:bg-[#181818]',
                  active ? 'font-bold text-[#e7e9ea]' : 'text-[#71767b]',
                )}
              >
                <item.icon className="size-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="fixed bottom-5 right-5 z-30 hidden flex-col gap-3 xl:flex">
        <Button size="icon" className="size-14 rounded-2xl border border-[#2f3336] bg-black shadow-[0_0_22px_rgb(255_255_255_/_0.28)] hover:bg-[#181818]" aria-label="Grok">
          <Bot className="size-7" />
        </Button>
        <Button size="icon" className="size-14 rounded-2xl border border-[#2f3336] bg-black shadow-[0_0_22px_rgb(255_255_255_/_0.28)] hover:bg-[#181818]" aria-label="Chat">
          <MessageCircle className="size-7" />
        </Button>
      </div>

      <Button asChild className="fixed bottom-20 right-5 z-40 size-14 rounded-full bg-[#1d9bf0] text-white shadow-lg hover:bg-[#1a8cd8] lg:hidden" aria-label="Post">
        <Link href="/dashboard/messages/new">
          <PenLine className="size-6" />
        </Link>
      </Button>
    </div>
  )
}
