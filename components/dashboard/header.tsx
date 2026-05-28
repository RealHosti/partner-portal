'use client'

import { LogoutButton } from '@/components/auth/logout-button'
import type { Profile } from '@/lib/types'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  profile: Profile | null
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold">
          Willkommen zurück, <span className="text-primary">{profile?.twitch_display_name || 'Partner'}</span>
        </h2>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>
        <LogoutButton />
      </div>
    </header>
  )
}
