'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { Mail, MailOpen, Plus, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import type { Message } from '@/lib/types'
import { usePortalSession } from '@/hooks/use-auth-profile'

const demoMessages: Message[] = [
  {
    id: 'demo-message-1',
    sender_id: 'demo',
    recipient_id: '00000000-0000-0000-0000-000000000001',
    subject: 'Hardware-Kampagne Q3',
    content: 'Wir wuerden gern ein kurzes Placement rund um neue Streaming Hardware abstimmen.',
    is_read: false,
    message_type: 'request',
    created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-message-2',
    sender_id: '00000000-0000-0000-0000-000000000001',
    recipient_id: null,
    subject: 'Asset-Freigabe',
    content: 'Die Logos und Timing-Daten sind im Forum angehaengt. Bitte einmal gegenpruefen.',
    is_read: true,
    message_type: 'inquiry',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function MessagesPage() {
  const { profile } = usePortalSession()
  const [messages, setMessages] = useState<Message[]>(demoMessages)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadMessages() {
      if (!isSupabaseConfigured() || !profile) {
        setMessages(demoMessages)
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id},recipient_id.is.null`)
        .order('created_at', { ascending: false })

      if (active) {
        setMessages(data ?? [])
        setLoading(false)
      }
    }

    void loadMessages()

    return () => {
      active = false
    }
  }, [profile])

  const filteredMessages = messages.filter((message) => {
    const haystack = `${message.subject} ${message.content}`.toLowerCase()
    return haystack.includes(query.toLowerCase())
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-primary">Direct Line</p>
          <h2 className="font-display text-5xl leading-none">Nachrichten</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Angebote, Briefings und Rueckfragen bleiben hier sortiert.
          </p>
        </div>
        <Button asChild className="h-11 rounded-lg">
          <Link href="/dashboard/messages/new">
            <Plus className="size-4" />
            Neue Nachricht
          </Link>
        </Button>
      </div>

      <div className="portal-panel p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nachrichten durchsuchen"
            className="h-11 rounded-lg border-border/80 bg-background/70 pl-9"
          />
        </div>
      </div>

      <section className="portal-panel divide-y divide-border/70 overflow-hidden p-0">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Nachrichten werden geladen.</div>
        ) : filteredMessages.length > 0 ? (
          filteredMessages.map((message) => (
            <Link
              key={message.id}
              href="/dashboard/messages/new"
              className="flex gap-4 p-4 transition hover:bg-secondary/50"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                {message.is_read ? <MailOpen className="size-5" /> : <Mail className="size-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-semibold">{message.subject}</h3>
                  {!message.is_read ? <Badge className="bg-primary text-primary-foreground">Neu</Badge> : null}
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {message.message_type}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{message.content}</p>
              </div>
              <time className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: de })}
              </time>
            </Link>
          ))
        ) : (
          <div className="p-8 text-center">
            <Mail className="mx-auto mb-3 size-10 text-primary" />
            <p className="font-semibold">Keine Nachrichten gefunden</p>
            <p className="mt-1 text-sm text-muted-foreground">Schreibe die erste Anfrage an Realhosti.</p>
            <Button asChild className="mt-5 rounded-lg">
              <Link href="/dashboard/messages/new">Nachricht schreiben</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
