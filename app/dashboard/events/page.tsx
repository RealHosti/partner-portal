'use client'

import { CalendarDays, MapPin, Radio, UsersRound } from 'lucide-react'
import { XPageHeader, XRightRail } from '@/components/dashboard/x-ui'

const events = [
  {
    title: 'Gamescom Partner Week',
    kind: 'Messe',
    date: '20. August',
    location: 'Koeln',
    attendees: '8 Partner',
  },
  {
    title: 'Streaming Hardware Showcase',
    kind: 'Online Event',
    date: '12. September',
    location: 'Discord Stage',
    attendees: '14 Partner',
  },
  {
    title: 'Creator Deal Room',
    kind: 'Networking',
    date: '02. Oktober',
    location: 'Remote',
    attendees: '6 Firmen',
  },
]

export default function EventsPage() {
  return (
    <div className="grid min-h-svh grid-cols-1 xl:grid-cols-[600px_380px]">
      <section className="min-w-0 border-x border-[#2f3336] bg-black">
        <XPageHeader title="Events" subtitle="Messen, Showcases und Partneraktionen" backHref="/dashboard" />

        <section className="border-b border-[#2f3336] px-5 py-5">
          <div className="rounded-3xl border border-[#2f3336] bg-[#050505] p-5">
            <div className="flex gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#ff7a00]/15 text-[#ff9f1a]">
                <Radio className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#e7e9ea]">Event Hub</h2>
                <p className="mt-1 text-[15px] leading-5 text-[#71767b]">
                  Hier landen Partner-Events, Streams, Messetermine und gemeinsame Aktionen.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="divide-y divide-[#2f3336]">
          {events.map((event) => (
            <article key={event.title} className="px-5 py-4 transition hover:bg-[#080808]">
              <div className="flex gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#2f3336] bg-[#16181c] text-[#1d9bf0]">
                  <CalendarDays className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[17px] font-extrabold text-[#e7e9ea]">{event.title}</h3>
                    <span className="rounded-full border border-[#2f3336] px-2 py-0.5 text-xs font-bold text-[#71767b]">
                      {event.kind}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#71767b]">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-4" />
                      {event.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" />
                      {event.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <UsersRound className="size-4" />
                      {event.attendees}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <XRightRail mode="simple" />
    </div>
  )
}
