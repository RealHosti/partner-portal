'use client'

import { useState } from 'react'
import { Loader2, Save, ShieldCheck, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { usePortalSession } from '@/hooks/use-auth-profile'

export default function SettingsPage() {
  const { profile, isDemo, refreshProfile } = usePortalSession()
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!isSupabaseConfigured() || isDemo || !profile) {
      setMessage('Profil wurde in der lokalen Demo gespeichert.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ bio, updated_at: new Date().toISOString() })
      .eq('id', profile.id)

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    await refreshProfile()
    setMessage('Profil gespeichert.')
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-primary">Account</p>
        <h2 className="font-display text-5xl leading-none">Profil</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Twitch-Daten kommen ueber Supabase Auth, Portal-Daten liegen in deiner Profile-Tabelle.
        </p>
      </div>

      <section className="portal-panel p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {profile?.twitch_avatar_url ? (
            <img
              src={profile.twitch_avatar_url}
              alt={profile.twitch_display_name ?? 'Twitch Avatar'}
              className="size-20 rounded-lg border border-primary/50 object-cover"
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-lg border border-primary/50 bg-secondary text-primary">
              <UserRound className="size-10" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-2xl font-semibold">{profile?.twitch_display_name ?? 'Partner'}</h3>
              {profile?.is_admin ? (
                <Badge className="bg-primary text-primary-foreground">
                  <ShieldCheck className="size-3" />
                  Admin
                </Badge>
              ) : null}
              {profile?.is_partner ? <Badge variant="outline">Partner</Badge> : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">@{profile?.twitch_username ?? 'twitch'}</p>
            <p className="mt-1 text-sm text-muted-foreground">{profile?.twitch_email ?? 'Keine E-Mail gespeichert'}</p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="portal-panel space-y-4 p-5">
        <div className="space-y-2">
          <Label htmlFor="bio">Partner Notiz</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={7}
            placeholder="Kurzbeschreibung, Kontaktpraeferenzen oder Kampagnen-Schwerpunkte..."
            className="rounded-lg"
          />
        </div>
        {message ? <p className="rounded-lg border border-border bg-secondary/60 p-3 text-sm text-muted-foreground">{message}</p> : null}
        <Button type="submit" disabled={loading} className="h-11 rounded-lg">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Speichern
        </Button>
      </form>
    </div>
  )
}
