-- CampuList prototype -> Supabase schema draft
-- This file is intended as a starting point before real migration.

create extension if not exists pgcrypto;
create schema if not exists app;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role' and typnamespace = 'app'::regnamespace) then
    create type app.user_role as enum ('student', 'professor', 'staff', 'merchant', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'post_category' and typnamespace = 'app'::regnamespace) then
    create type app.post_category as enum ('market', 'housing', 'jobs', 'store');
  end if;
  if not exists (select 1 from pg_type where typname = 'post_status' and typnamespace = 'app'::regnamespace) then
    create type app.post_status as enum ('draft', 'active', 'reserved', 'closed', 'hidden');
  end if;
  if not exists (select 1 from pg_type where typname = 'chat_thread_status' and typnamespace = 'app'::regnamespace) then
    create type app.chat_thread_status as enum ('open', 'closed');
  end if;
  if not exists (select 1 from pg_type where typname = 'report_target_type' and typnamespace = 'app'::regnamespace) then
    create type app.report_target_type as enum ('post');
  end if;
  if not exists (select 1 from pg_type where typname = 'report_reason' and typnamespace = 'app'::regnamespace) then
    create type app.report_reason as enum ('spam', 'fraud', 'abuse', 'prohibited_item', 'other');
  end if;
  if not exists (select 1 from pg_type where typname = 'report_status' and typnamespace = 'app'::regnamespace) then
    create type app.report_status as enum ('pending', 'reviewed', 'actioned', 'rejected');
  end if;
end $$;

create table if not exists app.campuses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ko text not null,
  name_en text not null,
  city text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists app.users (
  id uuid primary key references auth.users(id) on delete cascade,
  campus_id uuid not null references app.campuses(id),
  role app.user_role not null,
  display_name text not null,
  nickname text not null,
  trust_score int not null default 0 check (trust_score >= 0 and trust_score <= 100),
  is_verified_school_email boolean not null default false,
  is_verified_phone boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists app.posts (
  id uuid primary key default gen_random_uuid(),
  campus_id uuid not null references app.campuses(id),
  category app.post_category not null,
  author_id uuid not null references app.users(id),
  title text not null check (char_length(trim(title)) >= 2),
  body text not null check (char_length(trim(body)) >= 5),
  price_krw numeric(12, 0) check (price_krw is null or price_krw >= 0),
  tags text[] not null default '{}',
  location_hint text,
  status app.post_status not null default 'active',
  is_promoted boolean not null default false,
  promotion_until timestamptz,
  view_count int not null default 0 check (view_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint posts_promotion_consistency check (
    (is_promoted = false and promotion_until is null)
    or
    (is_promoted = true and promotion_until is not null)
  )
);

create table if not exists app.chat_threads (
  id uuid primary key default gen_random_uuid(),
  campus_id uuid not null references app.campuses(id),
  post_id uuid not null references app.posts(id),
  participant_ids uuid[] not null check (array_length(participant_ids, 1) >= 2),
  status app.chat_thread_status not null default 'open',
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists app.chat_messages (
  id uuid primary key default gen_random_uuid(),
  campus_id uuid not null references app.campuses(id),
  thread_id uuid not null references app.chat_threads(id),
  sender_id uuid not null references app.users(id),
  body text not null check (char_length(trim(body)) > 0),
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists app.reports (
  id uuid primary key default gen_random_uuid(),
  campus_id uuid not null references app.campuses(id),
  reporter_id uuid not null references app.users(id),
  target_type app.report_target_type not null,
  target_id uuid not null,
  reason app.report_reason not null,
  details text not null,
  status app.report_status not null default 'pending',
  reviewed_by uuid references app.users(id),
  reviewed_at timestamptz,
  action_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_users_campus_id on app.users(campus_id);
create index if not exists idx_users_role on app.users(role);

create index if not exists idx_posts_campus_category_status_created
  on app.posts(campus_id, category, status, created_at desc);
create index if not exists idx_posts_promoted_until
  on app.posts(campus_id, is_promoted, promotion_until)
  where is_promoted = true;
create index if not exists idx_posts_author_id on app.posts(author_id);

create index if not exists idx_chat_threads_post_id on app.chat_threads(post_id);
create index if not exists idx_chat_threads_participant_ids_gin
  on app.chat_threads using gin(participant_ids);

create index if not exists idx_chat_messages_thread_created
  on app.chat_messages(thread_id, created_at);

create index if not exists idx_reports_campus_status_created
  on app.reports(campus_id, status, created_at desc);

create or replace function app.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at_campuses on app.campuses;
create trigger trg_set_updated_at_campuses
before update on app.campuses
for each row execute function app.set_updated_at();

drop trigger if exists trg_set_updated_at_users on app.users;
create trigger trg_set_updated_at_users
before update on app.users
for each row execute function app.set_updated_at();

drop trigger if exists trg_set_updated_at_posts on app.posts;
create trigger trg_set_updated_at_posts
before update on app.posts
for each row execute function app.set_updated_at();

drop trigger if exists trg_set_updated_at_chat_threads on app.chat_threads;
create trigger trg_set_updated_at_chat_threads
before update on app.chat_threads
for each row execute function app.set_updated_at();

drop trigger if exists trg_set_updated_at_chat_messages on app.chat_messages;
create trigger trg_set_updated_at_chat_messages
before update on app.chat_messages
for each row execute function app.set_updated_at();

drop trigger if exists trg_set_updated_at_reports on app.reports;
create trigger trg_set_updated_at_reports
before update on app.reports
for each row execute function app.set_updated_at();
