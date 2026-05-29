'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Hash, MessageCircle, Search, UserRound, UsersRound, X } from 'lucide-react'

type SearchItem = {
  title: string
  type: 'Topic' | 'Group' | 'Profile' | 'Stream'
  href: string
  description: string
}

const searchItems: SearchItem[] = [
  {
    title: 'Partner Status Feed',
    type: 'Topic',
    href: '/dashboard',
    description: 'Aktuelle Nachrichten, Termine, Threads und Updates im Partnerprogramm.',
  },
  {
    title: 'Streaming Hardware',
    type: 'Topic',
    href: '/dashboard/forum',
    description: 'Trends, Briefings und Diskussionen rund um Hardware-Kooperationen.',
  },
  {
    title: 'Groups & Chats',
    type: 'Group',
    href: '/dashboard/chat',
    description: 'Direkte Unterhaltungen, Gruppen und schnelle Abstimmungen.',
  },
  {
    title: 'Partner Lounge',
    type: 'Group',
    href: '/dashboard/chat',
    description: 'Live-Chat fuer laufende Kooperationen und schnelle Rueckfragen.',
  },
  {
    title: 'Realhosti Stream',
    type: 'Stream',
    href: '/dashboard/messages',
    description: 'Creator Studio, Briefings und Stream-bezogene Anfragen.',
  },
  {
    title: 'Zoe Huang',
    type: 'Profile',
    href: '/dashboard/contacts',
    description: 'Sales Representative bei HOLLYLAND.',
  },
  {
    title: 'Elyas Fehri',
    type: 'Profile',
    href: '/dashboard/contacts',
    description: 'Social Content Creator und Partnerkontakt.',
  },
  {
    title: 'Manmohen Singh',
    type: 'Profile',
    href: '/dashboard/contacts',
    description: 'Key Account Manager mit Infrastruktur-Fokus.',
  },
  {
    title: 'Dein Profil',
    type: 'Profile',
    href: '/dashboard/settings',
    description: 'Profil, Firma, Kontaktwege und Social Links bearbeiten.',
  },
]

const typeIcon = {
  Topic: Hash,
  Group: UsersRound,
  Profile: UserRound,
  Stream: MessageCircle,
}

export function PortalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const navigateTo = useCallback((href: string) => {
    setOpen(false)
    router.push(href)
  }, [router])

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return searchItems.slice(0, 6)
    }

    return searchItems
      .map((item) => {
        const haystack = `${item.title} ${item.type} ${item.description}`.toLowerCase()
        const starts = item.title.toLowerCase().startsWith(normalized) ? 3 : 0
        const includes = haystack.includes(normalized) ? 1 : 0
        return { item, score: starts + includes }
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((entry) => entry.item)
  }, [query])

  useEffect(() => {
    setActiveIndex(results.length ? 0 : -1)
  }, [results.length])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isSearchShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'

      if (isSearchShortcut) {
        event.preventDefault()
        setOpen(true)
        return
      }

      if (!open) {
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }

      if (!results.length) {
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex((current) => Math.min(current + 1, results.length - 1))
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex((current) => Math.max(current - 1, 0))
      }

      if (event.key === 'Enter') {
        const target = results[activeIndex]
        if (target) {
          event.preventDefault()
          navigateTo(target.href)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, navigateTo, open, results])

  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex h-[50px] w-full max-w-[233px] items-center gap-5 rounded-full px-3 py-3 text-left text-xl leading-6 text-[#e7e9ea] transition hover:bg-[#181818]"
        aria-label="Suche oeffnen"
        aria-haspopup="dialog"
      >
        <Search className="size-[26px] shrink-0 stroke-2" />
        <span className="min-w-0 flex-1">Search</span>
        <span className="ml-auto hidden items-center gap-1 text-[11px] text-[#71767b] group-hover:text-[#e7e9ea] min-[1180px]:flex">
          <kbd className="rounded-md border border-[#2f3336] bg-black px-1.5 py-0.5 leading-none">Ctrl</kbd>
          <kbd className="rounded-md border border-[#2f3336] bg-black px-1.5 py-0.5 leading-none">K</kbd>
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-[70] flex items-start justify-center bg-black/60 px-4 pt-5 backdrop-blur-[2px] sm:pt-8"
          role="dialog"
          aria-modal="true"
          aria-label="Partner Portal Suche"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Suche schliessen"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-[600px] overflow-hidden rounded-2xl border border-[#2f3336] bg-black shadow-[0_20px_70px_rgb(0_0_0_/_0.7)]">
            <div className="flex h-14 items-center gap-3 border-b border-[#2f3336] px-4">
              <Search className="size-5 shrink-0 text-[#71767b]" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder="Search topics, groups, profiles..."
                className="min-w-0 flex-1 bg-transparent text-[17px] text-[#e7e9ea] outline-none placeholder:text-[#71767b]"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-full text-[#71767b] transition hover:bg-[#181818] hover:text-[#e7e9ea]"
                aria-label="Suche schliessen"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[min(58vh,420px)] overflow-y-auto">
              {results.length ? (
                results.map((item, index) => {
                  const Icon = typeIcon[item.type]
                  return (
                    <Link
                      key={`${item.type}-${item.title}`}
                      href={item.href}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => setOpen(false)}
                      className={`flex gap-3 border-b border-[#16181c] px-4 py-3 transition last:border-b-0 ${
                        activeIndex === index ? 'bg-[#080808]' : 'hover:bg-[#080808]'
                      }`}
                    >
                      <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border border-[#2f3336] bg-[#16181c] text-[#1d9bf0]">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[15px] font-bold text-[#e7e9ea]">{item.title}</p>
                          <span className="text-[13px] text-[#71767b]">
                            {item.type}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-[#71767b]">{item.description}</p>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="py-12 text-center">
                  <Search className="mx-auto mb-3 size-8 text-[#71767b]" />
                  <p className="font-semibold text-[#e7e9ea]">No results found</p>
                  <p className="mt-1 text-sm text-[#71767b]">Try another topic, group or profile.</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-[#2f3336] bg-[#050505] px-4 py-3 text-xs text-[#71767b]">
              <span>
                <kbd className="rounded border border-[#2f3336] px-1.5">Up</kbd>{' '}
                <kbd className="rounded border border-[#2f3336] px-1.5">Down</kbd> Navigate
              </span>
              <span>
                <kbd className="rounded border border-[#2f3336] px-1.5">Enter</kbd> Select
              </span>
              <span>
                <kbd className="rounded border border-[#2f3336] px-1.5">Esc</kbd> Close
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
