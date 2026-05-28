'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  ExternalLink,
  Filter,
  Globe2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Send,
  Share2,
  Sparkles,
  Star,
  UsersRound,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getProfileCompletion } from '@/lib/profile-completion'
import type { Company, Profile } from '@/lib/types'
import { usePortalSession } from '@/hooks/use-auth-profile'

type SocialLinks = {
  twitch?: string
  instagram?: string
  x?: string
  linkedin?: string
  youtube?: string
  tiktok?: string
  website?: string
}

type CompanyPreview = Pick<Company, 'id' | 'name' | 'website' | 'industry' | 'country' | 'city' | 'address' | 'status'>

type MembershipPreview = {
  profile_id: string
  role_title: string | null
  relationship_type: string | null
  status: string
  company: CompanyPreview | null
}

type PartnerContact = {
  id: string
  displayName: string
  handle: string
  initials: string
  avatarUrl: string | null
  title: string
  role: string
  companyName: string
  company: CompanyPreview | null
  industry: string
  country: string
  city: string
  about: string
  contactEmail: string
  mobilePhone: string
  phone: string
  website: string
  address: string
  socialLinks: SocialLinks
  updatedAt: string
  relationshipType: string
  profileCompletion: number
  context: string
}

const demoContacts: PartnerContact[] = [
  {
    id: 'demo-contact-zoe',
    displayName: 'Zoe Huang',
    handle: 'zoe_huang',
    initials: 'ZH',
    avatarUrl: null,
    title: 'Sales Representative',
    role: 'Brand Partnerships',
    companyName: 'HOLLYLAND',
    company: {
      id: 'demo-company-hollyland',
      name: 'HOLLYLAND',
      website: 'https://www.hollyland.com',
      industry: 'Streaming Hardware',
      country: 'Deutschland',
      city: 'Berlin',
      address: 'Messedamm 22, 14055 Berlin',
      status: 'approved',
    },
    industry: 'Streaming Hardware',
    country: 'Deutschland',
    city: 'Berlin',
    about: 'Interessiert an Creator Placements rund um Audio, Funkstrecken und mobile Streaming Setups.',
    contactEmail: 'zoe.huang@hollyland.example',
    mobilePhone: '+49 151 00000001',
    phone: '',
    website: 'https://www.hollyland.com',
    address: 'Messedamm 22, 14055 Berlin',
    socialLinks: {
      twitch: '',
      instagram: 'https://instagram.com/hollyland',
      linkedin: 'https://linkedin.com/company/hollyland',
      website: 'https://www.hollyland.com',
    },
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    relationshipType: 'employee',
    profileCompletion: 89,
    context: 'Gescannt auf der gamescom-inspirierten Kontaktstrecke. Follow-up: Kurzbriefing zu Q3 Streaming Hardware.',
  },
  {
    id: 'demo-contact-elyas',
    displayName: 'Elyas Fehri',
    handle: 'elyas_creator',
    initials: 'EF',
    avatarUrl: null,
    title: 'Social Content Creator',
    role: 'Creator',
    companyName: 'Nitrodo',
    company: {
      id: 'demo-company-nitrodo',
      name: 'Nitrodo',
      website: 'https://nitrodo.example',
      industry: 'Gaming',
      country: 'Deutschland',
      city: 'Koeln',
      address: null,
      status: 'approved',
    },
    industry: 'Gaming',
    country: 'Deutschland',
    city: 'Koeln',
    about: 'Creator-Kontakt fuer gemeinsame Social Clips, Giveaways und Community Aktivierungen.',
    contactEmail: 'elyas@nitrodo.example',
    mobilePhone: '',
    phone: '',
    website: 'https://nitrodo.example',
    address: '',
    socialLinks: {
      twitch: 'https://twitch.tv/elyas_creator',
      instagram: 'https://instagram.com/elyas_creator',
      youtube: 'https://youtube.com/@elyas_creator',
    },
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    relationshipType: 'influencer',
    profileCompletion: 74,
    context: 'Passt fuer Co-Streams, UGC und kurze Reactions. Noch offen: Reichweitenpaket und Timing.',
  },
  {
    id: 'demo-contact-manmohen',
    displayName: 'Manmohen Singh',
    handle: 'manmohen_singh',
    initials: 'MS',
    avatarUrl: null,
    title: 'Key Account Manager',
    role: 'Sales',
    companyName: 'Gcore',
    company: {
      id: 'demo-company-gcore',
      name: 'Gcore',
      website: 'https://gcore.example',
      industry: 'Infrastructure',
      country: 'Deutschland',
      city: 'Wedemark',
      address: 'Bussardweg 30900 Wedemark',
      status: 'approved',
    },
    industry: 'Infrastructure',
    country: 'Deutschland',
    city: 'Wedemark',
    about: 'Kontakt fuer CDN, Hosting, Game Server und technische Kampagnen mit B2B Fokus.',
    contactEmail: 'manmohen.singh@gcore.example',
    mobilePhone: '+49 1516 7048081',
    phone: '',
    website: 'https://www.gcore.example',
    address: 'Bussardweg 30900 Wedemark',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/manmohen-singh',
      website: 'https://www.gcore.example',
    },
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    relationshipType: 'employee',
    profileCompletion: 92,
    context: 'Technisches Sponsoring denkbar. Naechster Schritt: Use Case fuer Stream- und Server-Setup sammeln.',
  },
  {
    id: 'demo-contact-christian',
    displayName: 'Christian Bordt',
    handle: 'christian_media',
    initials: 'CB',
    avatarUrl: null,
    title: 'Entertainment / Film',
    role: 'Management',
    companyName: 'Christienco Medien',
    company: {
      id: 'demo-company-christienco',
      name: 'Christienco Medien',
      website: 'https://christienco.example',
      industry: 'Media',
      country: 'Deutschland',
      city: 'Obersulm',
      address: 'Eichelbergstrasse 74182 Obersulm',
      status: 'approved',
    },
    industry: 'Media',
    country: 'Deutschland',
    city: 'Obersulm',
    about: 'Medienkontakt fuer Cross-Promotion, Video-Assets und Kampagnenabwicklung.',
    contactEmail: 'christian.management@christienco.example',
    mobilePhone: '+07130 4026287',
    phone: '',
    website: 'https://www.christienco.example',
    address: 'Eichelbergstrasse 74182 Obersulm',
    socialLinks: {
      x: 'https://x.com/christienco',
      facebook: 'https://facebook.com/christienco',
      youtube: 'https://youtube.com/@christienco',
      instagram: 'https://instagram.com/christienco',
    } as SocialLinks,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    relationshipType: 'agency',
    profileCompletion: 81,
    context: 'Geeignet fuer Asset-Produktion und begleitende Clips. Kontakt kam ueber gemeinsame Branchenliste.',
  },
]

