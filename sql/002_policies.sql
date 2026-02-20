-- CampuList prototype -> Supabase RLS draft
-- Run this after sql/001_init.sql.

create schema if not exists app;

create or replace function app.current_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

create or replace function app.current_user_role()
returns app.user_role
language sql
stable
as $$
  select u.role
  from app.users u
  where u.id = auth.uid()
    and u.deleted_at is null;
$$;

create or replace function app.current_campus_id()
returns uuid
language sql
stable
as $$
  select u.campus_id
  from app.users u
  where u.id = auth.uid()
    and u.deleted_at is null;
$$;

create or replace function app.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(app.current_user_role() = 'admin', false);
$$;

alter table app.campuses enable row level security;
alter table app.users enable row level security;
alter table app.posts enable row level security;
alter table app.chat_threads enable row level security;
alter table app.chat_messages enable row level security;
alter table app.reports enable row level security;

drop policy if exists p_campuses_select on app.campuses;
create policy p_campuses_select
on app.campuses
for select
to authenticated
using (is_active = true and deleted_at is null);

drop policy if exists p_users_select on app.users;
create policy p_users_select
on app.users
for select
to authenticated
using (
  app.is_admin()
  or
  (campus_id = app.current_campus_id() and deleted_at is null)
);

drop policy if exists p_users_update on app.users;
create policy p_users_update
on app.users
for update
to authenticated
using (id = auth.uid() or app.is_admin())
with check (
  (id = auth.uid() and campus_id = app.current_campus_id())
  or app.is_admin()
);

drop policy if exists p_posts_select on app.posts;
create policy p_posts_select
on app.posts
for select
to authenticated
using (
  app.is_admin()
  or
  (
    campus_id = app.current_campus_id()
    and deleted_at is null
    and status <> 'hidden'
  )
);

drop policy if exists p_posts_insert on app.posts;
create policy p_posts_insert
on app.posts
for insert
to authenticated
with check (
  author_id = auth.uid()
  and campus_id = app.current_campus_id()
);

drop policy if exists p_posts_update on app.posts;
create policy p_posts_update
on app.posts
for update
to authenticated
using (author_id = auth.uid() or app.is_admin())
with check (
  (author_id = auth.uid() and campus_id = app.current_campus_id())
  or app.is_admin()
);

drop policy if exists p_posts_delete on app.posts;
create policy p_posts_delete
on app.posts
for delete
to authenticated
using (author_id = auth.uid() or app.is_admin());

drop policy if exists p_chat_threads_select on app.chat_threads;
create policy p_chat_threads_select
on app.chat_threads
for select
to authenticated
using (
  app.is_admin()
  or
  (
    campus_id = app.current_campus_id()
    and auth.uid() = any(participant_ids)
    and deleted_at is null
  )
);

drop policy if exists p_chat_threads_insert on app.chat_threads;
create policy p_chat_threads_insert
on app.chat_threads
for insert
to authenticated
with check (
  campus_id = app.current_campus_id()
  and auth.uid() = any(participant_ids)
);

drop policy if exists p_chat_threads_update on app.chat_threads;
create policy p_chat_threads_update
on app.chat_threads
for update
to authenticated
using (auth.uid() = any(participant_ids) or app.is_admin())
with check (
  (auth.uid() = any(participant_ids) and campus_id = app.current_campus_id())
  or app.is_admin()
);

drop policy if exists p_chat_messages_select on app.chat_messages;
create policy p_chat_messages_select
on app.chat_messages
for select
to authenticated
using (
  app.is_admin()
  or
  (
    campus_id = app.current_campus_id()
    and deleted_at is null
    and exists (
      select 1
      from app.chat_threads t
      where t.id = thread_id
        and auth.uid() = any(t.participant_ids)
        and t.deleted_at is null
    )
  )
);

drop policy if exists p_chat_messages_insert on app.chat_messages;
create policy p_chat_messages_insert
on app.chat_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and campus_id = app.current_campus_id()
  and exists (
    select 1
    from app.chat_threads t
    where t.id = thread_id
      and auth.uid() = any(t.participant_ids)
      and t.deleted_at is null
  )
);

drop policy if exists p_reports_select on app.reports;
create policy p_reports_select
on app.reports
for select
to authenticated
using (
  app.is_admin()
  and campus_id = app.current_campus_id()
  and deleted_at is null
);

drop policy if exists p_reports_insert on app.reports;
create policy p_reports_insert
on app.reports
for insert
to authenticated
with check (
  reporter_id = auth.uid()
  and campus_id = app.current_campus_id()
);

drop policy if exists p_reports_update on app.reports;
create policy p_reports_update
on app.reports
for update
to authenticated
using (app.is_admin() and campus_id = app.current_campus_id())
with check (app.is_admin() and campus_id = app.current_campus_id());
