create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  twitch_id text,
  twitch_username text,
  twitch_display_name text,
  twitch_avatar_url text,
  twitch_email text,
  is_admin boolean not null default false,
  is_partner boolean not null default true,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid references public.profiles (id) on delete set null,
  subject text not null,
  content text not null,
  is_read boolean not null default false,
  message_type text not null default 'request',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  room_id text not null default 'partner-lounge',
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_rooms (
  id text primary key default 'partner-lounge',
  participant_1 uuid references public.profiles (id) on delete set null,
  participant_2 uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  admin_id uuid references public.profiles (id) on delete set null,
  title text not null,
  description text,
  appointment_date timestamptz not null,
  duration_minutes integer not null default 30,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  slug text unique not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.forum_categories (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  slug text unique not null,
  is_pinned boolean not null default false,
  is_locked boolean not null default false,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  is_solution boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text,
  cover_image_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id and is_admin = true
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    twitch_id,
    twitch_username,
    twitch_display_name,
    twitch_avatar_url,
    twitch_email
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'provider_id', new.raw_user_meta_data ->> 'sub', new.raw_user_meta_data ->> 'twitch_id'),
    coalesce(new.raw_user_meta_data ->> 'preferred_username', new.raw_user_meta_data ->> 'user_name', new.raw_user_meta_data ->> 'login'),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'display_name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', new.raw_user_meta_data ->> 'profile_image_url'),
    new.email
  )
  on conflict (id) do update set
    twitch_id = excluded.twitch_id,
    twitch_username = excluded.twitch_username,
    twitch_display_name = excluded.twitch_display_name,
    twitch_avatar_url = excluded.twitch_avatar_url,
    twitch_email = excluded.twitch_email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.appointments enable row level security;
alter table public.forum_categories enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_posts enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_comments enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated
  using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin" on public.profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin(auth.uid()))
  with check (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "messages_select_related" on public.messages;
create policy "messages_select_related" on public.messages
  for select to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid() or recipient_id is null or public.is_admin(auth.uid()));

drop policy if exists "messages_insert_self" on public.messages;
create policy "messages_insert_self" on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid());

drop policy if exists "messages_update_related" on public.messages;
create policy "messages_update_related" on public.messages
  for update to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid() or public.is_admin(auth.uid()))
  with check (sender_id = auth.uid() or recipient_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "chat_messages_select_authenticated" on public.chat_messages;
create policy "chat_messages_select_authenticated" on public.chat_messages
  for select to authenticated
  using (true);

drop policy if exists "chat_messages_insert_self" on public.chat_messages;
create policy "chat_messages_insert_self" on public.chat_messages
  for insert to authenticated
  with check (sender_id = auth.uid());

drop policy if exists "chat_rooms_select_authenticated" on public.chat_rooms;
create policy "chat_rooms_select_authenticated" on public.chat_rooms
  for select to authenticated
  using (true);

drop policy if exists "appointments_select_related" on public.appointments;
create policy "appointments_select_related" on public.appointments
  for select to authenticated
  using (user_id = auth.uid() or admin_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "appointments_insert_self" on public.appointments;
create policy "appointments_insert_self" on public.appointments
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "appointments_update_related" on public.appointments;
create policy "appointments_update_related" on public.appointments
  for update to authenticated
  using (user_id = auth.uid() or admin_id = auth.uid() or public.is_admin(auth.uid()))
  with check (user_id = auth.uid() or admin_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "forum_categories_select_authenticated" on public.forum_categories;
create policy "forum_categories_select_authenticated" on public.forum_categories
  for select to authenticated
  using (true);

drop policy if exists "forum_categories_admin_write" on public.forum_categories;
create policy "forum_categories_admin_write" on public.forum_categories
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "forum_topics_select_authenticated" on public.forum_topics;
create policy "forum_topics_select_authenticated" on public.forum_topics
  for select to authenticated
  using (true);

drop policy if exists "forum_topics_insert_self" on public.forum_topics;
create policy "forum_topics_insert_self" on public.forum_topics
  for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "forum_topics_update_self_or_admin" on public.forum_topics;
create policy "forum_topics_update_self_or_admin" on public.forum_topics
  for update to authenticated
  using (author_id = auth.uid() or public.is_admin(auth.uid()))
  with check (author_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "forum_posts_select_authenticated" on public.forum_posts;
create policy "forum_posts_select_authenticated" on public.forum_posts
  for select to authenticated
  using (true);

drop policy if exists "forum_posts_insert_self" on public.forum_posts;
create policy "forum_posts_insert_self" on public.forum_posts
  for insert to authenticated
  with check (author_id = auth.uid());

drop policy if exists "forum_posts_update_self_or_admin" on public.forum_posts;
create policy "forum_posts_update_self_or_admin" on public.forum_posts
  for update to authenticated
  using (author_id = auth.uid() or public.is_admin(auth.uid()))
  with check (author_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "blog_posts_select_published_or_admin" on public.blog_posts;
create policy "blog_posts_select_published_or_admin" on public.blog_posts
  for select to authenticated
  using (is_published = true or public.is_admin(auth.uid()));

drop policy if exists "blog_posts_admin_write" on public.blog_posts;
create policy "blog_posts_admin_write" on public.blog_posts
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "blog_comments_select_authenticated" on public.blog_comments;
create policy "blog_comments_select_authenticated" on public.blog_comments
  for select to authenticated
  using (true);

drop policy if exists "blog_comments_insert_self" on public.blog_comments;
create policy "blog_comments_insert_self" on public.blog_comments
  for insert to authenticated
  with check (author_id = auth.uid());

insert into public.chat_rooms (id)
values ('partner-lounge')
on conflict (id) do nothing;

insert into public.forum_categories (name, description, slug, sort_order)
values
  ('Briefings', 'Kampagnen, Timings und Freigaben', 'briefings', 1),
  ('Assets', 'Logos, Links und technische Specs', 'assets', 2),
  ('Feedback', 'Rueckfragen, Ideen und Verbesserungen', 'feedback', 3)
on conflict (slug) do nothing;

do $$
begin
  alter publication supabase_realtime add table public.chat_messages;
exception
  when duplicate_object then null;
end $$;
