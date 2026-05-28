'use client'

import { useEffect, useState } from 'react'
import { Loader2, Newspaper, Plus, Rocket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import type { BlogPost } from '@/lib/types'
import { usePortalSession } from '@/hooks/use-auth-profile'

const demoPosts: BlogPost[] = [
  {
    id: 'demo-post-1',
    author_id: '00000000-0000-0000-0000-000000000001',
    title: 'Partner Update: Neue Kampagnen-Slots',
    slug: 'partner-update-kampagnen-slots',
    content:
      'Diese Woche stehen neue Slots fuer Hardware, Indie-Games und Community-Aktionen bereit. Details folgen im Forum.',
    excerpt: 'Neue Slots fuer Hardware, Indie-Games und Community-Aktionen.',
    cover_image_url: null,
    is_published: true,
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-post-2',
    author_id: '00000000-0000-0000-0000-000000000001',
    title: 'Gamescom Style Briefing',
    slug: 'gamescom-style-briefing',
    content:
      'Das Portal nutzt bewusst App-Patterns: schnelle Updates, zentrale Threads und ein kompakter Live-Kanal fuer Partner.',
    excerpt: 'Warum das Partner Portal wie eine Event-App funktioniert.',
    cover_image_url: null,
    is_published: true,
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function BlogPage() {
  const { profile, isDemo } = usePortalSession()
  const [posts, setPosts] = useState<BlogPost[]>(demoPosts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadPosts() {
      if (!isSupabaseConfigured()) {
        setPosts(demoPosts)
        return
      }

      const supabase = createClient()
      const query = supabase.from('blog_posts').select('*').order('published_at', { ascending: false })
      const { data } = profile?.is_admin ? await query : await query.eq('is_published', true)

      if (active) {
        setPosts(data ?? [])
      }
    }

    void loadPosts()

    return () => {
      active = false
    }
  }, [profile])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') ?? '')
    const excerpt = String(formData.get('excerpt') ?? '')
    const content = String(formData.get('content') ?? '')

    if (!title.trim() || !content.trim()) {
      setError('Bitte Titel und Inhalt ausfuellen.')
      setLoading(false)
      return
    }

    const nextPost: BlogPost = {
      id: crypto.randomUUID(),
      author_id: profile?.id ?? 'demo',
      title,
      slug: `${slugify(title)}-${Date.now()}`,
      excerpt,
      content,
      cover_image_url: null,
      is_published: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (!isSupabaseConfigured() || isDemo || !profile) {
      setPosts((current) => [nextPost, ...current])
      event.currentTarget.reset()
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error: insertError } = await supabase
      .from('blog_posts')
      .insert({
        author_id: profile.id,
        title,
        slug: nextPost.slug,
        excerpt,
        content,
        is_published: true,
        published_at: nextPost.published_at,
      })
      .select('*')
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setPosts((current) => (data ? [data, ...current] : current))
    event.currentTarget.reset()
    setLoading(false)
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-primary">News Feed</p>
          <h2 className="font-display text-5xl leading-none">Blog</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Release Notes, Kampagnen-Updates und Partner-Ankuendigungen im App-Feed.
          </p>
        </div>

        <div className="space-y-3">
          {posts.map((post) => (
            <article key={post.id} className="portal-panel p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={post.is_published ? 'bg-primary text-primary-foreground' : ''}>
                  {post.is_published ? 'Released' : 'Draft'}
                </Badge>
                <time className="text-xs text-muted-foreground">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('de-DE', { dateStyle: 'medium' })
                    : 'Noch nicht veroeffentlicht'}
                </time>
              </div>
              <h3 className="mt-3 text-2xl font-semibold">{post.title}</h3>
              {post.excerpt ? <p className="mt-2 text-sm leading-6 text-primary">{post.excerpt}</p> : null}
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{post.content}</p>
            </article>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="portal-panel p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground glow-orange">
              <Newspaper className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold">Gamescom-App Prinzip</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Kurze Updates, klare Releases, schnelle Orientierung fuer Partner auf dem Handy.
              </p>
            </div>
          </div>
        </div>

        {profile?.is_admin ? (
          <form onSubmit={handleSubmit} className="portal-panel space-y-4 p-5">
            <div className="flex items-center gap-2">
              <Rocket className="size-5 text-primary" />
              <h3 className="font-semibold">Blog Release erstellen</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input id="title" name="title" required placeholder="Update Titel" className="h-11 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Kurztext</Label>
              <Input id="excerpt" name="excerpt" placeholder="Feed-Zusammenfassung" className="h-11 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Inhalt</Label>
              <Textarea id="content" name="content" required rows={7} placeholder="Was sollen Partner wissen?" className="rounded-lg" />
            </div>
            {error ? <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
            <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Release veroeffentlichen
            </Button>
          </form>
        ) : (
          <div className="portal-panel p-5 text-sm text-muted-foreground">
            Blog Releases koennen nur von Admins erstellt werden.
          </div>
        )}
      </aside>
    </div>
  )
}
