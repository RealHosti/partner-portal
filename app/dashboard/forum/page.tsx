'use client'

import Link from 'next/link'
import { MoreHorizontal, Settings } from 'lucide-react'
import { XRightRail, XSearchBox, xNews, xTrends, FollowRow, xPeople } from '@/components/dashboard/x-ui'

const categories = ['For You', 'Trending', 'News', 'Sports', 'Entertainment']

export default function ExplorePage() {
  return (
    <div className="grid min-h-svh grid-cols-1 xl:grid-cols-[600px_380px]">
      <section className="min-w-0 border-x border-[#2f3336] bg-black">
        <header className="sticky top-0 z-10 border-b border-[#2f3336] bg-black/80 px-4 py-2 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <XSearchBox />
            </div>
            <button type="button" className="flex size-10 items-center justify-center rounded-full text-[#e7e9ea] transition hover:bg-[#181818]" aria-label="Explore settings">
              <Settings className="size-5" />
            </button>
          </div>
          <div className="mt-2 grid h-12 grid-cols-5 text-[15px] font-bold">
            {categories.map((category, index) => (
              <button key={category} type="button" className={index === 0 ? 'relative text-[#e7e9ea]' : 'text-[#71767b] transition hover:bg-[#080808]'}>
                {category}
                {index === 0 ? <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full bg-[#1d9bf0]" /> : null}
              </button>
            ))}
          </div>
        </header>

        <section className="border-b border-[#2f3336] px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-[#e7e9ea]">Today's News</h1>
            <MoreHorizontal className="size-5 text-[#e7e9ea]" />
          </div>
          <div className="mt-4 space-y-7">
            {xNews.map((item) => (
              <Link key={item.title} href="/dashboard/forum" className="block transition hover:text-[#1d9bf0]">
                <p className="max-w-[500px] text-[17px] font-extrabold leading-5 text-[#e7e9ea]">{item.title}</p>
                <p className="mt-2 text-[13px] text-[#71767b]">{item.meta}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="divide-y divide-[#2f3336]">
          {xTrends.concat([
            { title: 'Niederlaender', meta: 'Trending in Germany' },
            { title: 'austrittsschreiben', meta: 'Trending in Germany' },
            { title: 'Haeuschen', meta: 'Trending in Germany' },
          ]).map((trend) => (
            <Link key={trend.title} href="/dashboard/forum" className="flex items-start justify-between px-4 py-4 transition hover:bg-[#080808]">
              <div>
                <p className="text-[13px] text-[#71767b]">{trend.meta}</p>
                <p className="mt-0.5 text-[15px] font-bold text-[#e7e9ea]">{trend.title}</p>
              </div>
              <MoreHorizontal className="size-5 text-[#71767b]" />
            </Link>
          ))}
        </section>

        <section className="border-t border-[#2f3336] py-3">
          <h2 className="px-4 text-xl font-extrabold text-[#e7e9ea]">Who to follow</h2>
          <div className="mt-2">
            {xPeople.map((person) => (
              <FollowRow key={person.handle} person={person} />
            ))}
          </div>
        </section>
      </section>

      <XRightRail mode="simple" />
    </div>
  )
}
