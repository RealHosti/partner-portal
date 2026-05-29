'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  BarChart3,
  Bookmark,
  Calendar,
  Flag,
  ImageIcon,
  Link2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Send,
  Settings2,
  Smile,
  Video,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { getProfileCompletion } from '@/lib/profile-completion'
import { usePortalSession } from '@/hooks/use-auth-profile'
import { XAvatar, XRightRail, getInitials } from '@/components/dashboard/x-ui'

type HubStats = {
  unreadMessages: number
  pendingAppointments: number
  forumTopics: number
  publishedPosts: number
}

type FeedPost = {
  id: string
  author: string
  handle: string
  time: string
  initials: string
  verified?: boolean
  text: string
  media?: 'banner' | 'quote'
  replies: string
  reposts: string
  likes: string
  views: string
}

const demoStats: HubStats = {
  unreadMessages: 3,
  pendingAppointments: 1,
  forumTopics: 7,
  publishedPosts: 4,
}

export default function DashboardPage() {
  const { profile } = usePortalSession()
  const [stats, setStats] = useState<HubStats>(demoStats)
  const completion = getProfileCompletion(profile)

  useEffect(() => {
    let active = true

    async function loadStats() {
      if (!isSupabaseConfigured() || !profile) {
        setStats(demoStats)
        return
      }

      const supabase = createClient()
      const [messages, appointments, topics, posts] = await Promise.all([
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .or(`recipient_id.eq.${profile.id},sender_id.eq.${profile.id}`)
          .eq('is_read', false),
        supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('status', 'pending'),
        supabase
          .from('forum_topics')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', profile.id),
        supabase
          .from('blog_posts')
          .select('id', { count: 'exact', head: true })
          .eq('is_published', true),
      ])

      if (active) {
        setStats({
          unreadMessages: messages.count ?? 0,
          pendingAppointments: appointments.count ?? 0,
          forumTopics: topics.count ?? 0,
          publishedPosts: posts.count ?? 0,
        })
      }
    }

    void loadStats()

    return () => {
      active = false
    }
  }, [profile])

  const feedPosts = useMemo<FeedPost[]>(
    () => [
      {
        id: 'status',
        author: 'Realhosti Partner Ops',
        handle: '@realhosti',
        time: '5h',
        initials: 'RH',
        verified: true,
        text: `Portal status: ${stats.unreadMessages} unread messages, ${stats.pendingAppointments} open appointments, ${stats.forumTopics} forum threads and ${stats.publishedPosts} published updates are active right now.`,
        media: 'banner',
        replies: '6.8K',
        reposts: '11K',
        likes: '132K',
        views: '19M',
      },
      {
        id: 'profile',
        author: profile?.twitch_display_name ?? 'Partner profile',
        handle: `@${profile?.twitch_username ?? 'hostiliuus'}`,
        time: '46m',
        initials: getInitials(profile?.twitch_display_name ?? 'Partner'),
        verified: true,
        text: `Profile completion is at ${completion.percent}%. Fill in role, company, contact details and socials so partners know who they are talking to.`,
        media: 'quote',
        replies: '242',
        reposts: '994',
        likes: '7.9K',
        views: '239K',
      },
      {
        id: 'company',
        author: 'Partner Directory',
        handle: '@partners',
        time: '55m',
        initials: 'PD',
        text: 'New partner contacts are ready to review. Use Follow to qualify companies, roles and contact channels before you start the conversation.',
        replies: '91',
        reposts: '420',
        likes: '3.1K',
        views: '82K',
      },
    ],
    [completion.percent, profile, stats],
  )

  return (
    <div className="grid min-h-svh grid-cols-1 xl:grid-cols-[600px_380px]">
      <section className="min-w-0 border-x border-[#2f3336] bg-black">
        <header className="sticky top-16 z-10 border-b border-[#2f3336] bg-black/80 backdrop-blur-xl">
          <div className="grid h-[53px] grid-cols-2 text-[15px] font-bold">
            <button type="button" className="relative text-[#e7e9ea]">
              For you
              <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-[#1d9bf0]" />
            </button>
            <button type="button" className="text-[#71767b] transition hover:bg-[#080808]">
              Following
            </button>
          </div>
        </header>

        <Composer
          avatarUrl={profile?.twitch_avatar_url}
          displayName={profile?.twitch_display_name ?? 'Partner'}
        />

        <div className="divide-y divide-[#2f3336]">
          {feedPosts.map((post) => (
            <FeedPostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <XRightRail mode="home" />
    </div>
  )
}

function Composer({
  avatarUrl,
  displayName,
}: {
  avatarUrl?: string | null
  displayName: string
}) {
  return (
    <section className="border-b border-[#2f3336] px-4 pb-3 pt-3">
      <div className="flex gap-3">
        <XAvatar src={avatarUrl} name={displayName} size="md" />
        <div className="min-w-0 flex-1">
          <textarea
            rows={2}
            placeholder="What's happening?"
            className="min-h-[54px] w-full resize-none border-0 bg-transparent pt-2 text-xl leading-6 text-[#e7e9ea] outline-none placeholder:text-[#71767b]"
          />
          <div className="flex items-center justify-between border-t border-[#2f3336] pt-3">
            <div className="flex items-center gap-1 text-[#1d9bf0]">
              <IconButton icon={<ImageIcon className="size-5" />} label="Media" />
              <IconButton icon={<Video className="size-5" />} label="GIF" />
              <IconButton icon={<Link2 className="size-5" />} label="Link" />
              <IconButton icon={<Settings2 className="size-5" />} label="Poll" />
              <IconButton icon={<Smile className="size-5" />} label="Emoji" />
              <IconButton icon={<Calendar className="size-5" />} label="Schedule" />
              <IconButton icon={<MapPin className="size-5" />} label="Location" />
              <IconButton icon={<Flag className="size-5" />} label="Flag" />
            </div>
            <Button asChild className="h-9 rounded-full bg-[#eff3f4] px-5 text-[15px] font-bold text-black hover:bg-[#d7dbdc]">
              <Link href="/dashboard/messages/new">Post</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function IconButton({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button type="button" aria-label={label} className="flex size-9 items-center justify-center rounded-full transition hover:bg-[#1d9bf0]/10">
      {icon}
    </button>
  )
}

function FeedPostCard({ post }: { post: FeedPost }) {
  return (
    <article className="px-4 py-3 transition hover:bg-[#080808]">
      <div className="flex gap-3">
        <XAvatar name={post.author} initials={post.initials} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1 text-[15px]">
                <span className="truncate font-bold text-[#e7e9ea]">{post.author}</span>
                {post.verified ? <span className="text-[#1d9bf0]">✓</span> : null}
                <span className="text-[#71767b]">{post.handle}</span>
                <span className="text-[#71767b]">·</span>
                <span className="text-[#71767b]">{post.time}</span>
              </div>
              <p className="mt-0.5 text-[15px] leading-5 text-[#e7e9ea]">{post.text}</p>
            </div>
            <button type="button" className="flex size-8 items-center justify-center rounded-full text-[#71767b] transition hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0]" aria-label="More">
              <MoreHorizontal className="size-5" />
            </button>
          </div>

          {post.media === 'banner' ? (
            <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-2xl border border-[#2f3336]">
              <Image src="/images/banner.png" alt="Realhosti stream setup" fill className="object-cover" />
              <span className="absolute bottom-3 left-3 rounded bg-black/70 px-2 py-0.5 text-xs font-bold text-white">0:36</span>
            </div>
          ) : null}

          {post.media === 'quote' ? (
            <div className="mt-3 rounded-2xl border border-[#2f3336] p-3">
              <p className="text-[15px] font-bold text-[#e7e9ea]">Next step</p>
              <p className="mt-1 text-[15px] leading-5 text-[#e7e9ea]">
                Add company, role and contact channels so conversations start with context.
              </p>
            </div>
          ) : null}

          <div className="mt-3 grid max-w-[520px] grid-cols-6 text-[13px] text-[#71767b]">
            <Metric icon={<MessageCircle className="size-[18px]" />} value={post.replies} />
            <Metric icon={<Repeat2 className="size-[18px]" />} value={post.reposts} />
            <Metric icon={<span className="text-lg leading-none">♡</span>} value={post.likes} />
            <Metric icon={<BarChart3 className="size-[18px]" />} value={post.views} />
            <Metric icon={<Bookmark className="size-[18px]" />} value="" />
            <Metric icon={<Send className="size-[18px]" />} value="" />
          </div>
        </div>
      </div>
    </article>
  )
}

function Metric({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <button type="button" className="flex items-center gap-1.5 rounded-full transition hover:text-[#1d9bf0]">
      {icon}
      <span>{value}</span>
    </button>
  )
}
