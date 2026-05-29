'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { XAvatar, XPageHeader, XRightRail, FollowRow, xPeople } from '@/components/dashboard/x-ui'
import { usePortalSession } from '@/hooks/use-auth-profile'

const tabs = ['Posts', 'Replies', 'Highlights', 'Articles', 'Media', 'Likes']

export default function ProfilePage() {
  const { profile } = usePortalSession()
  const displayName = profile?.twitch_display_name ?? 'netty¢hαnnєℓ'
  const handle = profile?.twitch_username ?? 'hostiliuus'

  return (
    <div className="grid min-h-svh grid-cols-1 xl:grid-cols-[600px_380px]">
      <section className="min-w-0 border-x border-[#2f3336] bg-black">
        <XPageHeader
          title={displayName}
          subtitle="1 post"
          backHref="/dashboard"
          action={
            <button type="button" className="flex size-9 items-center justify-center rounded-full text-[#e7e9ea] transition hover:bg-[#181818]" aria-label="Profile search">
              <Search className="size-5" />
            </button>
          }
        />

        <section>
          <div className="relative h-[200px] overflow-hidden bg-[#16181c]">
            <Image src="/images/banner.png" alt="Profile header" fill className="object-cover" priority />
          </div>

          <div className="px-4 pb-4">
            <div className="-mt-16 flex items-end justify-between">
              <div className="rounded-full border-4 border-black">
                <XAvatar src={profile?.twitch_avatar_url} name={displayName} size="xl" />
              </div>
              <Button asChild variant="outline" className="mb-4 h-9 rounded-full border-[#536471] bg-black px-4 text-[15px] font-bold text-[#e7e9ea] hover:bg-[#181818]">
                <Link href="/dashboard/messages/new">Edit profile</Link>
              </Button>
            </div>

            <div className="mt-3">
              <h1 className="text-xl font-extrabold text-[#e7e9ea]">{displayName}</h1>
              <p className="text-[15px] text-[#71767b]">@{handle}</p>
              {profile?.about || profile?.bio ? (
                <p className="mt-3 text-[15px] leading-5 text-[#e7e9ea]">{profile.about ?? profile.bio}</p>
              ) : null}
              <div className="mt-3 flex items-center gap-1 text-[15px] text-[#71767b]">
                <CalendarDays className="size-4" />
                <span>Joined May 2020</span>
              </div>
              <div className="mt-3 flex gap-5 text-[15px]">
                <span>
                  <strong className="font-bold text-[#e7e9ea]">1</strong>{' '}
                  <span className="text-[#71767b]">Following</span>
                </span>
                <span>
                  <strong className="font-bold text-[#e7e9ea]">4</strong>{' '}
                  <span className="text-[#71767b]">Followers</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid h-[53px] grid-cols-6 border-b border-[#2f3336] text-[15px] font-bold">
            {tabs.map((tab, index) => (
              <button key={tab} type="button" className={index === 0 ? 'relative text-[#e7e9ea]' : 'text-[#71767b] transition hover:bg-[#080808]'}>
                {tab}
                {index === 0 ? <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-[#1d9bf0]" /> : null}
              </button>
            ))}
          </div>
        </section>

        <section className="py-3">
          <h2 className="px-4 text-xl font-extrabold text-[#e7e9ea]">Who to follow</h2>
          <div className="mt-2">
            {xPeople.map((person) => (
              <FollowRow key={person.handle} person={person} />
            ))}
          </div>
        </section>
      </section>

      <XRightRail mode="profile" />
    </div>
  )
}