function toText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.charAt(0) ?? 'P'
  const second = parts[1]?.charAt(0) ?? ''
  return `${first}${second}`.toUpperCase()
}

function getSocialLinks(profile: Profile): SocialLinks {
  const links = profile.social_links && typeof profile.social_links === 'object' && !Array.isArray(profile.social_links)
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

function getCompanyName(profile: Profile, membership?: MembershipPreview) {
  if (membership?.company?.name) {
    return membership.company.name
  }

  if (profile.company_website) {
    try {
      return new URL(profile.company_website).hostname.replace(/^www\./, '')
    } catch {
      return profile.company_website
    }
  }

  return profile.company_role || 'Eigenstaendig'
}

function mapProfileToContact(profile: Profile, membership?: MembershipPreview): PartnerContact {
  const displayName = profile.twitch_display_name || profile.twitch_username || 'Partner'
  const company = membership?.company ?? null

  return {
    id: profile.id,
    displayName,
    handle: profile.twitch_username || 'partner',
    initials: getInitials(displayName),
    avatarUrl: profile.twitch_avatar_url,
    title: profile.employment_title || membership?.role_title || 'Partner Kontakt',
    role: profile.company_role || profile.department || membership?.relationship_type || 'Partner',
    companyName: getCompanyName(profile, membership),
    company,
    industry: profile.industry || company?.industry || 'Keine Branche',
    country: profile.country || company?.country || 'Kein Land',
    city: profile.city || company?.city || '',
    about: profile.about || profile.bio || 'Noch keine Beschreibung hinterlegt.',
    contactEmail: profile.contact_email || profile.twitch_email || '',
    mobilePhone: profile.mobile_phone || '',
    phone: profile.phone || '',
    website: profile.company_website || company?.website || '',
    address: profile.company_address || company?.address || '',
    socialLinks: getSocialLinks(profile),
    updatedAt: profile.updated_at,
    relationshipType: membership?.relationship_type || 'partner',
    profileCompletion: getProfileCompletion(profile).percent,
    context: 'Kontakt aus dem Realhosti Partner Portal. Details, Firma und Kontaktwege werden aus dem Profil gezogen.',
  }
}

function getLeadScore(contact: PartnerContact) {
  const signals = [
    contact.contactEmail,
    contact.website,
    contact.about,
    contact.companyName,
    contact.industry,
    contact.country,
  ].filter(Boolean).length

  return Math.min(100, Math.round((contact.profileCompletion * 0.6) + (signals / 6) * 40))
}

export default function ContactsPage() {
  const { profile, isDemo } = usePortalSession()
  const [contacts, setContacts] = useState<PartnerContact[]>(demoContacts)
  const [selectedContactId, setSelectedContactId] = useState<string>(demoContacts[0]?.id ?? '')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'company' | 'creator' | 'staff'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadContacts() {
      if (!isSupabaseConfigured() || isDemo || !profile) {
        setContacts(demoContacts)
        setSelectedContactId((current) => current || demoContacts[0]?.id || '')
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', profile.id)
        .order('updated_at', { ascending: false })

      const { data: membershipRows } = await supabase
        .from('company_memberships')
        .select('profile_id,role_title,relationship_type,status,company:companies(id,name,website,industry,country,city,address,status)')
        .eq('status', 'approved')

      if (!active) {
        return
      }

      const memberships = ((membershipRows ?? []) as unknown as MembershipPreview[]).filter((membership) => membership.company)
      const membershipByProfile = new Map(memberships.map((membership) => [membership.profile_id, membership]))
      const nextContacts = (profileRows ?? []).map((row) => mapProfileToContact(row, membershipByProfile.get(row.id)))

      setContacts(nextContacts.length ? nextContacts : demoContacts)
      setSelectedContactId(nextContacts[0]?.id ?? demoContacts[0]?.id ?? '')
      setLoading(false)
    }

    void loadContacts()

    return () => {
      active = false
    }
  }, [isDemo, profile])

  const filteredContacts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return contacts.filter((contact) => {
      const haystack = [
        contact.displayName,
        contact.handle,
        contact.title,
        contact.role,
        contact.companyName,
        contact.industry,
        contact.country,
        contact.city,
      ].join(' ').toLowerCase()

      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery)
      const matchesFilter =
        filter === 'all'
        || (filter === 'company' && ['employee', 'agency', 'founder'].includes(contact.relationshipType))
        || (filter === 'creator' && ['influencer', 'freelancer'].includes(contact.relationshipType))
        || (filter === 'staff' && contact.role.toLowerCase().includes('staff'))

      return matchesQuery && matchesFilter
    })
  }, [contacts, filter, query])

  useEffect(() => {
    if (!filteredContacts.some((contact) => contact.id === selectedContactId)) {
      setSelectedContactId(filteredContacts[0]?.id ?? '')
    }
  }, [filteredContacts, selectedContactId])

  const selectedContact = filteredContacts.find((contact) => contact.id === selectedContactId) ?? filteredContacts[0]
  const savedContacts = contacts.slice(0, 3)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-primary">Partner Directory</p>
          <h2 className="font-display text-5xl leading-none sm:text-6xl">Kontakte</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Desktop-Version der App-Kontakte: suchen, qualifizieren, Kontext merken und direkt in die Inbox springen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="h-11 rounded-lg">
            <Link href="/dashboard/messages/new">
              <Send className="size-4" />
              Nachricht
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-lg">
            <Link href="/dashboard/settings">
              <CircleUserRound className="size-4" />
              Profil pflegen
            </Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-5">
          <section className="portal-panel overflow-hidden p-0">
            <div className="border-b border-border/70 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name, Firma, Branche suchen"
                  className="h-11 rounded-lg border-border/80 bg-background/70 pl-9"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="Alle" />
                <FilterButton active={filter === 'company'} onClick={() => setFilter('company')} label="Firmen" />
                <FilterButton active={filter === 'creator'} onClick={() => setFilter('creator')} label="Creator" />
                <FilterButton active={filter === 'staff'} onClick={() => setFilter('staff')} label="Staff" />
              </div>
            </div>

            <div className="max-h-[650px] divide-y divide-border/65 overflow-y-auto">
              {loading ? (
                <div className="p-5 text-sm text-muted-foreground">Kontakte werden geladen.</div>
              ) : filteredContacts.length ? (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setSelectedContactId(contact.id)}
                    className={`flex w-full gap-3 p-4 text-left transition ${
                      selectedContact?.id === contact.id ? 'bg-primary/15' : 'hover:bg-secondary/45'
                    }`}
                  >
                    <ContactAvatar contact={contact} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{contact.displayName}</p>
                          <p className="truncate text-xs text-muted-foreground">@{contact.handle}</p>
                        </div>
                        <Badge variant="outline" className="shrink-0 border-primary/45 text-primary">
                          {getLeadScore(contact)}%
                        </Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
                        {contact.title} bei {contact.companyName}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <MiniMeta icon={<BriefcaseBusiness className="size-3" />} label={contact.industry} />
                        <MiniMeta icon={<MapPin className="size-3" />} label={contact.country} />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-6 text-center">
                  <UsersRound className="mx-auto mb-3 size-9 text-primary" />
                  <p className="font-semibold">Keine Kontakte gefunden</p>
                  <p className="mt-1 text-sm text-muted-foreground">Passe Suche oder Filter an.</p>
                </div>
              )}
            </div>
          </section>

          <section className="portal-panel p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">Merkliste</p>
                <h3 className="mt-1 font-semibold">Wichtige Follow-ups</h3>
              </div>
              <Bookmark className="size-5 text-primary" />
            </div>
            <div className="mt-4 space-y-3">
              {savedContacts.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => setSelectedContactId(contact.id)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border/70 bg-secondary/30 p-3 text-left transition hover:border-primary/60"
                >
                  <ContactAvatar contact={contact} compact />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{contact.displayName}</p>
                    <p className="truncate text-xs text-muted-foreground">{contact.companyName}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </section>
        </div>

        {selectedContact ? <ContactDetail contact={selectedContact} /> : null}
      </section>
    </div>
  )
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border/80 bg-secondary/35 text-muted-foreground hover:text-foreground'
      }`}
    >
      <Filter className="size-3.5" />
      {label}
    </button>
  )
}

function ContactAvatar({ contact, compact = false }: { contact: PartnerContact; compact?: boolean }) {
  const size = compact ? 'size-10' : 'size-12'

  if (contact.avatarUrl) {
    return (
      <img
        src={contact.avatarUrl}
        alt={contact.displayName}
        className={`${size} shrink-0 rounded-lg border border-primary/50 object-cover`}
      />
    )
  }

  return (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-lg border border-primary/45 bg-primary/15 font-semibold text-primary`}>
      {contact.initials}
    </div>
  )
}

