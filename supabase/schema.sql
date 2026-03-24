create extension if not exists pgcrypto;

create table if not exists public.articles (
  id text primary key,
  slug text,
  category_id text not null check (category_id in ('A', 'B', 'C', 'D', 'E')),
  profile_id uuid,
  title_bn text not null,
  title_en text,
  cover_label text,
  teaser text,
  content_standard text not null,
  content_funny text not null,
  fun_fact text,
  tags text,
  image_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  auto_publish_at timestamptz not null default (now() + interval '10 minutes'),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.articles add column if not exists slug text;
alter table public.articles add column if not exists title_en text;
alter table public.articles add column if not exists cover_label text;
alter table public.articles add column if not exists teaser text;
alter table public.articles add column if not exists fun_fact text;
alter table public.articles add column if not exists tags text;
alter table public.articles add column if not exists profile_id uuid;
alter table public.articles add column if not exists status text not null default 'pending';
alter table public.articles add column if not exists reviewed_by uuid;
alter table public.articles add column if not exists reviewed_at timestamptz;
alter table public.articles add column if not exists auto_publish_at timestamptz not null default (now() + interval '10 minutes');
alter table public.articles add column if not exists published_at timestamptz;
alter table public.articles add column if not exists created_at timestamptz not null default now();
alter table public.articles add column if not exists updated_at timestamptz not null default now();

alter table public.articles
drop constraint if exists articles_status_check;

alter table public.articles
add constraint articles_status_check
check (status in ('pending', 'approved', 'rejected'));

create unique index if not exists articles_slug_unique_idx
on public.articles (slug)
where slug is not null and slug <> '';

create index if not exists articles_profile_id_idx
on public.articles (profile_id);

create index if not exists articles_status_auto_publish_idx
on public.articles (status, auto_publish_at);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  sender_id uuid references auth.users(id) on delete cascade,
  sender_name text not null,
  message_text text not null,
  created_at timestamptz not null default now()
);

alter table public.chat_messages
add column if not exists sender_id uuid references auth.users(id) on delete cascade;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  session_id text unique not null,
  display_name text not null,
  email text,
  email_verified boolean not null default false,
  username text,
  role text not null default 'reader' check (role in ('reader', 'admin')),
  bio text default '',
  tagline text default '',
  avatar_url text default '',
  favorite_topic text default 'মহাকাশ',
  location text default '',
  occupation text default '',
  points integer not null default 0,
  level integer not null default 1,
  badges text[] not null default '{}',
  avatar_glow text default 'cyan',
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists email_verified boolean not null default false;
alter table public.profiles add column if not exists bio text default '';
alter table public.profiles add column if not exists tagline text default '';
alter table public.profiles add column if not exists avatar_url text default '';
alter table public.profiles add column if not exists favorite_topic text default 'মহাকাশ';
alter table public.profiles add column if not exists location text default '';
alter table public.profiles add column if not exists occupation text default '';
alter table public.profiles add column if not exists role text not null default 'reader';

create unique index if not exists profiles_username_unique_idx
on public.profiles ((lower(username)))
where username is not null and username <> '';

create unique index if not exists profiles_email_unique_idx
on public.profiles ((lower(email)))
where email is not null and email <> '';

alter table public.articles
drop constraint if exists articles_profile_id_fkey;

alter table public.articles
add constraint articles_profile_id_fkey
foreign key (profile_id) references public.profiles(id) on delete set null;

alter table public.articles
drop constraint if exists articles_reviewed_by_fkey;

alter table public.articles
add constraint articles_reviewed_by_fkey
foreign key (reviewed_by) references public.profiles(id) on delete set null;

create table if not exists public.user_posts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  article_id text,
  display_name text,
  is_anonymous boolean not null default false,
  category text not null,
  fact_text text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.user_posts add column if not exists article_id text;

alter table public.user_posts
drop constraint if exists user_posts_article_id_fkey;

alter table public.user_posts
add constraint user_posts_article_id_fkey
foreign key (article_id) references public.articles(id) on delete cascade;

