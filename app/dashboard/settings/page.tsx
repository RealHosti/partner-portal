'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Building2,
  Check,
  Globe2,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import type { Company, CompanyMembership, Profile } from '@/lib/types'
import { usePortalSession } from '@/hooks/use-auth-profile'

type SocialLinks = {
  twitch: string
  instagram: string
  x: string
  linkedin: string
  youtube: string
  tiktok: string
  website: string
}

type ProfileForm = {
  employment_title: string
  company_role: string
  department: string
  industry: string
  country: string
  city: string
  about: string
  contact_email: string
  mobile_phone: string
  phone: string
  company_website: string
  company_address: string
  preferred_contact_method: string
  profile_visibility: string
}

type CompanyForm = {
  name: string
  website: string
  industry: string
  country: string
  city: string
  address: string
  description: string
  role_title: string
  relationship_type: string
}

type MembershipWithCompany = CompanyMembership & {
  company?: Company
}

const emptySocialLinks: SocialLinks = {
  twitch: '',
  instagram: '',
  x: '',
  linkedin: '',
  youtube: '',
  tiktok: '',
  website: '',
}

const emptyCompanyForm: CompanyForm = {
  name: '',
  website: '',
  industry: '',
  country: '',
  city: '',
  address: '',
  description: '',
  role_title: '',
  relationship_type: 'employee',
}

