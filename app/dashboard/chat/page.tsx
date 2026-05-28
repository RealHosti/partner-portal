'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, MessagesSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import type { ChatMessage, Profile } from '@/lib/types'
import { usePortalSession } from '@/hooks/use-auth-profile'

type ChatEntry = ChatMessage & {
  sender?: Pick<Profile, 'twitch_display_name' | 'twitch_username' | 'twitch_avatar_url'>
}

const roomId = process.env.NEXT_PUBLIC_PORTAL_CHAT_ROOM_ID ?? 'partner-lounge'

const demoMessages: ChatEntry[] = [
  {
    id: 'demo-chat-1',
    room_id: roomId,
    sender_id: 'realhosti',
    content: 'Willkommen im Partner-Livechat. Hier koennen wir Kampagnen schnell abstimmen.',
    created_at: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    sender: {
      twitch_display_name: 'Realhosti',
      twitch_username: 'realhosti',
      twitch_avatar_url: null,
    },
  },
  {
    id: 'demo-chat-2',
    room_id: roomId,
    sender_id: '00000000-0000-0000-0000-000000000001',
    content: 'Perfekt, dann packe ich Budget und Timing in die Anfrage.',
    created_at: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    sender: {
      twitch_display_name: 'Realhosti Partner',
      twitch_username: 'realhosti_partner',
      twitch_avatar_url: null,
    },
  },
]

export default function ChatPage() {
  const { profile, isDemo } = usePortalSession()
  const [messages, setMessages] = useState<ChatEntry[]>(demoMessages)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  useEffect(() => {
    let active = true

    async function loadMessages() {
      if (!isSupabaseConfigured() || !profile) {
        setMessages(demoMessages)
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(80)

      if (!active) {
        return
      }

      const senderIds = [...new Set((data ?? []).map((message) => message.sender_id))]
      const { data: profiles } = senderIds.length
        ? await supabase.from('profiles').select('id,twitch_display_name,twitch_username,twitch_avatar_url').in('id', senderIds)
        : { data: [] }

      const profilesById = new Map((profiles ?? []).map((item) => [item.id, item]))
      setMessages((data ?? []).map((message) => ({ ...message, sender: profilesById.get(message.sender_id) })))
    }

    void loadMessages()

    if (!isSupabaseConfigured()) {
      return () => {
        active = false
      }
    }

    const supabase = createClient()
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const nextMessage = payload.new as ChatMessage
          setMessages((current) => {
            if (current.some((message) => message.id === nextMessage.id)) {
              return current
            }

            return [
              ...current,
              {
                ...nextMessage,
                sender: nextMessage.sender_id === profile?.id ? profile : undefined,
              },
            ]
          })
        },
      )
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [profile])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) {
      return
    }

    setLoading(true)

    if (!isSupabaseConfigured() || isDemo || !profile) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          room_id: roomId,
          sender_id: profile?.id ?? 'demo',
          content: trimmed,
          created_at: new Date().toISOString(),
          sender: profile ?? undefined,
        },
      ])
      setContent('')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from('chat_messages').insert({
      sender_id: profile.id,
      room_id: roomId,
      content: trimmed,
    })

    if (!error) {
      setContent('')
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-[calc(100svh-8rem)] flex-col gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-primary">Realtime Room</p>
        <h2 className="font-display text-5xl leading-none">Live-Chat</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ein schneller Kanal fuer Abstimmungen, sobald beide Seiten online sind.
        </p>
      </div>

      <section className="portal-panel flex min-h-[520px] flex-1 flex-col overflow-hidden p-0">
        <div className="flex items-center gap-3 border-b border-border/70 p-4">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground glow-orange">
            <MessagesSquare className="size-6" />
          </div>
          <div>
            <h3 className="font-semibold">Partner Lounge</h3>
            <p className="text-xs text-muted-foreground">Room ID: {roomId}</p>
          </div>
        </div>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((message) => {
            const ownMessage = message.sender_id === profile?.id
            const sender = message.sender

            return (
              <div key={message.id} className={ownMessage ? 'flex justify-end' : 'flex justify-start'}>
                <div className={ownMessage ? 'max-w-[82%] rounded-lg bg-primary p-3 text-primary-foreground' : 'max-w-[82%] rounded-lg bg-secondary p-3'}>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold opacity-80">
                      {sender?.twitch_display_name ?? sender?.twitch_username ?? (ownMessage ? 'Du' : 'Partner')}
                    </span>
                    <time className="text-[11px] opacity-60">
                      {new Date(message.created_at).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                  <p className="text-sm leading-6">{message.content}</p>
                </div>
              </div>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border/70 p-3">
          <Input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Nachricht schreiben"
            className="h-11 rounded-lg"
          />
          <Button type="submit" disabled={loading} size="icon" className="size-11 rounded-lg" aria-label="Senden">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </form>
      </section>
    </div>
  )
}