create unique index if not exists user_posts_article_id_unique_idx
on public.user_posts (article_id)
where article_id is not null;

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.user_posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, profile_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.user_posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  display_name text,
  comment_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.post_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  post_id uuid references public.user_posts(id) on delete cascade,
  article_id text references public.articles(id) on delete cascade,
  type text not null check (type in ('like', 'comment', 'post_submission', 'article_submission', 'article_review')),
  body_text text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.post_notifications
add column if not exists article_id text references public.articles(id) on delete cascade;

alter table public.post_notifications
alter column post_id drop not null;

alter table public.post_notifications
drop constraint if exists post_notifications_type_check;

alter table public.post_notifications
add constraint post_notifications_type_check
check (type in ('like', 'comment', 'post_submission', 'article_submission', 'article_review'));

alter table public.post_notifications
drop constraint if exists post_notifications_target_check;

alter table public.post_notifications
add constraint post_notifications_target_check
check (
  (post_id is not null and article_id is null)
  or (post_id is null and article_id is not null)
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  emoji_rating text,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_verification_tokens_profile_idx
on public.email_verification_tokens (profile_id);

create index if not exists email_verification_tokens_email_idx
on public.email_verification_tokens ((lower(email)));

alter table public.feedback add column if not exists user_id uuid references auth.users(id) on delete set null;

create or replace function public.trim_chat_messages()
returns trigger
language plpgsql
as $$
begin
  delete from public.chat_messages
  where id in (
    select id
    from public.chat_messages
    where room_id = new.room_id
    order by created_at desc
    offset 4
  );

  return new;
end;
$$;

drop trigger if exists chat_messages_trim_trigger on public.chat_messages;

create trigger chat_messages_trim_trigger
after insert on public.chat_messages
for each row
execute function public.trim_chat_messages();

create or replace function public.stamp_article_dates()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();

  if tg_op = 'INSERT' then
    new.created_at = coalesce(new.created_at, now());
    new.auto_publish_at = coalesce(new.auto_publish_at, now() + interval '10 minutes');
  end if;

  if new.status = 'approved' and new.published_at is null then
    new.published_at = now();
  end if;

  if new.status <> 'approved' and tg_op = 'UPDATE' and old.status = 'approved' and new.status = 'rejected' then
    new.published_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists articles_stamp_dates_trigger on public.articles;

create trigger articles_stamp_dates_trigger
before insert or update on public.articles
for each row
execute function public.stamp_article_dates();

create or replace function public.auto_publish_pending_articles()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer;
begin
  update public.articles
  set status = 'approved',
      reviewed_at = coalesce(reviewed_at, auto_publish_at),
      published_at = coalesce(published_at, auto_publish_at),
      updated_at = now()
  where status = 'pending'
    and auto_publish_at <= now();

  get diagnostics affected_count = row_count;
  return affected_count;
end;
$$;

grant execute on function public.auto_publish_pending_articles() to anon, authenticated;

create or replace function public.sync_article_to_community_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  author_name text;
  summary_text text;
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    select display_name
    into author_name
    from public.profiles
    where id = new.profile_id;

    summary_text := left(
      trim(
        coalesce(nullif(new.title_bn, ''), 'নতুন জ্ঞানভিত্তিক পোস্ট')
        || ': ' ||
        coalesce(
          nullif(new.teaser, ''),
          nullif(new.fun_fact, ''),
          'নতুন article publish হয়েছে।'
        )
      ),
      280
    );

    insert into public.user_posts (
      profile_id,
      article_id,
      display_name,
      is_anonymous,
      category,
      fact_text,
      status,
      created_at
    )
    values (
      new.profile_id,
      new.id,
      coalesce(author_name, 'রহস্যঘর'),
      false,
      case new.category_id
        when 'A' then 'মহাকাশ'
        when 'B' then 'ইতিহাস'
        when 'C' then 'বিজ্ঞান'
        when 'D' then 'গেম'
        when 'E' then 'লাইফ হ্যাক'
        else 'তথ্য'
      end,
      summary_text,
      'approved',
      coalesce(new.published_at, now())
    )
    on conflict (article_id) do nothing;
  end if;

  if old.status = 'approved' and new.status = 'rejected' then
    update public.user_posts
    set status = 'rejected'
    where article_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists articles_sync_to_community_post_trigger on public.articles;

create trigger articles_sync_to_community_post_trigger
after update on public.articles
for each row
execute function public.sync_article_to_community_post();

create or replace function public.can_request_password_reset(target_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  eligible boolean;
begin
  select coalesce(email_verified, false)
  into eligible
  from public.profiles
  where lower(email) = lower(target_email)
  limit 1;

  return coalesce(eligible, false);
end;
$$;

grant execute on function public.can_request_password_reset(text) to anon, authenticated;

create or replace function public.create_email_verification_token(target_profile_id uuid, target_email text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_token text;
  hashed_token text;
begin
  if auth.uid() is distinct from target_profile_id then
    raise exception 'not allowed';
  end if;

  delete from public.email_verification_tokens
  where profile_id = target_profile_id
    or expires_at <= now()
    or consumed_at is not null;

  raw_token := encode(gen_random_bytes(24), 'hex');
  hashed_token := encode(digest(raw_token, 'sha256'), 'hex');

  insert into public.email_verification_tokens (
    profile_id,
    email,
    token_hash,
    expires_at
  )
  values (
    target_profile_id,
    lower(target_email),
    hashed_token,
    now() + interval '24 hours'
  );

  return raw_token;
end;
$$;

grant execute on function public.create_email_verification_token(uuid, text) to authenticated;

create or replace function public.verify_email_token(raw_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_record public.email_verification_tokens%rowtype;
  hashed_token text;
begin
  hashed_token := encode(digest(raw_token, 'sha256'), 'hex');

  select *
  into matched_record
  from public.email_verification_tokens
  where token_hash = hashed_token
    and consumed_at is null
    and expires_at > now()
  limit 1;

  if matched_record.id is null then
    return false;
  end if;

  update public.email_verification_tokens
  set consumed_at = now()
  where id = matched_record.id;

  update public.profiles
  set email_verified = true,
      email = lower(matched_record.email)
  where id = matched_record.profile_id;

  return true;
end;
$$;

grant execute on function public.verify_email_token(text) to anon, authenticated;

create or replace function public.award_points_on_post_approval()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'approved' and old.status is distinct from 'approved' and new.profile_id is not null then
    update public.profiles
    set points = points + 50,
        level = least(100, greatest(1, ((points + 50) / 100) + 1))
    where id = new.profile_id;
  end if;

  return new;
end;
$$;

drop trigger if exists user_posts_award_points_trigger on public.user_posts;

create trigger user_posts_award_points_trigger
after update on public.user_posts
for each row
execute function public.award_points_on_post_approval();

create or replace function public.award_points_on_post_like_insert()
returns trigger
language plpgsql
as $$
declare
  target_profile_id uuid;
begin
  select profile_id
  into target_profile_id
  from public.user_posts
  where id = new.post_id and status = 'approved';

  if target_profile_id is not null and target_profile_id <> new.profile_id then
    update public.profiles
    set points = points + 1,
        level = least(100, greatest(1, ((points + 1) / 100) + 1))
    where id = target_profile_id;
  end if;

  return new;
end;
$$;

drop trigger if exists post_likes_award_points_insert_trigger on public.post_likes;

create trigger post_likes_award_points_insert_trigger
after insert on public.post_likes
for each row
execute function public.award_points_on_post_like_insert();

create or replace function public.award_points_on_post_like_delete()
returns trigger
language plpgsql
as $$
declare
  target_profile_id uuid;
begin
  select profile_id
  into target_profile_id
  from public.user_posts
  where id = old.post_id and status = 'approved';

  if target_profile_id is not null and target_profile_id <> old.profile_id then
    update public.profiles
    set points = greatest(0, points - 1),
        level = least(100, greatest(1, ((greatest(0, points - 1)) / 100) + 1))
    where id = target_profile_id;
  end if;

  return old;
end;
$$;

drop trigger if exists post_likes_award_points_delete_trigger on public.post_likes;

create trigger post_likes_award_points_delete_trigger
after delete on public.post_likes
for each row
execute function public.award_points_on_post_like_delete();

create or replace function public.create_like_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_profile_id uuid;
begin
  select profile_id
  into target_profile_id
  from public.user_posts
  where id = new.post_id and status = 'approved';

  if target_profile_id is not null and target_profile_id <> new.profile_id then
    insert into public.post_notifications (
      recipient_profile_id,
      actor_profile_id,
      post_id,
      type,
      body_text
    )
    values (
      target_profile_id,
      new.profile_id,
      new.post_id,
      'like',
      'আপনার public post-এ নতুন like পড়েছে।'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists post_likes_notification_trigger on public.post_likes;

create trigger post_likes_notification_trigger
after insert on public.post_likes
for each row
execute function public.create_like_notification();

create or replace function public.create_comment_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_profile_id uuid;
begin
  select profile_id
  into target_profile_id
  from public.user_posts
  where id = new.post_id and status = 'approved';

  if target_profile_id is not null and target_profile_id <> new.profile_id then
    insert into public.post_notifications (
      recipient_profile_id,
      actor_profile_id,
      post_id,
      type,
      body_text
    )
    values (
      target_profile_id,
      new.profile_id,
      new.post_id,
      'comment',
      'আপনার public post-এ নতুন comment এসেছে।'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists post_comments_notification_trigger on public.post_comments;

create trigger post_comments_notification_trigger
after insert on public.post_comments
for each row
execute function public.create_comment_notification();

create or replace function public.notify_admins_about_post_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.post_notifications (
    recipient_profile_id,
    actor_profile_id,
    post_id,
    type,
    body_text
  )
  select
    profiles.id,
    new.profile_id,
    new.id,
    'post_submission',
    coalesce(new.display_name, 'একজন user') || ' নতুন public post submit করেছে।'
  from public.profiles
  where role = 'admin';

  return new;
end;
$$;

drop trigger if exists user_posts_admin_notification_trigger on public.user_posts;

create trigger user_posts_admin_notification_trigger
after insert on public.user_posts
for each row
execute function public.notify_admins_about_post_submission();

create or replace function public.notify_admins_about_article_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.post_notifications (
    recipient_profile_id,
    actor_profile_id,
    article_id,
    type,
    body_text
  )
  select
    profiles.id,
    new.profile_id,
    new.id,
    'article_submission',
    new.title_bn || ' review-এর জন্য submit হয়েছে।'
  from public.profiles
  where role = 'admin'
    and new.status = 'pending';

  return new;
end;
$$;

drop trigger if exists articles_admin_submission_notification_trigger on public.articles;

create trigger articles_admin_submission_notification_trigger
after insert on public.articles
for each row
execute function public.notify_admins_about_article_submission();

create or replace function public.notify_article_author_about_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.profile_id is not null and new.status in ('approved', 'rejected') and old.status is distinct from new.status then
    insert into public.post_notifications (
      recipient_profile_id,
      actor_profile_id,
      article_id,
      type,
      body_text
    )
    values (
      new.profile_id,
      new.reviewed_by,
      new.id,
      'article_review',
      case
        when new.status = 'approved' then 'আপনার article approved হয়েছে।'
        else 'আপনার article reject করা হয়েছে।'
      end
    );
  end if;

  return new;
end;
$$;

drop trigger if exists articles_author_review_notification_trigger on public.articles;

create trigger articles_author_review_notification_trigger
after update on public.articles
for each row
execute function public.notify_article_author_about_review();

create or replace function public.award_points_on_chat_insert()
returns trigger
language plpgsql
as $$
begin
  if new.sender_id is not null then
    update public.profiles
    set points = points + 5,
        level = least(100, greatest(1, ((points + 5) / 100) + 1))
    where id = new.sender_id;
  end if;

  return new;
end;
$$;

drop trigger if exists chat_messages_award_points_trigger on public.chat_messages;

create trigger chat_messages_award_points_trigger
after insert on public.chat_messages
for each row
execute function public.award_points_on_chat_insert();

alter table public.articles enable row level security;
alter table public.chat_messages enable row level security;
alter table public.profiles enable row level security;
alter table public.user_posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_notifications enable row level security;
alter table public.feedback enable row level security;
alter table public.email_verification_tokens enable row level security;

drop policy if exists "articles are readable by everyone" on public.articles;
drop policy if exists "published articles are readable by everyone" on public.articles;
create policy "published articles are readable by everyone"
on public.articles
for select
to anon, authenticated
using (status = 'approved');

drop policy if exists "admins manage articles" on public.articles;
create policy "admins manage articles"
on public.articles
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

drop policy if exists "authors submit articles" on public.articles;
create policy "authors submit articles"
on public.articles
for insert
to authenticated
with check (
  auth.uid() = profile_id
  and status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
  and published_at is null
);

drop policy if exists "authors read own articles" on public.articles;
create policy "authors read own articles"
on public.articles
for select
to authenticated
using (auth.uid() = profile_id);

drop policy if exists "authors edit pending articles" on public.articles;
create policy "authors edit pending articles"
on public.articles
for update
to authenticated
using (
  auth.uid() = profile_id
  and status = 'pending'
)
with check (
  auth.uid() = profile_id
  and status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
  and published_at is null
);

drop policy if exists "profiles are readable by everyone" on public.profiles;
create policy "profiles are readable by everyone"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "admins read all posts" on public.user_posts;
create policy "admins read all posts"
on public.user_posts
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

drop policy if exists "admins update posts" on public.user_posts;
create policy "admins update posts"
on public.user_posts
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

drop policy if exists "admins read feedback" on public.feedback;
create policy "admins read feedback"
on public.feedback
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  )
);

drop policy if exists "users manage own profile" on public.profiles;
create policy "users manage own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "authenticated can create posts" on public.user_posts;
create policy "authenticated can create posts"
on public.user_posts
for insert
to authenticated
with check (auth.uid() = profile_id);

drop policy if exists "users read own posts" on public.user_posts;
create policy "users read own posts"
on public.user_posts
for select
to authenticated
using (auth.uid() = profile_id);

drop policy if exists "approved posts are public" on public.user_posts;
create policy "approved posts are public"
on public.user_posts
for select
to anon, authenticated
using (status = 'approved');

drop policy if exists "approved post likes are public" on public.post_likes;
create policy "approved post likes are public"
on public.post_likes
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.user_posts
    where id = post_id and status = 'approved'
  )
);

drop policy if exists "authenticated can like approved posts" on public.post_likes;
create policy "authenticated can like approved posts"
on public.post_likes
for insert
to authenticated
with check (
  auth.uid() = profile_id
  and exists (
    select 1
    from public.user_posts
    where id = post_id and status = 'approved'
  )
);

drop policy if exists "users can unlike own likes" on public.post_likes;
create policy "users can unlike own likes"
on public.post_likes
for delete
to authenticated
using (auth.uid() = profile_id);

drop policy if exists "approved post comments are public" on public.post_comments;
create policy "approved post comments are public"
on public.post_comments
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.user_posts
    where id = post_id and status = 'approved'
  )
);

