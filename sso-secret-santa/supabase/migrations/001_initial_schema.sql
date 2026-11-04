-- Apply with Supabase CLI or SQL editor. Never expose the service-role key to browsers.
create extension if not exists pgcrypto;

create type public.exchange_status as enum ('draft', 'open', 'drawn', 'completed', 'cancelled');
create type public.participant_status as enum ('invited', 'joined', 'withdrawn');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.exchanges (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  name text not null check (char_length(name) between 2 and 100),
  description text,
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  budget_minor_units integer check (budget_minor_units is null or budget_minor_units between 0 and 100000000),
  exchange_date date,
  invite_token_hash text unique,
  status public.exchange_status not null default 'draft',
  draw_version integer not null default 0 check (draw_version >= 0),
  drawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references public.exchanges(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  invited_email text,
  display_name text not null check (char_length(display_name) between 1 and 80),
  status public.participant_status not null default 'invited',
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  constraint participant_identity_check check (user_id is not null or invited_email is not null)
);
create unique index participant_user_per_exchange on public.participants(exchange_id, user_id) where user_id is not null;
create unique index participant_email_per_exchange on public.participants(exchange_id, lower(invited_email)) where invited_email is not null;

create table public.pairing_exclusions (
  exchange_id uuid not null references public.exchanges(id) on delete cascade,
  participant_a uuid not null references public.participants(id) on delete cascade,
  participant_b uuid not null references public.participants(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (exchange_id, participant_a, participant_b),
  constraint exclusion_no_self check (participant_a <> participant_b)
);

-- Deliberately separate table. RLS limits rows to the participant who is the giver,
-- not the exchange owner. Never return this table through a public participant-list query.
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references public.exchanges(id) on delete cascade,
  giver_participant_id uuid not null references public.participants(id) on delete cascade,
  recipient_participant_id uuid not null references public.participants(id) on delete cascade,
  draw_version integer not null,
  created_at timestamptz not null default now(),
  constraint assignment_not_self check (giver_participant_id <> recipient_participant_id),
  unique (exchange_id, giver_participant_id, draw_version),
  unique (exchange_id, recipient_participant_id, draw_version)
);

create table public.wishlists (
  participant_id uuid primary key references public.participants(id) on delete cascade,
  exchange_id uuid not null references public.exchanges(id) on delete cascade,
  notes text not null default '' check (char_length(notes) <= 3000),
  updated_at timestamptz not null default now()
);

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  url text,
  priority smallint not null default 2 check (priority between 1 and 3),
  created_at timestamptz not null default now(),
  constraint wishlist_url_protocol check (url is null or url ~* '^https?://')
);

create table public.anonymous_messages (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid not null references public.exchanges(id) on delete cascade,
  sender_participant_id uuid not null references public.participants(id) on delete cascade,
  recipient_participant_id uuid not null references public.participants(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now(),
  constraint message_not_self check (sender_participant_id <> recipient_participant_id)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  exchange_id uuid not null references public.exchanges(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (char_length(event_type) between 1 and 80),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index participants_exchange_status_idx on public.participants(exchange_id, status);
create index assignments_giver_idx on public.assignments(giver_participant_id, draw_version);
create index wishlist_items_participant_idx on public.wishlist_items(participant_id);
create index messages_recipient_idx on public.anonymous_messages(recipient_participant_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.exchanges enable row level security;
alter table public.participants enable row level security;
alter table public.pairing_exclusions enable row level security;
alter table public.assignments enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.anonymous_messages enable row level security;
alter table public.audit_events enable row level security;

create policy "profile owner can read profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profile owner can update profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Exchange visibility is restricted to its owner in this starter migration.
-- Add a SECURITY DEFINER membership-check function for participants before enabling
-- participant self-service views. Do not broaden this policy to all authenticated users.
create policy "owner manages own exchanges" on public.exchanges for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Intentionally no direct client policies on assignments, anonymous_messages, exclusions,
-- audit_events, participants, wishlists, or wishlist_items in the starter migration.
-- Add narrowly scoped RPCs / server routes after membership checks. Deny-by-default is safer.
