'use client'

import { Settings } from 'lucide-react'
import { FollowRow, XPageHeader, XRightRail, type XPerson } from '@/components/dashboard/x-ui'

const suggestions: XPerson[] = [
  {
    name: 'sech',
    handle: '@sech28',
    initials: 'SE',
    verified: true,
    description: 'ceo von arschwasser® inc.',
  },
  {
    name: 'SPIEGELBRO | TWITTERNEWS',
    handle: '@spiegelbro',
    initials: 'SB',
    description: 'Taegliche Zusammenfassung der besten Tweets des Tages - seit ueber vier Jahren.',
  },
  {
    name: 'Elon Musk',
    handle: '@elonmusk',
    initials: 'EM',
    verified: true,
    description: 'Terafab.ai',
  },
  {
    name: 'Mupf05',
    handle: '@Mupf05YT',
    initials: 'M5',
    verified: true,
    description: 'Manche gehen, manche bleiben, dankbar bin ich beiden, gibt kein Grund sich hier zu streiten.',
  },
  {
    name: 'Vepexautoclicker',
    handle: '@Vepexautoclick1',
    initials: 'VA',
    description: 'Valorant sucht is real - ehemaliger Bedwars enjoyer',
  },
  {
    name: 'VanITy',
    handle: '@JustVNTY',
    initials: 'VA',
    verified: true,
    description: 'Fitness, Creator Relations und Affiliate Marketing',
  },
  {
    name: 'cologne grim reaper :D',
    handle: '@fakkchit',
    initials: 'CG',
    description: 'its a punked up world',
  },
]

export default function FollowPage() {
  return (
    <div className="grid min-h-svh grid-cols-1 xl:grid-cols-[600px_380px]">
      <section className="min-w-0 border-x border-[#2f3336] bg-black">
        <XPageHeader
          title="Follow"
          backHref="/dashboard"
          action={
            <button type="button" className="flex size-9 items-center justify-center rounded-full text-[#e7e9ea] transition hover:bg-[#181818]" aria-label="Follow settings">
              <Settings className="size-5" />
            </button>
          }
        />

        <div className="grid h-[53px] grid-cols-2 border-b border-[#2f3336] text-[15px] font-bold">
          <button type="button" className="relative text-[#e7e9ea]">
            Who to follow
            <span className="absolute bottom-0 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-[#1d9bf0]" />
          </button>
          <button type="button" className="text-[#71767b] transition hover:bg-[#080808]">
            Creators for you
          </button>
        </div>

        <section className="py-5">
          <h2 className="px-4 text-2xl font-extrabold tracking-[-0.02em] text-[#e7e9ea]">Suggested for you</h2>
          <div className="mt-4">
            {suggestions.map((person) => (
              <FollowRow key={person.handle} person={person} />
            ))}
          </div>
        </section>
      </section>

      <XRightRail mode="simple" />
    </div>
  )
}
