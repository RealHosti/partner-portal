'use client'

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import Image from 'next/image'
import {
  AtSign,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Globe2,
  Loader2,
  Mail,
  Save,
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

  const missingLabels = completionPreview.missing.slice(0, 4).map((item) => item.label)

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
          title="Profile"
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
          <section className="border-b border-[#2f3336]">
            <div className="relative h-[188px] overflow-hidden bg-[#16181c]">
              <Image src="/images/banner.png" alt="Profile header" fill className="object-cover" priority />
            </div>

            <div className="px-4 pb-5">
              <div className="-mt-16 flex items-end justify-between">
                <div className="rounded-full border-4 border-black bg-black">
                  <XAvatar src={profile?.twitch_avatar_url} name={displayName} size="xl" />
                </div>
                <div className="mb-3 rounded-full border border-[#2f3336] px-3 py-1.5 text-xs font-semibold text-[#71767b]">
                  Twitch Avatar sync
                </div>
              </div>

              <div className="mt-4">
                <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-[#e7e9ea]">{displayName}</h1>
                <p className="text-[15px] text-[#71767b]">@{handle}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-[14px] text-[#71767b]">
                  <InfoPill icon={<ShieldCheck className="size-4" />} label={profile?.app_role ?? 'partner'} />
                  <InfoPill icon={<CalendarDays className="size-4" />} label="Joined May 2020" />
                  <InfoPill icon={<AtSign className="size-4" />} label={profile?.twitch_email ?? 'OAuth connected'} />
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-[#2f3336] px-4 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#e7e9ea]">Profile completion</h2>
                <p className="mt-1 text-[15px] leading-5 text-[#71767b]">
                  Fill the fields partners need before they contact you.
                </p>
              </div>
              <span className="text-2xl font-extrabold text-[#e7e9ea]">{completionPreview.percent}%</span>
            </div>
            <Progress value={completionPreview.percent} className="mt-4 h-2 bg-[#16181c] [&>div]:bg-[#1d9bf0]" />
            {missingLabels.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {missingLabels.map((label) => (
                  <span key={label} className="rounded-full border border-[#2f3336] px-3 py-1 text-xs font-semibold text-[#71767b]">
                    Missing: {label}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <CheckCircle2 className="size-4" />
                Ready for partner conversations.
              </div>
            )}
          </section>

          <FormSection
            icon={<UserRound className="size-5" />}
            title="Public profile"
            description="This is what partners see first when they open your profile."
          >
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
                rows={5}
                placeholder="Short context: who you are, what you do, and what partners should know before writing you."
                className={textareaClass}
              />
            </Field>
          </FormSection>

          <FormSection
            icon={<BriefcaseBusiness className="size-5" />}
            title="Company and role"
            description="Your function, branch, location and company context."
          >
            <Field label="Company / employment" htmlFor="employment_title">
              <Input
                id="employment_title"
                value={form.employment_title}
                onChange={(event) => updateField('employment_title', event.target.value)}
                placeholder="e.g. Realhosti Media"
                className={inputClass}
              />
            </Field>
            <Field label="Role in company" htmlFor="company_role">
              <Input
                id="company_role"
                value={form.company_role}
                onChange={(event) => updateField('company_role', event.target.value)}
                placeholder="e.g. Founder, Marketing, Creator"
                className={inputClass}
              />
            </Field>
            <Field label="Department" htmlFor="department">
              <Input
                id="department"
                value={form.department}
                onChange={(event) => updateField('department', event.target.value)}
                placeholder="e.g. Partnerships"
                className={inputClass}
              />
            </Field>
            <Field label="Industry" htmlFor="industry">
              <Input
                id="industry"
                value={form.industry}
                onChange={(event) => updateField('industry', event.target.value)}
                placeholder="e.g. Gaming & Streaming"
                className={inputClass}
              />
            </Field>
            <Field label="Country" htmlFor="country">
              <Input
                id="country"
                value={form.country}
                onChange={(event) => updateField('country', event.target.value)}
                placeholder="Germany"
                className={inputClass}
              />
            </Field>
            <Field label="City" htmlFor="city">
              <Input
                id="city"
                value={form.city}
                onChange={(event) => updateField('city', event.target.value)}
                placeholder="Berlin"
                className={inputClass}
              />
            </Field>
            <Field label="Company website" htmlFor="company_website">
              <Input
                id="company_website"
                value={form.company_website}
                onChange={(event) => updateField('company_website', event.target.value)}
                placeholder="https://example.com"
                className={inputClass}
              />
            </Field>
            <Field label="Company address" htmlFor="company_address">
              <Input
                id="company_address"
                value={form.company_address}
                onChange={(event) => updateField('company_address', event.target.value)}
                placeholder="Street, ZIP, city"
                className={inputClass}
              />
            </Field>
          </FormSection>

          <FormSection
            icon={<Mail className="size-5" />}
            title="Contact details"
            description="Choose how partners should reach you outside public threads."
          >
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
              <Input
                id="contact_email"
                type="email"
                value={form.contact_email}
                onChange={(event) => updateField('contact_email', event.target.value)}
                placeholder="mail@example.com"
                className={inputClass}
              />
            </Field>
            <Field label="Mobile phone" htmlFor="mobile_phone">
              <Input
                id="mobile_phone"
                value={form.mobile_phone}
                onChange={(event) => updateField('mobile_phone', event.target.value)}
                placeholder="+49 ..."
                className={inputClass}
              />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="+49 ..."
                className={inputClass}
              />
            </Field>
          </FormSection>

          <FormSection
            icon={<Globe2 className="size-5" />}
            title="Social links"
            description="Add only channels partners should actually use."
          >
            {socialKeys.map((key) => (
              <Field key={key} label={socialLabel[key]} htmlFor={`social_${key}`}>
                <Input
                  id={`social_${key}`}
                  value={form.social_links[key]}
                  onChange={(event) => updateSocial(key, event.target.value)}
                  placeholder={socialPlaceholder[key]}
                  className={inputClass}
                />
              </Field>
            ))}
          </FormSection>

          {notice ? (
            <StatusMessage tone="success" message={notice} />
          ) : null}
          {error ? (
            <StatusMessage tone="error" message={error} />
          ) : null}
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

function FormSection({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="border-b border-[#2f3336] px-4 py-5">
      <div className="mb-5 flex gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#2f3336] bg-[#16181c] text-[#1d9bf0]">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#e7e9ea]">{title}</h2>
          <p className="mt-1 text-[15px] leading-5 text-[#71767b]">{description}</p>
        </div>
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

function InfoPill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#2f3336] px-3 py-1">
      {icon}
      <span className="truncate">{label}</span>
    </span>
  )
}

function StatusMessage({ tone, message }: { tone: 'success' | 'error'; message: string }) {
  const success = tone === 'success'
  return (
    <div
      className={
        success
          ? 'mx-4 my-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300'
          : 'mx-4 my-5 rounded-2xl border border-[#f4212e]/40 bg-[#f4212e]/10 px-4 py-3 text-sm font-semibold text-[#ff818a]'
      }
    >
      {message}
    </div>
  )
}
