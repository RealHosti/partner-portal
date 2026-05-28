'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { canUseLocalDemo, isSupabaseConfigured } from '@/lib/supabase/config'
import type { Database } from '@/lib/database.types'
import type { Profile } from '@/lib/types'

type SupabaseUser = {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown>
}

type PortalStatus = 'loading' | 'authenticated' | 'guest' | 'demo'

type PortalSessionState = {
  status: PortalStatus
  user: SupabaseUser | null
  profile: Profile | null
  isConfigured: boolean
  isDemo: boolean
  refreshProfile: () => Promise<void>
}

const demoProfile: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  twitch_id: 'realhosti-demo',
  twitch_username: 'realhosti_partner',
  twitch_display_name: 'Realhosti Partner',
  twitch_avatar_url: null,
  twitch_email: 'partner@example.com',
  is_admin: true,
  is_partner: true,
  bio: 'Lokaler App-Preview ohne Supabase-Verbindung.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const PortalSessionContext = createContext<PortalSessionState | null>(null)

function getStringMetadata(user: SupabaseUser, keys: string[]) {
  for (const key of keys) {
    const value = user.user_metadata?.[key]
    if (typeof value === 'string' && value.length > 0) {
      return value
    }
  }

  return null
}

function buildProfilePayload(user: SupabaseUser): Database['public']['Tables']['profiles']['Insert'] {
  const username =
    getStringMetadata(user, ['preferred_username', 'user_name', 'login', 'name']) ??
    user.email?.split('@')[0] ??
    'partner'

  return {
    id: user.id,
    twitch_id: getStringMetadata(user, ['provider_id', 'sub', 'twitch_id']),
    twitch_username: username,
    twitch_display_name: getStringMetadata(user, ['full_name', 'name', 'display_name']) ?? username,
    twitch_avatar_url: getStringMetadata(user, ['avatar_url', 'picture', 'profile_image_url']),
    twitch_email: user.email ?? getStringMetadata(user, ['email']),
    is_partner: true,
    updated_at: new Date().toISOString(),
  }
}

async function ensureProfile(user: SupabaseUser) {
  const supabase = createClient()
  const payload = buildProfilePayload(user)

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single()

  if (!error && data) {
    return data
  }

  const { data: fallbackProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  return fallbackProfile ?? {
    ...demoProfile,
    ...payload,
    is_admin: false,
    is_partner: true,
    bio: null,
    created_at: new Date().toISOString(),
  }
}

export function PortalSessionProvider({
  children,
  requireAuth = false,
}: {
  children: ReactNode
  requireAuth?: boolean
}) {
  const router = useRouter()
  const configured = isSupabaseConfigured()
  const [state, setState] = useState<Omit<PortalSessionState, 'isConfigured' | 'isDemo' | 'refreshProfile'>>({
    status: 'loading',
    user: null,
    profile: null,
  })

  const refreshProfile = useCallback(async () => {
    if (!configured) {
      if (canUseLocalDemo()) {
        setState({ status: 'demo', user: null, profile: demoProfile })
      }
      return
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setState({ status: 'guest', user: null, profile: null })
      return
    }

    const profile = await ensureProfile(user as SupabaseUser)
    setState({ status: 'authenticated', user: user as SupabaseUser, profile })
  }, [configured])

  useEffect(() => {
    let active = true

    async function loadSession() {
      if (!configured) {
        if (canUseLocalDemo()) {
          setState({ status: 'demo', user: null, profile: demoProfile })
        } else {
          setState({ status: 'guest', user: null, profile: null })
        }
        return
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!active) {
        return
      }

      if (!user) {
        setState({ status: 'guest', user: null, profile: null })
        return
      }

      const profile = await ensureProfile(user as SupabaseUser)
      if (active) {
        setState({ status: 'authenticated', user: user as SupabaseUser, profile })
      }
    }

    void loadSession()

    if (!configured) {
      return () => {
        active = false
      }
    }

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) {
        return
      }

      if (!session?.user) {
        setState({ status: 'guest', user: null, profile: null })
        return
      }

      void ensureProfile(session.user as SupabaseUser).then((profile) => {
        if (active) {
          setState({ status: 'authenticated', user: session.user as SupabaseUser, profile })
        }
      })
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [configured])

  useEffect(() => {
    if (requireAuth && configured && state.status === 'guest') {
      router.replace('/')
    }
  }, [configured, requireAuth, router, state.status])

  const value = useMemo<PortalSessionState>(
    () => ({
      ...state,
      isConfigured: configured,
      isDemo: state.status === 'demo',
      refreshProfile,
    }),
    [configured, refreshProfile, state],
  )

  return <PortalSessionContext.Provider value={value}>{children}</PortalSessionContext.Provider>
}

export function usePortalSession() {
  const session = useContext(PortalSessionContext)

  if (!session) {
    throw new Error('usePortalSession must be used inside PortalSessionProvider.')
  }

  return session
}

export { demoProfile }
