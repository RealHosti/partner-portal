'use client'

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  AtSign,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Globe2,
  Grid3X3,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { XAvatar, XPageHeader, XRightRail } from '@/components/dashboard/x-ui'
import { usePortalSession } from '@/hooks/use-auth-profile'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getProfileCompletion } from '@/lib/profile-completion'
import type { Database, Json } from '@/lib/database.types'
import type { Profile } from '@/lib/types'

type SocialKey = 'twitch' | 'instagram' | 'x' | 'linkedin' | 'youtube' | 'tiktok'

type ProfileFormState = {
  profile_visibility: string
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
  social_links: Record<SocialKey, string>
}

const socialKeys: SocialKey[] = ['twitch', 'instagram', 'x', 'linkedin', 'youtube', 'tiktok']

const emptySocialLinks: Record<SocialKey, string> = {
  twitch: '',
  instagram: '',
  x: '',
  linkedin: '',
  youtube: '',
  tiktok: '',
}

function readSocialLinks(value: Profile['social_links']): Record<SocialKey, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return emptySocialLinks
  }

  const source = value as Record<string, unknown>
  return socialKeys.reduce<Record<SocialKey, string>>((links, key) => {
    const item = source[key]
    links[key] = typeof item === 'string' ? item : ''
    return links
  }, { ...emptySocialLinks })
}

function buildForm(profile: Profile | null): ProfileFormState {
  return {
    profile_visibility: profile?.profile_visibility ?? 'partners',
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
    social_links: readSocialLinks(profile?.social_links ?? null),
  }
}

