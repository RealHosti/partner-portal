'use client'

import { AtSign, Bell, CheckCircle2, MessageCircle, Settings } from 'lucide-react'
import { XPageHeader, XRightRail } from '@/components/dashboard/x-ui'

const notifications = [
  {
    icon: Bell,
    title: 'Neue Partner-Nachricht',
    text: 'Zoe Huang hat dir eine Rueckfrage zur Hardware-Kampagne geschickt.',
    time: 'vor 12 Minuten',
    tone: 'blue',
  },
  {
    icon: CheckCircle2,
    title: 'Profil fast bereit',
    text: 'Deine Kontaktdaten und Social Links sind gespeichert und fuer Partner sichtbar.',
    time: 'vor 1 Stunde',
    tone: 'green',
  },
  {
    icon: AtSign,
    title: 'Erwaehnung in Gruppe',
    text: 'Realhosti Staff hat dich in Partner Lounge markiert.',
    time: 'gestern',
    tone: 'pink',
  },
]

export default function NotificationsPage() {
  return (
    <div className="grid min-h-svh grid-cols-1 xl:grid-cols-[600px_380px]">
      <section className="min-w-0 border-x border-[#2f3336] bg-black">
        <XPageHeader
          title="Benachrichtigungen"
          action={
            <button type="button" className="flex size-9 items-center justify-center rounded-full text-[#e7e9ea] transition hover:bg-[#181818]" aria-label="Notification settings">
              <Settings className="size-5" />
            </button>
          }
        />

        <div className="grid h-[53px] grid-cols-2 border-b border-[#2f3336] text-[15px] font-bold">
          <button type="button" className="relative text-[#e7e9ea]">
            Alle
            <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-[#1d9bf0]" />
          </button>
          <button type="button" className="text-[#71767b] transition hover:bg-[#080808]">
            Erwaehnungen
          </button>
        </div>

        <div className="divide-y divide-[#2f3336]">
          {notifications.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.title} className="flex gap-4 px-5 py-4 transition hover:bg-[#080808]">
                <div className={getNotificationIconClass(item.tone)}>
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-[#e7e9ea]">{item.title}</p>
                  <p className="mt-1 text-[15px] leading-5 text-[#e7e9ea]">{item.text}</p>
                  <p className="mt-2 text-sm text-[#71767b]">{item.time}</p>
                </div>
              </article>
            )
          })}
        </div>

        <section className="px-5 py-8 text-center">
          <MessageCircle className="mx-auto mb-3 size-10 text-[#71767b]" />
          <p className="font-bold text-[#e7e9ea]">Alles im Blick.</p>
          <p className="mt-1 text-sm text-[#71767b]">Neue Hinweise landen hier, ohne die Topbar vollzumachen.</p>
        </section>
      </section>

      <XRightRail mode="simple" />
    </div>
  )
}

function getNotificationIconClass(tone: string) {
  if (tone === 'green') {
    return 'flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-400'
  }

  if (tone === 'pink') {
    return 'flex size-10 shrink-0 items-center justify-center rounded-full bg-[#f91880]/12 text-[#f91880]'
  }

  return 'flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1d9bf0]/12 text-[#1d9bf0]'
}
