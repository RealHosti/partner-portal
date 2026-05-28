'use client'

import { useEffect, useState } from 'react'
import { CalendarClock, Loader2, Plus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import type { Appointment } from '@/lib/types'
import { usePortalSession } from '@/hooks/use-auth-profile'

const demoAppointments: Appointment[] = [
  {
    id: 'demo-appointment-1',
    user_id: '00000000-0000-0000-0000-000000000001',
    admin_id: null,
    title: 'Kampagnen-Briefing',
    description: '30 Minuten Abstimmung fuer Hardware Placement.',
    appointment_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    duration_minutes: 30,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function AppointmentsPage() {
  const { profile, isDemo } = usePortalSession()
  const [appointments, setAppointments] = useState<Appointment[]>(demoAppointments)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadAppointments() {
      if (!isSupabaseConfigured() || !profile) {
        setAppointments(demoAppointments)
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', profile.id)
        .order('appointment_date', { ascending: true })

      if (active) {
        setAppointments(data ?? [])
      }
    }

    void loadAppointments()

    return () => {
      active = false
    }
  }, [profile])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') ?? '')
    const description = String(formData.get('description') ?? '')
    const appointmentDate = String(formData.get('appointment_date') ?? '')

    if (!title.trim() || !appointmentDate) {
      setError('Bitte Titel und Zeitpunkt ausfuellen.')
      setLoading(false)
      return
    }

    if (!isSupabaseConfigured() || isDemo || !profile) {
      setAppointments((current) => [
        {
          id: crypto.randomUUID(),
          user_id: profile?.id ?? demoAppointments[0].user_id,
          admin_id: null,
          title,
          description,
          appointment_date: new Date(appointmentDate).toISOString(),
          duration_minutes: 30,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...current,
      ])
      setLoading(false)
      event.currentTarget.reset()
      return
    }

    const supabase = createClient()
    const { data, error: insertError } = await supabase
      .from('appointments')
      .insert({
        user_id: profile.id,
        title,
        description,
        appointment_date: new Date(appointmentDate).toISOString(),
        duration_minutes: 30,
        status: 'pending',
      })
      .select('*')
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setAppointments((current) => (data ? [data, ...current] : current))
    setLoading(false)
    event.currentTarget.reset()
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-primary">Scheduling</p>
          <h2 className="font-display text-5xl leading-none">Termine</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Anfrage stellen, Realhosti bestaetigt den passenden Slot.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="portal-panel space-y-4 p-5">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input id="title" name="title" required placeholder="z.B. Kampagnen-Briefing" className="h-11 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointment_date">Wunschzeit</Label>
            <Input id="appointment_date" name="appointment_date" type="datetime-local" required className="h-11 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Notiz</Label>
            <Textarea id="description" name="description" rows={5} placeholder="Worum geht es?" className="rounded-lg" />
          </div>
          {error ? <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Termin anfragen
          </Button>
        </form>
      </section>

      <section className="portal-panel divide-y divide-border/70 overflow-hidden p-0">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <article key={appointment.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <CalendarClock className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{appointment.title}</h3>
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      {appointment.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(appointment.appointment_date).toLocaleString('de-DE', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                    {' - '}
                    {formatDistanceToNow(new Date(appointment.appointment_date), { addSuffix: true, locale: de })}
                  </p>
                  {appointment.description ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{appointment.description}</p>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">Noch keine Termine angefragt.</div>
        )}
      </section>
    </div>
  )
}
