'use client'

import Link from 'next/link'
import { Archive, ChevronDown, MailPlus, MessageCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ChatPage() {
  return (
    <div className="grid min-h-svh grid-cols-1 border-r border-[#2f3336] bg-black xl:grid-cols-[415px_minmax(0,1fr)]">
      <section className="min-h-svh border-x border-[#2f3336]">
        <header className="flex h-[53px] items-center justify-between px-4">
          <h1 className="text-xl font-extrabold text-[#e7e9ea]">Chat</h1>
          <div className="flex items-center gap-2">
            <button type="button" className="inline-flex h-9 items-center gap-1 rounded-full border border-[#2f3336] px-4 text-[15px] font-bold text-[#e7e9ea] transition hover:bg-[#181818]">
              All
              <ChevronDown className="size-4" />
            </button>
            <button type="button" className="flex size-9 items-center justify-center rounded-full border border-[#2f3336] text-[#e7e9ea] transition hover:bg-[#181818]" aria-label="Archive">
              <Archive className="size-4" />
            </button>
            <button type="button" className="flex size-9 items-center justify-center rounded-full border border-[#2f3336] text-[#e7e9ea] transition hover:bg-[#181818]" aria-label="New chat">
              <MailPlus className="size-4" />
            </button>
          </div>
        </header>

        <div className="px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-36 top-1/2 size-5 -translate-y-1/2 text-[#71767b] xl:left-[150px]" />
            <Input
              placeholder="Search"
              className="h-[42px] rounded-full border-0 bg-[#16181c] pl-[178px] text-[15px] text-[#e7e9ea] placeholder:text-[#71767b] focus-visible:ring-[#1d9bf0]"
            />
          </div>
        </div>

        <div className="flex min-h-[calc(100svh-118px)] items-center justify-center px-8 text-center">
          <div>
            <MessageCircle className="mx-auto size-20 text-[#e7e9ea]" />
            <h2 className="mt-10 text-2xl font-extrabold text-[#e7e9ea]">Empty inbox</h2>
            <p className="mt-2 text-[15px] text-[#71767b]">Message someone</p>
          </div>
        </div>
      </section>

      <section className="hidden min-h-svh items-center justify-center border-r border-[#2f3336] xl:flex">
        <div className="text-center">
          <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-[#16181c]">
            <MessageCircle className="size-14 text-[#e7e9ea]" />
          </div>
          <h2 className="mt-6 text-xl font-extrabold text-[#e7e9ea]">Start Conversation</h2>
          <p className="mt-3 text-[15px] text-[#71767b]">
            Choose from your existing conversations, or start a new one.
          </p>
          <Button asChild className="mt-6 h-9 rounded-full bg-[#eff3f4] px-5 text-[15px] font-bold text-black hover:bg-[#d7dbdc]">
            <Link href="/dashboard/messages/new">New chat</Link>
          </Button>
        </div>
      </section>

    </div>
  )
}
