'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Profile } from '@/lib/types'
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  MessagesSquare, 
  Users, 
  Newspaper,
  Settings,
  Shield,
  Zap
} from 'lucide-react'

interface DashboardSidebarProps {
  profile: Profile | null
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/messages', label: 'Nachrichten', icon: MessageSquare },
  { href: '/dashboard/appointments', label: 'Termine', icon: Calendar },
  { href: '/dashboard/chat', label: 'Live-Chat', icon: MessagesSquare },
  { href: '/dashboard/forum', label: 'Forum', icon: Users },
  { href: '/dashboard/blog', label: 'Blog', icon: Newspaper },
  { href: '/dashboard/settings', label: 'Einstellungen', icon: Settings },
]

const adminItems = [
  { href: '/dashboard/admin', label: 'Admin', icon: Shield },
]

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const isAdmin = profile?.is_admin ?? false

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center glow-orange">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-primary">Real</span>
            <span className="text-sidebar-foreground">hosti</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-sidebar-accent text-primary glow-orange' 
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className="my-4 border-t border-sidebar-border" />
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Administration
            </p>
            {adminItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive 
                      ? 'bg-sidebar-accent text-primary glow-orange' 
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2">
          {profile?.twitch_avatar_url ? (
            <img 
              src={profile.twitch_avatar_url} 
              alt={profile.twitch_display_name || 'Avatar'}
              className="w-10 h-10 rounded-full border-2 border-primary"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {profile?.twitch_display_name?.charAt(0) || '?'}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.twitch_display_name || 'Partner'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{profile?.twitch_username || 'unknown'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
