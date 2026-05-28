'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { canUseLocalDemo, getOAuthRedirectUrl, isSupabaseConfigured } from '@/lib/supabase/config'

export function TwitchLoginButton() {
  const router = useRouter()
  const configured = isSupabaseConfigured()
  const allowDemo = !configured && canUseLocalDemo()

  const handleLogin = async () => {
    if (!configured) {
      if (allowDemo) {
        router.push('/dashboard')
      }
      return
    }

    const supabase = createClient()
    
    await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: {
        redirectTo: getOAuthRedirectUrl(),
        scopes: 'user:read:email'
      }
    })
  }

  return (
    <Button 
      onClick={handleLogin}
      size="lg"
      disabled={!configured && !allowDemo}
      className="h-12 rounded-lg bg-[#9146FF] px-6 text-base font-semibold text-white transition-all duration-300 hover:bg-[#7c3aed] hover:shadow-[0_0_30px_rgba(145,70,255,0.4)] disabled:cursor-not-allowed"
    >
      <svg 
        viewBox="0 0 24 24" 
        className="size-5 fill-current"
        aria-hidden="true"
      >
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
      </svg>
      {configured ? 'Mit Twitch anmelden' : allowDemo ? 'Demo oeffnen' : 'Setup fehlt'}
    </Button>
  )
}
