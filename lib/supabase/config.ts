const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ''
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? ''

export function isSupabaseConfigured() {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes('your-project') &&
      !supabaseAnonKey.includes('your-anon-key'),
  )
}

export function getSupabaseConfig() {
  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  }
}

export function canUseLocalDemo() {
  return process.env.NODE_ENV !== 'production'
}

export function getBasePath() {
  if (!rawBasePath || rawBasePath === '/') {
    return ''
  }

  const withLeadingSlash = rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`
  return withLeadingSlash.replace(/\/$/, '')
}

export function withBasePath(path: string) {
  const basePath = getBasePath()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${basePath}${cleanPath}`
}

export function getOAuthRedirectUrl() {
  if (typeof window === 'undefined') {
    return withBasePath('/auth/callback/')
  }

  return `${window.location.origin}${withBasePath('/auth/callback/')}`
}
