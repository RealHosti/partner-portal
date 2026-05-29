'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { MoreHorizontal, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export type XPerson = {
  name: string
  handle: string
  initials: string
  description?: string
  verified?: boolean
}

export const xNews = [
  {
    title: "Blue Origin's New Glenn Rocket Explodes in Cape Canaveral Static Fire Test",
    meta: 'Trending now · News · 17.8K posts',
  },
  {
    title: "Jalen Williams Returns for Thunder's Game 6 Closeout Push",
    meta: '1 hour ago · Sports · 18.9K posts',
  },
  {
    title: 'Australian Labor Unveils Tax Cuts for Workers and Investor Limits',
    meta: '20 hours ago · News · 19.2K posts',
  },
]

export const xTrends = [
  { title: 'Wahlrecht', meta: 'Trending in Germany' },
  { title: 'Eigenanteil', meta: 'Trending in Germany' },
  { title: 'schoenen donnerstag', meta: 'Trending in Germany' },
]

export const xPeople: XPerson[] = [
  {
    name: 'hyrez',
    handle: '@hyrezkbm',
    initials: 'HY',
    verified: true,
    description: 'Partner Manager',
  },
  {
    name: 'dreiachtfuenf',
    handle: '@dreiachtfuenf',
    initials: 'D8',
    description: 'Creative Lead',
  },
  {
    name: 'Jonas',
    handle: '@Coriozz',
    initials: 'JO',
    description: 'Brand Contact',
  },
]

export function XAvatar({
  src,
  name,
  initials,
  size = 'md',
}: {
  src?: string | null
  name: string
  initials?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const classes = {
    sm: 'size-10 text-sm',
    md: 'size-11 text-sm',
    lg: 'size-12 text-base',
    xl: 'size-32 text-4xl',
  }[size]

  if (src) {
    return <img src={src} alt={name} className={`${classes} shrink-0 rounded-full object-cover`} />
  }

  return (
    <div className={`${classes} flex shrink-0 items-center justify-center rounded-full border border-[#2f3336] bg-[#16181c] font-bold text-[#e7e9ea]`}>
      {initials ?? getInitials(name)}
    </div>
  )
}

export function XSearchBox({ placeholder = 'Search' }: { placeholder?: string }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#71767b]" />
      <Input
        placeholder={placeholder}
        className="h-11 rounded-full border-[#2f3336] bg-black pl-11 text-[15px] text-[#e7e9ea] placeholder:text-[#71767b] focus-visible:ring-[#1d9bf0]"
      />
    </div>
  )
}

