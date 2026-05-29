'use client'

import { PartyPopper, Settings } from 'lucide-react'
import { XPageHeader, XRightRail } from '@/components/dashboard/x-ui'

export default function NotificationsPage() {
  return (
    <div className="grid min-h-svh grid-cols-1 xl:grid-cols-[600px_380px]">
      <section className="min-w-0 border-x border-[#2f3336] bg-black">
        <XPageHeader
          title="Notifications"
          action={
            <button type="button" className="flex size-9 items-center justify-center rounded-full text-[#e7e9ea] transition hover:bg-[#181818]" aria-label="Notification settings">
              <Settings className="size-5" />
            </button>
          }
        />

        <div className="grid h-[53px] grid-cols-2 border-b border-[#2f3336] text-[15px] font-bold">
          <button type="button" className="relative text-[#e7e9ea]">
            All
            <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-[#1d9bf0]" />
          </button>
          <button type="button" className="text-[#71767b] transition hover:bg-[#080808]">
            Mentions
          </button>
        </div>

        <article className="flex gap-3 border-b border-[#2f3336] px-7 py-4">
          <PartyPopper className="mt-0.5 size-8 shrink-0 text-[#f91880]" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] leading-5 text-[#e7e9ea]">
              It's your X anniversary! Celebrate with a special post created just for you ·{' '}
              <span className="text-[#71767b]">May 23</span>
            </p>
          </div>
          <span className="text-[#71767b]">•••</span>
        </article>
      </section>

      <XRightRail mode="simple" />
    </div>
  )
}
