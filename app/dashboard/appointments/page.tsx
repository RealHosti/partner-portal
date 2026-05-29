'use client'

import { CalendarCheck, Clock, Plus, Video } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { XPageHeader, XRightRail } from '@/components/dashboard/x-ui'

const appointments = [
  {
    title: 'Kickoff Hardware-Kampagne',
    company: 'HOLLYLAND',
    date: '03. Juni',
    time: '14:30',
    status: 'Angefragt',
  },
  {
    title: 'Briefing Review',
    company: 'Realhosti Staff',
    date: '06. Juni',
    time: '18:00',
    status: 'Offen',
  },
  {
    title: 'Asset-Freigabe',
    company: 'Gcore',
    date: '10. Juni',
    time: '11:15',
    status: 'Geplant',
  },
]

export default function AppointmentsPage() {
  return (
    <div className="grid min-h-svh grid-cols-1 xl:grid-cols-[600px_380px]">
      <section className="min-w-0 border-x border-[#2f3336] bg-black">
        <XPageHeader
          title="Termine"
          subtitle="Calls, Abstimmungen und Freigaben"
          action={
            <Button asChild className="h-9 rounded-full bg-[#eff3f4] px-4 text-[15px] font-bold text-black hover:bg-[#d7dbdc]">
              <Link href="/dashboard/messages/new">
                <Plus className="size-4" />
                Neu
              </Link>
            </Button>
          }
        />

        <section className="border-b border-[#2f3336] px-5 py-5">
          <div className="rounded-3xl border border-[#2f3336] bg-[#050505] p-5">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#1d9bf0]/12 text-[#1d9bf0]">
                <CalendarCheck className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#e7e9ea]">Naechster Termin</h2>
                <p className="mt-1 text-[15px] leading-5 text-[#71767b]">
                  Kickoff Hardware-Kampagne mit HOLLYLAND am 03. Juni um 14:30.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="divide-y divide-[#2f3336]">
          {appointments.map((appointment) => (
            <article key={appointment.title} className="flex gap-4 px-5 py-4 transition hover:bg-[#080808]">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[#2f3336] bg-[#16181c] text-[#1d9bf0]">
                <Video className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-[#e7e9ea]">{appointment.title}</p>
                  <span className="rounded-full border border-[#2f3336] px-2 py-0.5 text-xs font-bold text-[#71767b]">
                    {appointment.status}
                  </span>
                </div>
                <p className="mt-1 text-[15px] text-[#71767b]">{appointment.company}</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#e7e9ea]">
                  <Clock className="size-4 text-[#71767b]" />
                  {appointment.date} - {appointment.time}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <XRightRail mode="simple" />
    </div>
  )
}