function nullable(value: string) {
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function cleanSocialLinks(links: Record<SocialKey, string>): Json {
  return socialKeys.reduce<Record<string, string>>((cleaned, key) => {
    const value = links[key].trim()
    if (value) {
      cleaned[key] = value
    }
    return cleaned
  }, {})
}

export default function ProfilePage() {
  const { profile, isDemo, refreshProfile } = usePortalSession()
  const [form, setForm] = useState<ProfileFormState>(() => buildForm(profile))
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(buildForm(profile))
  }, [profile])

  const displayName = profile?.twitch_display_name ?? 'Realhosti Partner'
  const handle = profile?.twitch_username ?? 'realhosti'

  const completionPreview = useMemo(() => {
    if (!profile) {
      return getProfileCompletion(null)
    }

    return getProfileCompletion({
      ...profile,
      ...form,
      social_links: form.social_links,
    })
  }, [form, profile])

  const visibleSocials = socialKeys.filter((key) => form.social_links[key].trim().length > 0)
  const location = [form.city, form.country].filter(Boolean).join(', ')
  const bio = form.about.trim() || 'Add a short bio so partners know who they are talking to.'

  const updateField = (field: keyof Omit<ProfileFormState, 'social_links'>, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const updateSocial = (field: SocialKey, value: string) => {
    setForm((current) => ({
      ...current,
      social_links: {
        ...current.social_links,
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setNotice(null)
    setError(null)

    if (!profile) {
      setError('Dein Profil konnte noch nicht geladen werden.')
      setSaving(false)
      return
    }

    if (!isSupabaseConfigured() || isDemo) {
      setNotice('Demo-Modus: Die Eingaben sind lokal sichtbar, werden aber nicht gespeichert.')
      setSaving(false)
      return
    }

    const payload: Database['public']['Tables']['profiles']['Update'] = {
      profile_visibility: form.profile_visibility,
      employment_title: nullable(form.employment_title),
      company_role: nullable(form.company_role),
      department: nullable(form.department),
      industry: nullable(form.industry),
      country: nullable(form.country),
      city: nullable(form.city),
      about: nullable(form.about),
      bio: nullable(form.about),
      contact_email: nullable(form.contact_email),
      mobile_phone: nullable(form.mobile_phone),
      phone: nullable(form.phone),
      company_website: nullable(form.company_website),
      company_address: nullable(form.company_address),
      preferred_contact_method: form.preferred_contact_method,
      social_links: cleanSocialLinks(form.social_links),
      profile_completed_at: completionPreview.percent >= 80 ? new Date().toISOString() : profile.profile_completed_at,
      updated_at: new Date().toISOString(),
    }

    const supabase = createClient()
    const { error: updateError } = await supabase.from('profiles').update(payload).eq('id', profile.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    await refreshProfile()
    setNotice('Profil gespeichert.')
    setSaving(false)
  }

  return (
    <div className="grid min-h-svh grid-cols-1 xl:grid-cols-[600px_380px]">
      <section className="min-w-0 border-x border-[#2f3336] bg-black">
        <XPageHeader
          title={displayName}
          subtitle={`@${handle}`}
          backHref="/dashboard"
          action={
            <Button
              form="profile-form"
              type="submit"
              disabled={saving}
              className="h-9 rounded-full bg-[#eff3f4] px-4 text-[15px] font-bold text-black hover:bg-[#d7dbdc]"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save
            </Button>
          }
        />

        <form id="profile-form" onSubmit={handleSubmit}>
          <section className="border-b border-[#2f3336] px-5 py-7 sm:px-8">
            <div className="grid gap-7 sm:grid-cols-[140px_minmax(0,1fr)]">
              <div className="flex justify-center sm:justify-start">
                <div className="rounded-full bg-gradient-to-tr from-[#ff7a00] via-[#ffb000] to-[#1d9bf0] p-1">
                  <div className="rounded-full bg-black p-1">
                    <XAvatar src={profile?.twitch_avatar_url} name={displayName} size="xl" />
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-2xl font-semibold text-[#e7e9ea]">{handle}</h1>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#2f3336] px-3 py-1 text-xs font-bold text-[#e7e9ea]">
                    <ShieldCheck className="size-4 text-[#1d9bf0]" />
                    {profile?.app_role ?? 'partner'}
                  </span>
                  <span className="rounded-full border border-[#2f3336] px-3 py-1 text-xs font-bold text-[#71767b]">
                    {form.profile_visibility}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4 text-center sm:max-w-md sm:text-left">
                  <ProfileStat value="12" label="posts" />
                  <ProfileStat value={`${completionPreview.percent}%`} label="complete" />
                  <ProfileStat value={String(visibleSocials.length)} label="links" />
                </div>

                <div className="mt-6 space-y-2 text-[15px] leading-5">
                  <p className="font-bold text-[#e7e9ea]">{displayName}</p>
                  <p className="text-[#e7e9ea]">{bio}</p>
                  {form.company_website ? (
                    <a href={form.company_website} className="inline-flex items-center gap-1 font-semibold text-[#1d9bf0]">
                      <Link2 className="size-4" />
                      {form.company_website}
                    </a>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {form.employment_title ? <ProfileChip icon={<BriefcaseBusiness className="size-4" />} label={form.employment_title} /> : null}
                  {form.company_role ? <ProfileChip icon={<Building2 className="size-4" />} label={form.company_role} /> : null}
                  {location ? <ProfileChip icon={<MapPin className="size-4" />} label={location} /> : null}
                  <ProfileChip icon={<AtSign className="size-4" />} label={profile?.twitch_email ?? 'OAuth connected'} />
                </div>
              </div>
            </div>
          </section>

          <section className="grid h-14 grid-cols-3 border-b border-[#2f3336] text-[13px] font-bold uppercase tracking-[0.14em] text-[#71767b]">
            <button type="button" className="relative flex items-center justify-center gap-2 text-[#e7e9ea]">
              <Grid3X3 className="size-4" />
              Profile
              <span className="absolute bottom-0 h-1 w-16 rounded-full bg-[#1d9bf0]" />
            </button>
            <button type="button" className="flex items-center justify-center gap-2 transition hover:bg-[#080808]">
              <Building2 className="size-4" />
              Company
            </button>
            <button type="button" className="flex items-center justify-center gap-2 transition hover:bg-[#080808]">
              <Mail className="size-4" />
              Contact
            </button>
          </section>

          <section className="grid grid-cols-3 gap-px border-b border-[#2f3336] bg-[#2f3336]">
            <ProfileTile title="Completion" value={`${completionPreview.percent}%`} detail="Partner readiness" />
            <ProfileTile title="Company" value={form.employment_title || 'Open'} detail={form.company_role || 'No role yet'} />
            <ProfileTile title="Contact" value={form.preferred_contact_method || 'Portal'} detail={form.contact_email || 'No email'} />
          </section>

          <section className="border-b border-[#2f3336] px-5 py-5 sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#e7e9ea]">Profile setup</h2>
                <p className="mt-1 text-[15px] leading-5 text-[#71767b]">
                  Keep it short, useful and partner-friendly.
                </p>
              </div>
              {completionPreview.percent >= 80 ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="size-4" />
                  Ready
                </span>
              ) : null}
            </div>
            <Progress value={completionPreview.percent} className="mt-4 h-2 bg-[#16181c] [&>div]:bg-[#1d9bf0]" />
          </section>

          <EditSection icon={<Settings className="size-5" />} title="Edit public profile">
            <Field label="Visibility" htmlFor="profile_visibility">
              <Select value={form.profile_visibility} onValueChange={(value) => updateField('profile_visibility', value)}>
                <SelectTrigger id="profile_visibility" className={selectTriggerClass}>
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="partners">Partners only</SelectItem>
                  <SelectItem value="staff">Staff only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="About me" htmlFor="about" wide>
              <Textarea
                id="about"
                value={form.about}
                onChange={(event) => updateField('about', event.target.value)}
                rows={4}
                placeholder="Short context: who you are, what you do, and what partners should know before writing you."
                className={textareaClass}
              />
            </Field>
          </EditSection>

          <EditSection icon={<BriefcaseBusiness className="size-5" />} title="Company">
            <Field label="Company / employment" htmlFor="employment_title">
              <Input id="employment_title" value={form.employment_title} onChange={(event) => updateField('employment_title', event.target.value)} placeholder="e.g. Realhosti Media" className={inputClass} />
            </Field>
            <Field label="Role in company" htmlFor="company_role">
              <Input id="company_role" value={form.company_role} onChange={(event) => updateField('company_role', event.target.value)} placeholder="e.g. Founder, Marketing, Creator" className={inputClass} />
            </Field>
            <Field label="Department" htmlFor="department">
              <Input id="department" value={form.department} onChange={(event) => updateField('department', event.target.value)} placeholder="e.g. Partnerships" className={inputClass} />
            </Field>
            <Field label="Industry" htmlFor="industry">
              <Input id="industry" value={form.industry} onChange={(event) => updateField('industry', event.target.value)} placeholder="e.g. Gaming & Streaming" className={inputClass} />
            </Field>
            <Field label="Country" htmlFor="country">
              <Input id="country" value={form.country} onChange={(event) => updateField('country', event.target.value)} placeholder="Germany" className={inputClass} />
            </Field>
            <Field label="City" htmlFor="city">
              <Input id="city" value={form.city} onChange={(event) => updateField('city', event.target.value)} placeholder="Berlin" className={inputClass} />
            </Field>
            <Field label="Company website" htmlFor="company_website">
              <Input id="company_website" value={form.company_website} onChange={(event) => updateField('company_website', event.target.value)} placeholder="https://example.com" className={inputClass} />
            </Field>
            <Field label="Company address" htmlFor="company_address">
              <Input id="company_address" value={form.company_address} onChange={(event) => updateField('company_address', event.target.value)} placeholder="Street, ZIP, city" className={inputClass} />
            </Field>
          </EditSection>

          <EditSection icon={<Phone className="size-5" />} title="Contact">
            <Field label="Preferred contact" htmlFor="preferred_contact_method">
              <Select value={form.preferred_contact_method} onValueChange={(value) => updateField('preferred_contact_method', value)}>
                <SelectTrigger id="preferred_contact_method" className={selectTriggerClass}>
                  <SelectValue placeholder="Preferred contact" />
                </SelectTrigger>
                <SelectContent className={selectContentClass}>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="portal">Portal messages</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Contact email" htmlFor="contact_email">
              <Input id="contact_email" type="email" value={form.contact_email} onChange={(event) => updateField('contact_email', event.target.value)} placeholder="mail@example.com" className={inputClass} />
            </Field>
            <Field label="Mobile phone" htmlFor="mobile_phone">
              <Input id="mobile_phone" value={form.mobile_phone} onChange={(event) => updateField('mobile_phone', event.target.value)} placeholder="+49 ..." className={inputClass} />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <Input id="phone" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="+49 ..." className={inputClass} />
            </Field>
          </EditSection>

          <EditSection icon={<Globe2 className="size-5" />} title="Social links">
            {socialKeys.map((key) => (
              <Field key={key} label={socialLabel[key]} htmlFor={`social_${key}`}>
                <Input id={`social_${key}`} value={form.social_links[key]} onChange={(event) => updateSocial(key, event.target.value)} placeholder={socialPlaceholder[key]} className={inputClass} />
              </Field>
            ))}
          </EditSection>

          {notice ? <StatusMessage tone="success" message={notice} /> : null}
          {error ? <StatusMessage tone="error" message={error} /> : null}
        </form>
      </section>

      <XRightRail mode="profile" />
    </div>
  )
}

const inputClass =
  'h-11 rounded-xl border-[#2f3336] bg-black text-[#e7e9ea] placeholder:text-[#71767b] focus-visible:ring-[#1d9bf0]'

const textareaClass =
  'rounded-xl border-[#2f3336] bg-black text-[#e7e9ea] placeholder:text-[#71767b] focus-visible:ring-[#1d9bf0]'

const selectTriggerClass =
  'h-11 w-full rounded-xl border-[#2f3336] bg-black text-[#e7e9ea] focus:ring-[#1d9bf0]'

const selectContentClass = 'border-[#2f3336] bg-black text-[#e7e9ea]'

const socialLabel: Record<SocialKey, string> = {
  twitch: 'Twitch',
  instagram: 'Instagram',
  x: 'X / Twitter',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
}

const socialPlaceholder: Record<SocialKey, string> = {
  twitch: 'https://twitch.tv/name',
  instagram: 'https://instagram.com/name',
  x: 'https://x.com/name',
  linkedin: 'https://linkedin.com/in/name',
  youtube: 'https://youtube.com/@name',
  tiktok: 'https://tiktok.com/@name',
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-[17px] font-extrabold text-[#e7e9ea]">{value}</p>
      <p className="text-sm text-[#71767b]">{label}</p>
    </div>
  )
}

function ProfileChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#2f3336] bg-[#050505] px-3 py-1.5 text-sm font-semibold text-[#e7e9ea]">
      {icon}
      <span className="truncate">{label}</span>
    </span>
  )
}

function ProfileTile({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="min-h-28 bg-black p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#71767b]">{title}</p>
      <p className="mt-2 truncate text-xl font-extrabold text-[#e7e9ea]">{value}</p>
      <p className="mt-1 line-clamp-2 text-sm text-[#71767b]">{detail}</p>
    </div>
  )
}

function EditSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="border-b border-[#2f3336] px-5 py-6 sm:px-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#2f3336] bg-[#16181c] text-[#1d9bf0]">
          {icon}
        </div>
        <h2 className="text-xl font-extrabold text-[#e7e9ea]">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function Field({
  label,
  htmlFor,
  wide = false,
  children,
}: {
  label: string
  htmlFor: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div className={wide ? 'space-y-2 sm:col-span-2' : 'space-y-2'}>
      <Label htmlFor={htmlFor} className="text-[13px] font-bold text-[#e7e9ea]">
        {label}
      </Label>
      {children}
    </div>
  )
}

function StatusMessage({ tone, message }: { tone: 'success' | 'error'; message: string }) {
  const success = tone === 'success'
  return (
    <div
      className={
        success
          ? 'mx-5 my-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 sm:mx-8'
          : 'mx-5 my-5 rounded-2xl border border-[#f4212e]/40 bg-[#f4212e]/10 px-4 py-3 text-sm font-semibold text-[#ff818a] sm:mx-8'
      }
    >
      {message}
    </div>
  )
}
