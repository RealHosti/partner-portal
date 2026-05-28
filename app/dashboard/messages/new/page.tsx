'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { usePortalSession } from '@/hooks/use-auth-profile'

export default function NewMessagePage() {
  const router = useRouter()
  const { profile, isDemo } = usePortalSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const subject = String(formData.get('subject') ?? '')
    const content = String(formData.get('content') ?? '')
    const messageType = String(formData.get('messageType') ?? 'request')

    if (!subject.trim() || !content.trim()) {
      setError('Bitte Betreff und Nachricht ausfuellen.')
      setLoading(false)
      return
    }

    if (!isSupabaseConfigured() || isDemo) {
      setLoading(false)
      router.push('/dashboard/messages')
      return
    }

    if (!profile) {
      setError('Dein Profil konnte nicht geladen werden.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: insertError } = await supabase.from('messages').insert({
      sender_id: profile.id,
      recipient_id: null,
      subject,
      content,
      message_type: messageType,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/messages')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="rounded-lg">
          <Link href="/dashboard/messages" aria-label="Zurueck zu Nachrichten">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-primary">Neue Anfrage</p>
          <h2 className="font-display text-5xl leading-none">Nachricht</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="portal-panel space-y-5 p-5">
        <div className="grid gap-5 sm:grid-cols-[0.72fr_1.28fr]">
          <div className="space-y-2">
            <Label htmlFor="messageType">Typ</Label>
            <Select name="messageType" defaultValue="request">
              <SelectTrigger id="messageType" className="h-11 rounded-lg">
                <SelectValue placeholder="Typ waehlen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="request">Kooperationsanfrage</SelectItem>
                <SelectItem value="inquiry">Rueckfrage</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Betreff</Label>
            <Input id="subject" name="subject" placeholder="z.B. Kampagne Juni Launch" required className="h-11 rounded-lg" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Nachricht</Label>
          <Textarea
            id="content"
            name="content"
            placeholder="Briefing, Budgetrahmen, Zeitraum, Deliverables und offene Fragen..."
            rows={10}
            required
            className="rounded-lg"
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button asChild type="button" variant="outline" className="h-11 rounded-lg">
            <Link href="/dashboard/messages">Abbrechen</Link>
          </Button>
          <Button type="submit" disabled={loading} className="h-11 rounded-lg">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Senden
          </Button>
        </div>
      </form>
    </div>
  )
}