export function XPanel({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#2f3336] bg-black">
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <h3 className="text-xl font-extrabold tracking-[-0.01em] text-[#e7e9ea]">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

export function XRightRail({ mode = 'home' }: { mode?: 'home' | 'simple' | 'profile' }) {
  return (
    <aside className="hidden w-[350px] shrink-0 pl-[30px] xl:block">
      <div className="sticky top-0 space-y-4 py-3">
        <XSearchBox />
        {mode === 'home' ? <PremiumPanel /> : null}
        <NewsPanel />
        {mode !== 'home' ? <WhoToFollowPanel title={mode === 'profile' ? 'You might like' : 'Who to follow'} /> : null}
        <TrendsPanel title={mode === 'home' ? "What's happening" : "What's happening"} />
        {mode === 'home' ? <WhoToFollowPanel title="Who to follow" /> : null}
        <XFooter />
      </div>
    </aside>
  )
}

export function PremiumPanel() {
  return (
    <XPanel
      title="Subscribe to Premium"
      action={<span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-400">50% off</span>}
    >
      <div className="px-4 pb-4 pt-2">
        <p className="text-sm font-semibold leading-5 text-[#e7e9ea]">
          Get rid of ads, see your analytics, boost your replies and unlock 20+ features.
        </p>
        <Button className="mt-4 h-9 rounded-full bg-[#1d9bf0] px-5 text-sm font-bold text-white hover:bg-[#1a8cd8]">
          Subscribe
        </Button>
      </div>
    </XPanel>
  )
}

export function NewsPanel() {
  return (
    <XPanel title="Today's News" action={<span className="text-xl text-[#e7e9ea]">×</span>}>
      <div className="py-3">
        {xNews.map((item) => (
          <Link key={item.title} href="/dashboard/forum" className="block px-4 py-3 transition hover:bg-[#080808]">
            <p className="text-[15px] font-extrabold leading-5 text-[#e7e9ea]">{item.title}</p>
            <p className="mt-2 text-[13px] text-[#71767b]">{item.meta}</p>
          </Link>
        ))}
      </div>
    </XPanel>
  )
}

export function TrendsPanel({ title = "What's happening" }: { title?: string }) {
  return (
    <XPanel title={title}>
      <div className="py-2">
        {xTrends.map((trend) => (
          <Link key={trend.title} href="/dashboard/forum" className="flex items-start justify-between gap-3 px-4 py-3 transition hover:bg-[#080808]">
            <div>
              <p className="text-[13px] text-[#71767b]">{trend.meta}</p>
              <p className="mt-0.5 text-[15px] font-bold text-[#e7e9ea]">{trend.title}</p>
            </div>
            <MoreHorizontal className="size-5 shrink-0 text-[#71767b]" />
          </Link>
        ))}
        <Link href="/dashboard/forum" className="block px-4 py-3 text-[15px] text-[#1d9bf0] transition hover:bg-[#080808]">
          Show more
        </Link>
      </div>
    </XPanel>
  )
}

export function WhoToFollowPanel({ title = 'Who to follow' }: { title?: string }) {
  return (
    <XPanel title={title}>
      <div className="py-3">
        {xPeople.map((person) => (
          <FollowRow key={person.handle} person={person} compact />
        ))}
        <Link href="/dashboard/contacts" className="block px-4 py-3 text-[15px] text-[#1d9bf0] transition hover:bg-[#080808]">
          Show more
        </Link>
      </div>
    </XPanel>
  )
}

export function FollowRow({
  person,
  compact = false,
}: {
  person: XPerson
  compact?: boolean
}) {
  return (
    <Link href="/dashboard/contacts" className="flex gap-3 px-4 py-3 transition hover:bg-[#080808]">
      <XAvatar name={person.name} initials={person.initials} size={compact ? 'sm' : 'md'} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-[15px] font-bold text-[#e7e9ea]">{person.name}</p>
          {person.verified ? <span className="text-[#1d9bf0]">✓</span> : null}
        </div>
        <p className="truncate text-[15px] text-[#71767b]">{person.handle}</p>
        {person.description && !compact ? (
          <p className="mt-1 line-clamp-2 text-[15px] leading-5 text-[#e7e9ea]">{person.description}</p>
        ) : null}
      </div>
      <Button className="mt-0.5 h-8 rounded-full bg-[#eff3f4] px-4 text-sm font-bold text-black hover:bg-[#d7dbdc]">
        Follow
      </Button>
    </Link>
  )
}

export function XFooter() {
  return (
    <div className="px-4 text-[12px] leading-6 text-[#71767b]">
      <span>Terms of Service</span>
      <span className="px-2">|</span>
      <span>Privacy Policy</span>
      <span className="px-2">|</span>
      <span>Cookie Policy</span>
      <br />
      <span>Imprint</span>
      <span className="px-2">|</span>
      <span>Accessibility</span>
      <span className="px-2">|</span>
      <span>© 2026 X Corp.</span>
    </div>
  )
}

export function XPageHeader({
  title,
  subtitle,
  backHref,
  action,
}: {
  title: string
  subtitle?: string
  backHref?: string
  action?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-10 flex h-[53px] items-center gap-6 border-b border-[#2f3336] bg-black/80 px-4 backdrop-blur-xl">
      {backHref ? (
        <Link href={backHref} className="flex size-9 items-center justify-center rounded-full text-[#e7e9ea] transition hover:bg-[#181818]">
          ←
        </Link>
      ) : null}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-extrabold text-[#e7e9ea]">{title}</h1>
        {subtitle ? <p className="text-[13px] leading-4 text-[#71767b]">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  )
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.charAt(0) ?? 'P'
  const second = parts[1]?.charAt(0) ?? ''
  return `${first}${second}`.toUpperCase()
}