drop policy if exists "authenticated can comment approved posts" on public.post_comments;
create policy "authenticated can comment approved posts"
on public.post_comments
for insert
to authenticated
with check (
  auth.uid() = profile_id
  and exists (
    select 1
    from public.user_posts
    where id = post_id and status = 'approved'
  )
);

drop policy if exists "users read own notifications" on public.post_notifications;
create policy "users read own notifications"
on public.post_notifications
for select
to authenticated
using (auth.uid() = recipient_profile_id);

drop policy if exists "users update own notifications" on public.post_notifications;
create policy "users update own notifications"
on public.post_notifications
for update
to authenticated
using (auth.uid() = recipient_profile_id)
with check (auth.uid() = recipient_profile_id);

drop policy if exists "authenticated can leave feedback" on public.feedback;
create policy "authenticated can leave feedback"
on public.feedback
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "authenticated can insert chat" on public.chat_messages;
create policy "authenticated can insert chat"
on public.chat_messages
for insert
to authenticated
with check (auth.uid() = sender_id);

drop policy if exists "authenticated can read chat" on public.chat_messages;
create policy "authenticated can read chat"
on public.chat_messages
for select
to authenticated
using (true);

drop policy if exists "authenticated can delete own room chat" on public.chat_messages;
create policy "authenticated can delete own room chat"
on public.chat_messages
for delete
to authenticated
using (auth.uid() = sender_id);
