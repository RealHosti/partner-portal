'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ComponentType, ReactNode } from 'react'
import {
  Bell,
  Bookmark,
  Hash,
  Home,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Plus,
  Radio,
  Search,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { PortalSessionProvider, usePortalSession } from '@/hooks/use-auth-profile'
import { XAvatar } from '@/components/dashboard/x-ui'
import { PortalSearch } from '@/components/dashboard/portal-search'

type NavItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  route?: string
  badge?: string
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home, route: '/dashboard' },
  { href: '/dashboard/chat', label: 'Groups & Chats', icon: UsersRound, route: '/dashboard/chat' },
  { href: '/dashboard/messages', label: 'Streams', icon: Radio, route: '/dashboard/messages' },
  { href: '/dashboard/blog', label: 'Bookmarks', icon: Bookmark, route: '/dashboard/blog' },
]

const groupItems = [
  { name: 'Partner Lounge', meta: '12 members', unread: '3', icon: Hash },
  { name: 'Creator Briefings', meta: 'Campaign updates', unread: '1', icon: Hash },
  { name: 'Hardware Deals', meta: 'Specs and shipping', unread: null, icon: Hash },
]

const friendItems = [
  { name: 'Zoe Huang', handle: '@hollyland_zoe', status: 'Online' },
  { name: 'Elyas Fehri', handle: '@elyascontent', status: 'Drafting brief' },
  { name: 'Manmohen Singh', handle: '@gcore_partner', status: 'Offline' },
  { name: 'Realhosti Staff', handle: '@realhosti_staff', status: 'Online' },
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
  const showGroupsSidebar = pathname.startsWith('/dashboard/chat')

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
      <TopNavbar />
      <div
        className={cn(
          'grid min-h-svh w-full grid-cols-1 pt-16 lg:mx-0',
          showGroupsSidebar
            ? 'lg:grid-cols-[255px_340px_minmax(0,1fr)] 2xl:max-w-[1540px]'
            : 'lg:grid-cols-[255px_minmax(0,1fr)] 2xl:max-w-[1500px]',
        )}
      >
        <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] flex-col border-r border-[#2f3336] bg-black px-3 lg:flex">
          <nav className="flex-1 space-y-1 pt-4">
            {navItems.map((item) => {
              const active = item.route
                ? item.route === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.route)
                : false

              return (
                <div key={`${item.label}-${item.href}`}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group inline-flex max-w-full items-center gap-5 rounded-full px-3 py-3 text-xl leading-6 transition hover:bg-[#181818]',
                      active ? 'font-extrabold text-[#e7e9ea]' : 'font-normal text-[#e7e9ea]',
                    )}
                  >
                    <span className="relative">
                      <item.icon className={cn('size-[26px]', active ? 'stroke-[2.6]' : 'stroke-2')} />
                    </span>
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="rounded-md bg-[#1d9bf0] px-1.5 py-0.5 text-xs font-bold text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                  {item.label === 'Home' ? <PortalSearch /> : null}
                </div>
              )
            })}

            <Button asChild className="mt-4 h-[52px] w-[233px] rounded-full bg-[#eff3f4] text-[17px] font-bold text-black hover:bg-[#d7dbdc]">
              <Link href="/dashboard/messages/new">Post</Link>
            </Button>
          </nav>

          <div className="pb-3">
            <div className="flex w-full items-center rounded-full p-2 transition hover:bg-[#181818]">
              <Link href="/dashboard/settings" className="flex min-w-0 flex-1 items-center gap-3 rounded-full p-1">
                <XAvatar
                  src={profile?.twitch_avatar_url}
                  name={profile?.twitch_display_name ?? 'Partner'}
                  size="sm"
                />
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-[15px] font-bold text-[#e7e9ea]">
                    {profile?.twitch_display_name ?? 'Partner'}
                  </p>
                  <p className="truncate text-[15px] text-[#71767b]">@{profile?.twitch_username ?? 'hostiliuus'}</p>
                </div>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#e7e9ea] transition hover:bg-[#2f3336]"
                    aria-label="Account Optionen"
                  >
                    <MoreHorizontal className="size-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="top"
                  sideOffset={10}
                  className="w-72 rounded-2xl border-[#2f3336] bg-black p-2 text-[#e7e9ea] shadow-[0_0_18px_rgb(255_255_255_/_0.16)]"
                >
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#71767b]">
                    Accounts
                  </DropdownMenuLabel>
                  <DropdownMenuItem className="rounded-xl px-3 py-3 text-[15px] focus:bg-[#181818] focus:text-[#e7e9ea]">
                    <XAvatar
                      src={profile?.twitch_avatar_url}
                      name={profile?.twitch_display_name ?? 'Partner'}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-bold">{profile?.twitch_display_name ?? 'Partner'}</p>
                      <p className="truncate text-[#71767b]">@{profile?.twitch_username ?? 'hostiliuus'}</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl px-3 py-3 text-[15px] focus:bg-[#181818] focus:text-[#e7e9ea]">
                    <div className="flex size-10 items-center justify-center rounded-full border border-[#2f3336] bg-[#16181c] font-bold">
                      RH
                    </div>
                    <div>
                      <p className="font-bold">Realhosti Staff</p>
                      <p className="text-[#71767b]">@realhosti_staff</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#2f3336]" />
                  <DropdownMenuItem className="rounded-xl px-3 py-3 text-[15px] focus:bg-[#181818] focus:text-[#e7e9ea]">
                    Add an existing account
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl px-3 py-3 text-[15px] focus:bg-[#181818] focus:text-[#e7e9ea]">
                    Create a new account
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#2f3336]" />
                  <DropdownMenuItem
                    onSelect={() => {
                      void handleLogout()
                    }}
                    className="rounded-xl px-3 py-3 text-[15px] text-[#f4212e] focus:bg-[#181818] focus:text-[#f4212e]"
                  >
                    Log out @{profile?.twitch_username ?? 'hostiliuus'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>

        {showGroupsSidebar ? <GroupsChatSidebar /> : null}

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

      <Button asChild className="fixed bottom-20 right-5 z-40 size-14 rounded-full bg-[#1d9bf0] text-white shadow-lg hover:bg-[#1a8cd8] lg:hidden" aria-label="Post">
        <Link href="/dashboard/messages/new">
          <PenLine className="size-6" />
        </Link>
      </Button>
    </div>
  )
}

function GroupsChatSidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] border-r border-[#2f3336] bg-black lg:block">
      <div className="flex h-full flex-col">
        <header className="border-b border-[#2f3336] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-[#e7e9ea]">Groups & Chats</h2>
              <p className="mt-1 text-sm text-[#71767b]">Groups, friends and DMs</p>
            </div>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full border border-[#2f3336] text-[#e7e9ea] transition hover:bg-[#181818]"
              aria-label="New group"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#71767b]" />
            <input
              type="search"
              placeholder="Search chats"
              className="h-11 w-full rounded-full border border-[#2f3336] bg-[#050505] pl-11 pr-4 text-[15px] text-[#e7e9ea] outline-none placeholder:text-[#71767b] focus:border-[#1d9bf0]"
            />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto py-3">
          <SidebarSection title="Groups">
            {groupItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href="/dashboard/chat"
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-[#080808]"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#2f3336] bg-[#16181c] text-[#1d9bf0]">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-[#e7e9ea]">{item.name}</p>
                    <p className="truncate text-sm text-[#71767b]">{item.meta}</p>
                  </div>
                  {item.unread ? (
                    <span className="rounded-full bg-[#1d9bf0] px-2 py-0.5 text-xs font-bold text-white">
                      {item.unread}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </SidebarSection>

          <SidebarSection title="Friends">
            {friendItems.map((item) => (
              <Link
                key={item.handle}
                href="/dashboard/chat"
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-[#080808]"
              >
                <div className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-[#2f3336] bg-[#16181c] font-bold text-[#e7e9ea]">
                  <UserRound className="size-5" />
                  {item.status === 'Online' ? (
                    <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-black bg-emerald-400" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-[#e7e9ea]">{item.name}</p>
                  <p className="truncate text-sm text-[#71767b]">{item.handle}</p>
                </div>
              </Link>
            ))}
          </SidebarSection>
        </div>

        <div className="border-t border-[#2f3336] p-4">
          <Button asChild className="h-11 w-full rounded-full bg-[#eff3f4] text-[15px] font-bold text-black hover:bg-[#d7dbdc]">
            <Link href="/dashboard/messages/new">
              <MessageCircle className="size-4" />
              New chat
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  )
}

function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pb-3">
      <h3 className="px-4 pb-2 pt-3 text-xs font-bold uppercase tracking-[0.18em] text-[#71767b]">{title}</h3>
      {children}
    </section>
  )
}

function TopNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[#2f3336] bg-black/92 backdrop-blur-xl">
      <div className="relative flex h-full items-center justify-center px-4">
        <Link href="/dashboard" className="flex items-center justify-center" aria-label="Realhosti Startseite">
          <img
            src="/images/realhosti-mark.svg"
            alt="Realhosti Logo"
            className="size-11 object-contain"
          />
        </Link>
        <Link
          href="/dashboard/appointments"
          className="absolute right-4 flex size-10 items-center justify-center rounded-full text-[#e7e9ea] transition hover:bg-[#181818]"
          aria-label="Benachrichtigungen"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-[#1d9bf0]" />
        </Link>
      </div>
    </header>
  )
}