function MiniMeta({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-border/70 bg-background/45 px-2 py-1 text-[11px] text-muted-foreground">
      {icon}
      <span className="truncate">{label}</span>
    </span>
  )
}

function ContactDetail({ contact }: { contact: PartnerContact }) {
  const leadScore = getLeadScore(contact)
  const socialEntries = Object.entries(contact.socialLinks).filter(([, value]) => value)

  return (
    <section className="portal-panel overflow-hidden p-0">
      <div className="border-b border-border/70 bg-secondary/20 p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <ContactAvatar contact={contact} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-semibold">{contact.displayName}</h3>
                <Badge className="bg-primary text-primary-foreground">
                  <CheckCircle2 className="size-3" />
                  verbunden
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {contact.title} · {contact.companyName}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <MiniMeta icon={<BriefcaseBusiness className="size-3" />} label={contact.industry} />
                <MiniMeta icon={<MapPin className="size-3" />} label={[contact.city, contact.country].filter(Boolean).join(', ')} />
                <MiniMeta icon={<Sparkles className="size-3" />} label={`${contact.profileCompletion}% Profil`} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild className="h-10 rounded-lg">
              <Link href={`/dashboard/messages/new?recipient=${contact.id}`}>
                <MessageSquare className="size-4" />
                Nachricht
              </Link>
            </Button>
            <Button variant="outline" className="h-10 rounded-lg">
              <Bookmark className="size-4" />
              Merken
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="rounded-lg border border-border/75 bg-secondary/25 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">Lead-Qualifizierung</p>
                <h4 className="mt-1 text-lg font-semibold">Prioritaet fuer Follow-up</h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Bewertet aus Profilstaerke, Kontaktwegen und Business-Kontext.
                </p>
              </div>
              <div className="min-w-40">
                <p className="font-display text-5xl leading-none text-primary">{leadScore}%</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${leadScore}%` }} />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border/75 bg-secondary/25 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Kontext</p>
            <h4 className="mt-1 text-lg font-semibold">Warum dieser Kontakt wichtig ist</h4>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{contact.context}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <ContextTile icon={<CalendarClock className="size-4" />} label="Follow-up" value="Diese Woche" />
              <ContextTile icon={<Star className="size-4" />} label="Interesse" value={leadScore > 84 ? 'hoch' : 'mittel'} />
              <ContextTile icon={<UsersRound className="size-4" />} label="Typ" value={contact.relationshipType} />
            </div>
          </section>

          <section className="rounded-lg border border-border/75 bg-secondary/25 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Ueber den Kontakt</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{contact.about}</p>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-border/75 bg-secondary/25 p-4">
            <h4 className="font-semibold">Kontaktdetails</h4>
            <div className="mt-4 space-y-3 text-sm">
              <DetailRow icon={<Mail className="size-4" />} value={contact.contactEmail || 'Keine E-Mail'} href={contact.contactEmail ? `mailto:${contact.contactEmail}` : undefined} />
              <DetailRow icon={<Phone className="size-4" />} value={contact.mobilePhone || contact.phone || 'Keine Nummer'} href={contact.mobilePhone ? `tel:${contact.mobilePhone}` : undefined} />
              <DetailRow icon={<Globe2 className="size-4" />} value={contact.website || 'Keine Webseite'} href={contact.website || undefined} />
              <DetailRow icon={<MapPin className="size-4" />} value={contact.address || [contact.city, contact.country].filter(Boolean).join(', ') || 'Keine Adresse'} />
            </div>
          </section>

          <section className="rounded-lg border border-border/75 bg-secondary/25 p-4">
            <h4 className="font-semibold">Soziale Medien</h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {socialEntries.length ? (
                socialEntries.map(([key, value]) => (
                  <Button key={key} asChild variant="outline" size="sm" className="h-9 rounded-lg">
                    <a href={value} target="_blank" rel="noreferrer">
                      <Share2 className="size-3.5" />
                      {key === 'x' ? 'X' : key}
                    </a>
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Keine Social Links hinterlegt.</p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-border/75 bg-secondary/25 p-4">
            <h4 className="font-semibold">Mitglied von</h4>
            <div className="mt-4 rounded-lg border border-border/70 bg-background/45 p-3">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Building2 className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{contact.companyName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{contact.industry}</p>
                  {contact.website ? (
                    <a href={contact.website} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                      Webseite
                      <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  )
}

function ContextTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/45 p-3">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-xs uppercase tracking-[0.16em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  )
}

function DetailRow({ icon, value, href }: { icon: React.ReactNode; value: string; href?: string }) {
  const content = (
    <>
      <span className="text-primary">{icon}</span>
      <span className="min-w-0 flex-1 break-words text-muted-foreground">{value}</span>
    </>
  )

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex items-start gap-3 rounded-md p-1 transition hover:bg-background/50">
        {content}
      </a>
    )
  }

  return <div className="flex items-start gap-3 rounded-md p-1">{content}</div>
}