const demoCompany: Company = {
  id: '00000000-0000-0000-0000-000000000101',
  owner_id: '00000000-0000-0000-0000-000000000001',
  name: 'Realhosti Media',
  slug: 'realhosti-media',
  website: 'https://realhosti.de',
  industry: 'Gaming & Streaming',
  country: 'Deutschland',
  city: 'Berlin',
  address: null,
  description: 'Demo-Firma fuer lokale Portal-Preview.',
  status: 'approved',
  reviewed_by: null,
  reviewed_at: new Date().toISOString(),
  rejection_reason: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

function toText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function getSocialLinks(profile: Profile | null): SocialLinks {
  const links = profile?.social_links && typeof profile.social_links === 'object' && !Array.isArray(profile.social_links)
    ? profile.social_links as Record<string, unknown>
    : {}

  return {
    twitch: toText(links.twitch),
    instagram: toText(links.instagram),
    x: toText(links.x),
    linkedin: toText(links.linkedin),
    youtube: toText(links.youtube),
    tiktok: toText(links.tiktok),
    website: toText(links.website),
  }
}

function getProfileForm(profile: Profile | null): ProfileForm {
  return {
    employment_title: profile?.employment_title ?? '',
    company_role: profile?.company_role ?? '',
    department: profile?.department ?? '',
    industry: profile?.industry ?? '',
    country: profile?.country ?? '',
    city: profile?.city ?? '',
    about: profile?.about ?? profile?.bio ?? '',
    contact_email: profile?.contact_email ?? profile?.twitch_email ?? '',
    mobile_phone: profile?.mobile_phone ?? '',
    phone: profile?.phone ?? '',
    company_website: profile?.company_website ?? '',
    company_address: profile?.company_address ?? '',
    preferred_contact_method: profile?.preferred_contact_method ?? 'email',
    profile_visibility: profile?.profile_visibility ?? 'partners',
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function isStaffProfile(profile: Profile | null) {
  return Boolean(profile?.is_admin || ['staff', 'moderator', 'admin'].includes(profile?.app_role ?? ''))
}

export default function SettingsPage() {
  const { profile, isDemo, refreshProfile } = usePortalSession()
  const [form, setForm] = useState<ProfileForm>(() => getProfileForm(profile))
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(() => getSocialLinks(profile))
  const [memberships, setMemberships] = useState<MembershipWithCompany[]>([])
  const [pendingCompanies, setPendingCompanies] = useState<Company[]>([])
  const [companyForm, setCompanyForm] = useState<CompanyForm>(emptyCompanyForm)
  const [loading, setLoading] = useState(false)
  const [companyLoading, setCompanyLoading] = useState(false)
  const [moderationLoading, setModerationLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const isStaff = isStaffProfile(profile)
  const approvedMembership = useMemo(
    () => memberships.find((membership) => membership.status === 'approved'),
    [memberships],
  )

  useEffect(() => {
    setForm(getProfileForm(profile))
    setSocialLinks(getSocialLinks(profile))
  }, [profile])

  useEffect(() => {
    let active = true

    async function loadCompanies() {
      if (!profile) {
        return
      }

      if (!isSupabaseConfigured() || isDemo) {
        setMemberships([
          {
            id: '00000000-0000-0000-0000-000000000201',
            company_id: demoCompany.id,
            profile_id: profile.id,
            role_title: 'Partnership Manager',
            relationship_type: 'employee',
            status: 'approved',
            approved_by: null,
            approved_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            company: demoCompany,
          },
        ])
        setPendingCompanies([])
        return
      }

      const supabase = createClient()
      const { data: membershipRows } = await supabase
        .from('company_memberships')
        .select('*, company:companies(*)')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false })

      if (active) {
        setMemberships((membershipRows as MembershipWithCompany[] | null) ?? [])
      }

      if (isStaff) {
        const { data: companyRows } = await supabase
          .from('companies')
          .select('*')
          .eq('status', 'pending')
          .order('created_at', { ascending: true })

        if (active) {
          setPendingCompanies(companyRows ?? [])
        }
      }
    }

    void loadCompanies()

    return () => {
      active = false
    }
  }, [isDemo, isStaff, profile])

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateSocial(field: keyof SocialLinks, value: string) {
    setSocialLinks((current) => ({ ...current, [field]: value }))
  }

  function updateCompanyField(field: keyof CompanyForm, value: string) {
    setCompanyForm((current) => ({ ...current, [field]: value }))
  }

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!isSupabaseConfigured() || isDemo || !profile) {
      setMessage('Profil wurde in der lokalen Demo gespeichert.')
      setLoading(false)
      return
    }

    const now = new Date().toISOString()
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        ...form,
        bio: form.about,
        about: form.about,
        social_links: socialLinks,
        profile_completed_at: now,
        updated_at: now,
      })
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

  async function handleCompanySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCompanyLoading(true)
    setMessage(null)

    if (!profile) {
      setMessage('Dein Profil konnte noch nicht geladen werden.')
      setCompanyLoading(false)
      return
    }

    if (!companyForm.name.trim()) {
      setMessage('Bitte mindestens den Firmennamen ausfuellen.')
      setCompanyLoading(false)
      return
    }

    const companySlug = `${slugify(companyForm.name)}-${Date.now()}`

    if (!isSupabaseConfigured() || isDemo) {
      const nextCompany: Company = {
        id: crypto.randomUUID(),
        owner_id: profile.id,
        name: companyForm.name,
        slug: companySlug,
        website: companyForm.website || null,
        industry: companyForm.industry || null,
        country: companyForm.country || null,
        city: companyForm.city || null,
        address: companyForm.address || null,
        description: companyForm.description || null,
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
        rejection_reason: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setMemberships((current) => [
        {
          id: crypto.randomUUID(),
          company_id: nextCompany.id,
          profile_id: profile.id,
          role_title: companyForm.role_title || null,
          relationship_type: companyForm.relationship_type,
          status: 'pending',
          approved_by: null,
          approved_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          company: nextCompany,
        },
        ...current,
      ])
      setCompanyForm(emptyCompanyForm)
      setMessage('Firma wurde als Demo-Anfrage vorgemerkt.')
      setCompanyLoading(false)
      return
    }

    const supabase = createClient()
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        owner_id: profile.id,
        name: companyForm.name,
        slug: companySlug,
        website: companyForm.website || null,
        industry: companyForm.industry || null,
        country: companyForm.country || null,
        city: companyForm.city || null,
        address: companyForm.address || null,
        description: companyForm.description || null,
      })
      .select('*')
      .single()

    if (companyError || !company) {
      setMessage(companyError?.message ?? 'Firma konnte nicht registriert werden.')
      setCompanyLoading(false)
      return
    }

    const { data: membership, error: membershipError } = await supabase
      .from('company_memberships')
      .insert({
        company_id: company.id,
        profile_id: profile.id,
        role_title: companyForm.role_title || null,
        relationship_type: companyForm.relationship_type,
      })
      .select('*')
      .single()

    if (membershipError) {
      setMessage(membershipError.message)
      setCompanyLoading(false)
      return
    }

    setMemberships((current) => [{ ...membership, company }, ...current])
    setCompanyForm(emptyCompanyForm)
    setMessage('Firma wurde zur Freigabe eingereicht.')
    setCompanyLoading(false)
  }

  async function reviewCompany(company: Company, status: 'approved' | 'rejected') {
    if (!profile) {
      return
    }

    setModerationLoading(company.id)

    if (!isSupabaseConfigured() || isDemo) {
      setPendingCompanies((current) => current.filter((item) => item.id !== company.id))
      setModerationLoading(null)
      return
    }

    const supabase = createClient()
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('companies')
      .update({
        status,
        reviewed_by: profile.id,
        reviewed_at: now,
        updated_at: now,
      })
      .eq('id', company.id)

    if (!error && status === 'approved') {
      await supabase
        .from('company_memberships')
        .update({
          status: 'approved',
          approved_by: profile.id,
          approved_at: now,
          updated_at: now,
        })
        .eq('company_id', company.id)
    }

    setPendingCompanies((current) => current.filter((item) => item.id !== company.id))
    setModerationLoading(null)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <p className="text-sm uppercase tracking-[0.22em] text-primary">Account</p>
        <h2 className="font-display text-5xl leading-none">Profil</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          OAuth aktualisiert Twitch-Name und Avatar automatisch. Alle weiteren Angaben sind freiwillig und fuer Partnerarbeit gedacht.
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
              {isStaff ? (
                <Badge className="bg-primary text-primary-foreground">
                  <ShieldCheck className="size-3" />
                  {profile?.app_role === 'partner' ? 'Admin' : profile?.app_role}
                </Badge>
              ) : null}
              {profile?.is_partner ? <Badge variant="outline">Partner</Badge> : null}
              {approvedMembership?.company ? <Badge variant="outline">{approvedMembership.company.name}</Badge> : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">@{profile?.twitch_username ?? 'twitch'}</p>
            <p className="mt-1 text-sm text-muted-foreground">{profile?.twitch_email ?? 'Keine Twitch-E-Mail gespeichert'}</p>
          </div>
        </div>
      </section>

      {message ? (
        <p className="rounded-lg border border-border bg-secondary/60 p-3 text-sm text-muted-foreground">{message}</p>
      ) : null}

      <form onSubmit={handleProfileSubmit} className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <section className="portal-panel space-y-5 p-5">
          <div>
            <h3 className="text-xl font-semibold">Berufliche Angaben</h3>
            <p className="mt-1 text-sm text-muted-foreground">Hilft bei Briefings, Angeboten und Zuständigkeiten.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Position / Beschäftigung" id="employment_title">
              <Input id="employment_title" value={form.employment_title} onChange={(event) => updateField('employment_title', event.target.value)} placeholder="z.B. Partnership Manager" className="h-11 rounded-lg" />
            </Field>
            <Field label="Rolle im Betrieb" id="company_role">
              <Input id="company_role" value={form.company_role} onChange={(event) => updateField('company_role', event.target.value)} placeholder="z.B. Marketing, Einkauf, Creator" className="h-11 rounded-lg" />
            </Field>
            <Field label="Abteilung" id="department">
              <Input id="department" value={form.department} onChange={(event) => updateField('department', event.target.value)} placeholder="z.B. Brand Marketing" className="h-11 rounded-lg" />
            </Field>
            <Field label="Branche" id="industry">
              <Input id="industry" value={form.industry} onChange={(event) => updateField('industry', event.target.value)} placeholder="z.B. Gaming, Hardware, Agentur" className="h-11 rounded-lg" />
            </Field>
            <Field label="Land" id="country">
              <Input id="country" value={form.country} onChange={(event) => updateField('country', event.target.value)} placeholder="Deutschland" className="h-11 rounded-lg" />
            </Field>
            <Field label="Stadt / Region" id="city">
              <Input id="city" value={form.city} onChange={(event) => updateField('city', event.target.value)} placeholder="Berlin" className="h-11 rounded-lg" />
            </Field>
          </div>

          <Field label="Über mich" id="about">
            <Textarea id="about" value={form.about} onChange={(event) => updateField('about', event.target.value)} rows={7} placeholder="Kurz zu dir, deiner Firma, Interessen, Kampagnen-Schwerpunkten oder Kontaktpräferenzen..." className="rounded-lg" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sichtbarkeit" id="profile_visibility">
              <Select value={form.profile_visibility} onValueChange={(value) => updateField('profile_visibility', value)}>
                <SelectTrigger id="profile_visibility" className="h-11 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Nur Staff</SelectItem>
                  <SelectItem value="partners">Partner & Staff</SelectItem>
                  <SelectItem value="company">Nur Firma & Staff</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Bevorzugter Kontakt" id="preferred_contact_method">
              <Select value={form.preferred_contact_method} onValueChange={(value) => updateField('preferred_contact_method', value)}>
                <SelectTrigger id="preferred_contact_method" className="h-11 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">E-Mail</SelectItem>
                  <SelectItem value="mobile">Mobil</SelectItem>
                  <SelectItem value="phone">Telefon</SelectItem>
                  <SelectItem value="portal">Portal Chat</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </section>

        <section className="portal-panel space-y-5 p-5">
          <div>
            <h3 className="text-xl font-semibold">Kontakt & Socials</h3>
            <p className="mt-1 text-sm text-muted-foreground">Diese Daten sind freiwillig und bleiben im Partner-Portal.</p>
          </div>

          <div className="grid gap-4">
            <Field label="Kontakt-E-Mail" id="contact_email" icon={<Mail className="size-4" />}>
              <Input id="contact_email" type="email" value={form.contact_email} onChange={(event) => updateField('contact_email', event.target.value)} placeholder="name@firma.de" className="h-11 rounded-lg" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mobilfunknummer" id="mobile_phone" icon={<Phone className="size-4" />}>
                <Input id="mobile_phone" value={form.mobile_phone} onChange={(event) => updateField('mobile_phone', event.target.value)} placeholder="+49 ..." className="h-11 rounded-lg" />
              </Field>
              <Field label="Telefon" id="phone" icon={<Phone className="size-4" />}>
                <Input id="phone" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="+49 ..." className="h-11 rounded-lg" />
              </Field>
            </div>
            <Field label="Firmenwebseite" id="company_website" icon={<Globe2 className="size-4" />}>
              <Input id="company_website" value={form.company_website} onChange={(event) => updateField('company_website', event.target.value)} placeholder="https://firma.de" className="h-11 rounded-lg" />
            </Field>
            <Field label="Firmenadresse" id="company_address">
              <Textarea id="company_address" value={form.company_address} onChange={(event) => updateField('company_address', event.target.value)} rows={3} placeholder="Straße, PLZ, Ort" className="rounded-lg" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {Object.keys(emptySocialLinks).map((key) => (
              <Field key={key} label={key === 'x' ? 'X / Twitter' : key.charAt(0).toUpperCase() + key.slice(1)} id={`social_${key}`}>
                <Input
                  id={`social_${key}`}
                  value={socialLinks[key as keyof SocialLinks]}
                  onChange={(event) => updateSocial(key as keyof SocialLinks, event.target.value)}
                  placeholder="https://..."
                  className="h-11 rounded-lg"
                />
              </Field>
            ))}
          </div>

          <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Profil speichern
          </Button>
        </section>
      </form>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleCompanySubmit} className="portal-panel space-y-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground glow-orange">
              <Building2 className="size-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Unternehmen registrieren</h3>
              <p className="text-sm text-muted-foreground">Wird nach Prüfung durch Staff freigeschaltet.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Unternehmen" id="company_name">
              <Input id="company_name" value={companyForm.name} onChange={(event) => updateCompanyField('name', event.target.value)} required placeholder="Firmenname" className="h-11 rounded-lg" />
            </Field>
            <Field label="Deine Rolle dort" id="role_title">
              <Input id="role_title" value={companyForm.role_title} onChange={(event) => updateCompanyField('role_title', event.target.value)} placeholder="z.B. Head of Marketing" className="h-11 rounded-lg" />
            </Field>
            <Field label="Beziehung" id="relationship_type">
              <Select value={companyForm.relationship_type} onValueChange={(value) => updateCompanyField('relationship_type', value)}>
                <SelectTrigger id="relationship_type" className="h-11 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Mitarbeiter</SelectItem>
                  <SelectItem value="founder">Gründer / Owner</SelectItem>
                  <SelectItem value="agency">Agentur</SelectItem>
                  <SelectItem value="influencer">Influencer / Creator</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Webseite" id="company_form_website">
              <Input id="company_form_website" value={companyForm.website} onChange={(event) => updateCompanyField('website', event.target.value)} placeholder="https://firma.de" className="h-11 rounded-lg" />
            </Field>
            <Field label="Branche" id="company_form_industry">
              <Input id="company_form_industry" value={companyForm.industry} onChange={(event) => updateCompanyField('industry', event.target.value)} placeholder="Gaming, Hardware, Agentur..." className="h-11 rounded-lg" />
            </Field>
            <Field label="Land" id="company_form_country">
              <Input id="company_form_country" value={companyForm.country} onChange={(event) => updateCompanyField('country', event.target.value)} placeholder="Deutschland" className="h-11 rounded-lg" />
            </Field>
          </div>

          <Field label="Stadt" id="company_form_city">
            <Input id="company_form_city" value={companyForm.city} onChange={(event) => updateCompanyField('city', event.target.value)} placeholder="Berlin" className="h-11 rounded-lg" />
          </Field>
          <Field label="Adresse" id="company_form_address">
            <Textarea id="company_form_address" value={companyForm.address} onChange={(event) => updateCompanyField('address', event.target.value)} rows={3} placeholder="Optional" className="rounded-lg" />
          </Field>
          <Field label="Beschreibung" id="company_form_description">
            <Textarea id="company_form_description" value={companyForm.description} onChange={(event) => updateCompanyField('description', event.target.value)} rows={5} placeholder="Was macht das Unternehmen? Warum ist die Zuordnung korrekt?" className="rounded-lg" />
          </Field>

          <Button type="submit" disabled={companyLoading} className="h-11 w-full rounded-lg">
            {companyLoading ? <Loader2 className="size-4 animate-spin" /> : <Building2 className="size-4" />}
            Zur Freigabe einreichen
          </Button>
        </form>

        <div className="space-y-5">
          <section className="portal-panel p-5">
            <h3 className="text-xl font-semibold">Meine Unternehmen</h3>
            <div className="mt-4 space-y-3">
              {memberships.length > 0 ? (
                memberships.map((membership) => (
                  <CompanyMembershipCard key={membership.id} membership={membership} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Noch kein Unternehmen verknüpft.</p>
              )}
            </div>
          </section>

          {isStaff ? (
            <section className="portal-panel p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold">Staff Freigaben</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Offene Unternehmensregistrierungen.</p>
                </div>
                <Badge variant="outline">{pendingCompanies.length}</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {pendingCompanies.length > 0 ? (
                  pendingCompanies.map((company) => (
                    <div key={company.id} className="rounded-lg border border-border/80 bg-secondary/35 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="font-semibold">{company.name}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{company.industry || 'Keine Branche'} - {company.country || 'Kein Land'}</p>
                          {company.website ? <p className="mt-1 text-sm text-primary">{company.website}</p> : null}
                          {company.description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{company.description}</p> : null}
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" className="rounded-lg" disabled={moderationLoading === company.id} onClick={() => reviewCompany(company, 'approved')} aria-label="Firma freigeben">
                            {moderationLoading === company.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                          </Button>
                          <Button size="icon" variant="outline" className="rounded-lg" disabled={moderationLoading === company.id} onClick={() => reviewCompany(company, 'rejected')} aria-label="Firma ablehnen">
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Keine offenen Freigaben.</p>
                )}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function Field({
  id,
  label,
  icon,
  children,
}: {
  id: string
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  )
}

function CompanyMembershipCard({ membership }: { membership: MembershipWithCompany }) {
  const company = membership.company

  return (
    <div className="rounded-lg border border-border/80 bg-secondary/35 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="font-semibold">{company?.name ?? 'Unternehmen'}</h4>
        <Badge className={membership.status === 'approved' ? 'bg-primary text-primary-foreground' : ''}>
          {membership.status}
        </Badge>
        <Badge variant="outline">{membership.relationship_type}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {membership.role_title || 'Rolle nicht angegeben'}
        {company?.industry ? ` - ${company.industry}` : ''}
      </p>
      {company?.website ? <p className="mt-1 text-sm text-primary">{company.website}</p> : null}
    </div>
  )
}
