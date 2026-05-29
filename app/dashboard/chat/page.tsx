'use client'

import Link from 'next/link'
import { Info, MessageCircle, MoreHorizontal, Paperclip, Send, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { XAvatar } from '@/components/dashboard/x-ui'

const messages = [
  {
    author: 'Realhosti Staff',
    text: 'Willkommen in der Partner Lounge. Hier landen schnelle Rueckfragen, Gruppenabsprachen und laufende Briefings.',
    time: '09:14',
    mine: false,
  },
  {
    author: 'Realhosti Partner',
    text: 'Alles klar, ich pruefe gerade die offenen Kooperationen und sammle die naechsten Themen.',
    time: '09:18',
    mine: true,
  },
]

export default function ChatPage() {
  return (
    <section className="flex min-h-[calc(100svh-4rem)] flex-col border-r border-[#2f3336] bg-black">
      <header className="sticky top-16 z-10 flex h-[64px] items-center justify-between border-b border-[#2f3336] bg-black/88 px-4 backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full border border-[#2f3336] bg-[#16181c] text-[#1d9bf0]">
            <MessageCircle className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold text-[#e7e9ea]">Partner Lounge</h1>
            <p className="truncate text-sm text-[#71767b]">12 members - 4 online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="flex size-9 items-center justify-center rounded-full text-[#71767b] transition hover:bg-[#181818] hover:text-[#e7e9ea]" aria-label="Chat info">
            <Info className="size-5" />
          </button>
          <button type="button" className="flex size-9 items-center justify-center rounded-full text-[#71767b] transition hover:bg-[#181818] hover:text-[#e7e9ea]" aria-label="More">
            <MoreHorizontal className="size-5" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="rounded-3xl border border-[#2f3336] bg-[#050505] p-5 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#16181c]">
              <MessageCircle className="size-8 text-[#e7e9ea]" />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-[#e7e9ea]">Partner Lounge</h2>
            <p className="mx-auto mt-2 max-w-md text-[15px] leading-5 text-[#71767b]">
              Nutze die zweite Sidebar links, um zwischen Gruppen und Freunden zu wechseln.
            </p>
          </div>

          {messages.map((message) => (
            <article key={`${message.author}-${message.time}`} className={message.mine ? 'flex justify-end' : 'flex justify-start'}>
              <div className={message.mine ? 'max-w-[72%]' : 'flex max-w-[72%] gap-3'}>
                {!message.mine ? <XAvatar name={message.author} initials="RH" size="sm" /> : null}
                <div>
                  {!message.mine ? (
                    <p className="mb-1 text-sm font-bold text-[#e7e9ea]">{message.author}</p>
                  ) : null}
                  <div
                    className={
                      message.mine
                        ? 'rounded-3xl bg-[#1d9bf0] px-4 py-3 text-[15px] leading-5 text-white'
                        : 'rounded-3xl border border-[#2f3336] bg-[#16181c] px-4 py-3 text-[15px] leading-5 text-[#e7e9ea]'
                    }
                  >
                    {message.text}
                  </div>
                  <p className={message.mine ? 'mt-1 text-right text-xs text-[#71767b]' : 'mt-1 text-xs text-[#71767b]'}>
                    {message.time}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <footer className="border-t border-[#2f3336] bg-black px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-3xl border border-[#2f3336] bg-[#050505] p-2">
          <button type="button" className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#1d9bf0] transition hover:bg-[#1d9bf0]/10" aria-label="Attach file">
            <Paperclip className="size-5" />
          </button>
          <textarea
            rows={1}
            placeholder="Write a message..."
            className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-6 text-[#e7e9ea] outline-none placeholder:text-[#71767b]"
          />
          <button type="button" className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#1d9bf0] transition hover:bg-[#1d9bf0]/10" aria-label="Emoji">
            <Smile className="size-5" />
          </button>
          <Button asChild className="size-10 shrink-0 rounded-full bg-[#eff3f4] p-0 text-black hover:bg-[#d7dbdc]" aria-label="Send message">
            <Link href="/dashboard/chat">
              <Send className="size-5" />
            </Link>
          </Button>
        </div>
      </footer>
    </section>
  )
}
