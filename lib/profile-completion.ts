import type { Profile } from './types'

type CompletionItem = {
  key: keyof Profile
  label: string
  weight: number
}

const completionItems: CompletionItem[] = [
  { key: 'twitch_avatar_url', label: 'Twitch Avatar', weight: 10 },
  { key: 'employment_title', label: 'Position', weight: 12 },
  { key: 'industry', label: 'Branche', weight: 10 },
  { key: 'country', label: 'Land', weight: 8 },
  { key: 'about', label: 'Ueber mich', weight: 18 },
  { key: 'contact_email', label: 'Kontakt E-Mail', weight: 12 },
  { key: 'company_website', label: 'Webseite', weight: 8 },
  { key: 'social_links', label: 'Social Links', weight: 12 },
  { key: 'preferred_contact_method', label: 'Kontaktweg', weight: 10 },
]

function hasValue(profile: Profile | null, key: keyof Profile) {
  if (!profile) {
    return false
  }

  const value = profile[key]

  if (key === 'social_links') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false
    }

    return Object.values(value as Record<string, unknown>).some(
      (item) => typeof item === 'string' && item.trim().length > 0,
    )
  }

  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value)
}

export function getProfileCompletion(profile: Profile | null) {
  const total = completionItems.reduce((sum, item) => sum + item.weight, 0)
  const done = completionItems
    .filter((item) => hasValue(profile, item.key))
    .reduce((sum, item) => sum + item.weight, 0)
  const missing = completionItems.filter((item) => !hasValue(profile, item.key))

  return {
    percent: Math.min(100, Math.round((done / total) * 100)),
    missing,
  }
}
