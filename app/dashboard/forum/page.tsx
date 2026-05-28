'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, MessageCircle, Pin, Plus, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import type { ForumCategory, ForumTopic } from '@/lib/types'
import { usePortalSession } from '@/hooks/use-auth-profile'

type TopicWithMeta = ForumTopic & {
  category?: Pick<ForumCategory, 'name' | 'slug'>
  post_count?: number
}

const demoCategories: ForumCategory[] = [
  {
    id: 'demo-cat-briefings',
    name: 'Briefings',
    description: 'Kampagnen, Timings und Freigaben',
    slug: 'briefings',
    sort_order: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-cat-assets',
    name: 'Assets',
    description: 'Logos, Links und technische Specs',
    slug: 'assets',
    sort_order: 2,
    created_at: new Date().toISOString(),
  },
]

const demoTopics: TopicWithMeta[] = [
  {
    id: 'demo-topic-1',
    category_id: 'demo-cat-briefings',
    author_id: '00000000-0000-0000-0000-000000000001',
    title: 'Checkliste fuer Sponsored Streams',
    slug: 'checkliste-sponsored-streams',
    is_pinned: true,
    is_locked: false,
    view_count: 128,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    category: { name: 'Briefings', slug: 'briefings' },
    post_count: 5,
  },
  {
    id: 'demo-topic-2',
    category_id: 'demo-cat-assets',
    author_id: '00000000-0000-0000-0000-000000000001',
    title: 'Overlay Assets fuer Mai-Kampagne',
    slug: 'overlay-assets-mai-kampagne',
    is_pinned: false,
    is_locked: false,
    view_count: 42,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    category: { name: 'Assets', slug: 'assets' },
    post_count: 2,
  },
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function ForumPage() {
  const { profile, isDemo } = usePortalSession()
  const [categories, setCategories] = useState<ForumCategory[]>(demoCategories)
  const [topics, setTopics] = useState<TopicWithMeta[]>(demoTopics)
  const [selectedCategory, setSelectedCategory] = useState(demoCategories[0]?.id ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadForum() {
      if (!isSupabaseConfigured()) {
        setCategories(demoCategories)
        setTopics(demoTopics)
        setSelectedCategory(demoCategories[0]?.id ?? '')
        return
      }

      const supabase = createClient()
      const [{ data: categoryRows }, { data: topicRows }] = await Promise.all([
        supabase.from('forum_categories').select('*').order('sort_order', { ascending: true }),
        supabase
          .from('forum_topics')
          .select('*, category:forum_categories(name, slug)')
          .order('is_pinned', { ascending: false })
          .order('updated_at', { ascending: false }),
      ])

      if (active) {
        setCategories(categoryRows ?? [])
        setTopics((topicRows as TopicWithMeta[] | null) ?? [])
        setSelectedCategory((categoryRows ?? [])[0]?.id ?? '')
      }
    }

    void loadForum()

    return () => {
      active = false
    }
  }, [])

  const currentCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategory),
    [categories, selectedCategory],
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const title = String(formData.get('title') ?? '')
    const content = String(formData.get('content') ?? '')
    const categoryId = String(formData.get('category_id') ?? selectedCategory)

    if (!title.trim() || !content.trim() || !categoryId) {
      setError('Bitte Kategorie, Titel und Beitrag ausfuellen.')
      setLoading(false)
      return
    }

    if (!isSupabaseConfigured() || isDemo || !profile) {
      const category = categories.find((item) => item.id === categoryId)
      setTopics((current) => [
        {
          id: crypto.randomUUID(),
          category_id: categoryId,
          author_id: profile?.id ?? 'demo',
          title,
          slug: `${slugify(title)}-${Date.now()}`,
          is_pinned: false,
          is_locked: false,
          view_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          category: category ? { name: category.name, slug: category.slug } : undefined,
          post_count: 1,
        },
        ...current,
      ])
      event.currentTarget.reset()
      setSelectedCategory(categoryId)
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: topic, error: topicError } = await supabase
      .from('forum_topics')
      .insert({
        category_id: categoryId,
        author_id: profile.id,
        title,
        slug: `${slugify(title)}-${Date.now()}`,
      })
      .select('*, category:forum_categories(name, slug)')
      .single()

    if (topicError || !topic) {
      setError(topicError?.message ?? 'Topic konnte nicht erstellt werden.')
      setLoading(false)
      return
    }

    const insertedTopic = topic as unknown as TopicWithMeta
    const { error: postError } = await supabase.from('forum_posts').insert({
      topic_id: insertedTopic.id,
      author_id: profile.id,
      content,
    })

    if (postError) {
      setError(postError.message)
      setLoading(false)
      return
    }

    setTopics((current) => [insertedTopic, ...current])
    event.currentTarget.reset()
    setLoading(false)
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-primary">Partner Board</p>
          <h2 className="font-display text-5xl leading-none">Forum</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Threads fuer Ideen, Assets, Freigaben und Kampagnen-Planung.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={selectedCategory === category.id ? 'portal-panel border-primary/70 p-4 text-left' : 'portal-panel p-4 text-left transition hover:border-primary/60'}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{category.name}</h3>
                <Badge variant="outline">{topics.filter((topic) => topic.category_id === category.id).length}</Badge>
              </div>
              {category.description ? <p className="mt-1 text-sm text-muted-foreground">{category.description}</p> : null}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="portal-panel space-y-4 p-5">
          <div className="space-y-2">
            <Label htmlFor="category_id">Kategorie</Label>
            <Select name="category_id" value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category_id" className="h-11 rounded-lg">
                <SelectValue placeholder="Kategorie waehlen" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input id="title" name="title" required placeholder="Worum geht es?" className="h-11 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Beitrag</Label>
            <Textarea id="content" name="content" required rows={6} placeholder="Details, Fragen oder Ideen..." className="rounded-lg" />
          </div>
          {error ? <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={loading || categories.length === 0} className="h-11 w-full rounded-lg">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Beitrag erstellen
          </Button>
        </form>
      </section>

      <section className="portal-panel divide-y divide-border/70 overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm text-muted-foreground">Aktuelle Kategorie</p>
            <h3 className="text-xl font-semibold">{currentCategory?.name ?? 'Alle Topics'}</h3>
          </div>
          <Users className="size-6 text-primary" />
        </div>

        {topics.length > 0 ? (
          topics
            .filter((topic) => !selectedCategory || topic.category_id === selectedCategory)
            .map((topic) => (
              <article key={topic.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    {topic.is_pinned ? <Pin className="size-5" /> : <MessageCircle className="size-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{topic.title}</h3>
                      {topic.is_pinned ? <Badge className="bg-primary text-primary-foreground">Pinned</Badge> : null}
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        {topic.category?.name ?? 'Forum'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {topic.post_count ?? 1} Antworten - {topic.view_count} Views - aktualisiert{' '}
                      {new Date(topic.updated_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              </article>
            ))
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">Noch keine Forum-Beitraege vorhanden.</div>
        )}
      </section>
    </div>
  )
}
