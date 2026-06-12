create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  username text,
  role text not null default 'user' check (role in ('user', 'admin')),
  raw_app_meta_data jsonb not null default '{}'::jsonb,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists users_email_lower_idx on users (lower(email));

insert into users (id, email, password_hash, username)
select
  '00000000-0000-4000-8000-000000000001',
  'traveler@terratrace.local',
  '$2b$12$.fFBJuZMXorZqoMbXlouVeFPZTlf/OwJ0MloVRnkUxLM9gpSBmZ9y',
  'Terratrace Traveler'
where not exists (
  select 1 from users where lower(email) = lower('traveler@terratrace.local')
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text,
  public_id text not null unique,
  category text,
  city text,
  country text,
  address text,
  lat double precision,
  lng double precision,
  long double precision,
  eco_certs text[] not null default '{}',
  eco_tags text[] not null default '{}',
  eco_score numeric,
  description text,
  image_url text,
  image_thumb text,
  foursquare_id text unique,
  ex_booking_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_favourites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, location_id)
);

create table if not exists carbon_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  trips jsonb not null,
  total_emissions numeric not null default 0,
  flight_emissions numeric not null default 0,
  car_emissions numeric not null default 0,
  hotel_emissions numeric not null default 0,
  rail_emissions numeric not null default 0,
  bus_emissions numeric not null default 0,
  taxi_emissions numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists carbon_budget_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  year integer not null check (year >= 2000 and year <= 2100),
  annual_budget_kg numeric not null check (annual_budget_kg > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, year)
);

create table if not exists todos (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  is_complete boolean not null default false,
  inserted_at timestamptz not null default now()
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  destination text not null,
  start_date date not null,
  end_date date not null,
  budget numeric,
  interests text[] not null default '{}',
  eco_score integer not null default 75 check (eco_score >= 0 and eco_score <= 100),
  status text not null default 'upcoming' check (status in ('upcoming', 'completed')),
  source text not null default 'manual' check (source in ('manual', 'recommendation', 'local-import')),
  source_request_id text,
  weather_condition text,
  total_estimated_cost numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_date <= end_date),
  unique (user_id, source_request_id)
);

create table if not exists trip_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  location_id uuid references locations(id) on delete set null,
  trip_date date not null,
  day_part text not null default 'flexible' check (day_part in ('morning', 'afternoon', 'evening', 'flexible')),
  title text not null,
  category text not null default 'activity',
  estimated_cost numeric,
  rationale text,
  weather_alternative text,
  community_impact text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table trip_items
  add column if not exists location_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'trip_items_location_id_fkey'
      and conrelid = 'trip_items'::regclass
  ) then
    alter table trip_items
      add constraint trip_items_location_id_fkey
      foreign key (location_id) references locations(id) on delete set null;
  end if;
end $$;

create table if not exists community_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  location_id uuid references locations(id) on delete set null,
  location_name text not null,
  city text,
  country text,
  category text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text not null,
  body text not null,
  practices text[] not null default '{}',
  reviewer_name text not null,
  reviewer_initials text not null,
  verified boolean not null default false,
  accent_color text not null default '#059669',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists community_review_helpful (
  review_id uuid not null references community_reviews(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

create table if not exists community_badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon text not null default 'leaf',
  color text not null default '#059669',
  created_at timestamptz not null default now()
);

create table if not exists community_challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  reward text not null,
  points integer not null check (points >= 0),
  badge_id uuid references community_badges(id) on delete set null,
  category text not null check (category in ('Active', 'Featured', 'Streak')),
  total integer not null check (total > 0),
  unit text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists community_challenge_progress (
  challenge_id uuid not null references community_challenges(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  progress integer not null default 0 check (progress >= 0),
  joined_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create table if not exists community_user_badges (
  badge_id uuid not null references community_badges(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (badge_id, user_id)
);

create index if not exists locations_category_city_idx on locations (lower(category), city);
create index if not exists user_favourites_user_id_idx on user_favourites (user_id);
create index if not exists carbon_entries_user_created_idx on carbon_entries (user_id, created_at desc);
create index if not exists carbon_budget_goals_user_year_idx on carbon_budget_goals (user_id, year);
create index if not exists todos_user_inserted_idx on todos (user_id, inserted_at desc);
create index if not exists trips_user_start_idx on trips (user_id, start_date desc);
create index if not exists trip_items_trip_sort_idx on trip_items (trip_id, trip_date, sort_order);
create index if not exists trip_items_location_id_idx on trip_items (location_id);
create index if not exists community_reviews_created_idx on community_reviews (created_at desc);
create index if not exists community_reviews_category_idx on community_reviews (lower(category));
create index if not exists community_reviews_user_idx on community_reviews (user_id, created_at desc);
create index if not exists community_helpful_user_idx on community_review_helpful (user_id);
create index if not exists community_challenges_active_idx on community_challenges (active, starts_at desc);
create index if not exists community_progress_user_idx on community_challenge_progress (user_id, updated_at desc);
create index if not exists community_user_badges_user_idx on community_user_badges (user_id, earned_at desc);

insert into community_badges (id, slug, name, icon, color)
values
  ('11111111-1111-4111-8111-111111111111', 'first-step', 'First Step', 'leaf', '#059669'),
  ('22222222-2222-4222-8222-222222222222', 'plastic-free', 'Plastic-Free', 'bolt', '#0EA5A4'),
  ('33333333-3333-4333-8333-333333333333', 'local-hero', 'Local Hero', 'map-pin', '#F59E0B'),
  ('44444444-4444-4444-8444-444444444444', 'streak-7', 'Streak: 7', 'fire', '#EF4444'),
  ('55555555-5555-4555-8555-555555555555', 'carbon-crusher', 'Carbon Crusher', 'leaf', '#059669'),
  ('66666666-6666-4666-8666-666666666666', 'rail-champion', 'Rail Champion', 'bolt', '#0EA5A4'),
  ('77777777-7777-4777-8777-777777777777', 'community-voice', 'Community Voice', 'pencil', '#F59E0B'),
  ('88888888-8888-4888-8888-888888888888', 'forest-guardian', 'Forest Guardian', 'globe', '#059669')
on conflict (slug) do update
set name = excluded.name,
    icon = excluded.icon,
    color = excluded.color;

insert into community_challenges (
  id, slug, title, description, reward, points, badge_id, category, total, unit, ends_at
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'low-carbon-week',
    'Low Carbon Week',
    'Keep your daily travel emissions under 5kg CO2 for 7 consecutive days.',
    'Carbon Crusher Badge',
    500,
    '55555555-5555-4555-8555-555555555555',
    'Active',
    7,
    'days',
    now() + interval '2 days'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'train-over-plane',
    'Train Over Plane',
    'Choose rail travel over flights for 3 trips of 500km or less.',
    'Rail Champion Badge',
    750,
    '66666666-6666-4666-8666-666666666666',
    'Featured',
    3,
    'trips',
    now() + interval '28 days'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'eco-reviewer-streak',
    'Eco-Reviewer Streak',
    'Write 10 verified eco-reviews of certified-green stays this month.',
    'Community Voice Badge',
    400,
    '77777777-7777-4777-8777-777777777777',
    'Streak',
    10,
    'reviews',
    now() + interval '12 days'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    'plant-a-forest',
    'Plant a Forest',
    'Offset 1 ton of CO2 by supporting verified reforestation partners.',
    'Forest Guardian Badge',
    1000,
    '88888888-8888-4888-8888-888888888888',
    'Featured',
    1000,
    'kg',
    now() + interval '60 days'
  )
on conflict (slug) do update
set title = excluded.title,
    description = excluded.description,
    reward = excluded.reward,
    points = excluded.points,
    badge_id = excluded.badge_id,
    category = excluded.category,
    total = excluded.total,
    unit = excluded.unit,
    ends_at = excluded.ends_at,
    active = true,
    updated_at = now();

insert into community_reviews (
  id, location_name, city, country, category, rating, reviewer_name, reviewer_initials,
  title, body, practices, verified, accent_color, created_at, updated_at
)
values
  (
    '90000000-0000-4000-8000-000000000001',
    'Selva Verde Lodge',
    'Sarapiqui',
    'Costa Rica',
    'Eco-Lodge',
    5,
    'Priya Sharma',
    'PS',
    'Genuinely sustainable, not just greenwashed',
    'Solar panels powering everything, on-site composting, rainwater harvesting visible across the property. Staff are mostly locals and they actively run reforestation programs guests can join.',
    array['Solar Energy', 'Local Hiring', 'Reforestation', 'Zero Waste'],
    true,
    '#059669',
    now() - interval '3 days',
    now() - interval '3 days'
  ),
  (
    '90000000-0000-4000-8000-000000000002',
    'Kyoto Bamboo Inn',
    'Arashiyama',
    'Japan',
    'Boutique Hotel',
    4,
    'Marcus Weber',
    'MW',
    'Strong on materials, weaker on energy',
    'Beautiful traditional construction with sustainable bamboo and reclaimed wood. Locally-sourced food was excellent. Half-star deduction: energy mix is still mostly grid, no visible renewables.',
    array['Local Food', 'Sustainable Materials', 'Water Conservation'],
    true,
    '#0EA5A4',
    now() - interval '7 days',
    now() - interval '7 days'
  ),
  (
    '90000000-0000-4000-8000-000000000003',
    'Atlas Mountain Trek Co.',
    'Imlil',
    'Morocco',
    'Tour Operator',
    5,
    'Emma Rodriguez',
    'ER',
    'Pack-in pack-out is non-negotiable for them',
    'Guides actively educate every group on Leave No Trace. They contract directly with Berber families and a large share of fees goes back into village schools. Refreshing to see structural impact.',
    array['Leave No Trace', 'Community Investment', 'Fair Wages'],
    true,
    '#F59E0B',
    now() - interval '14 days',
    now() - interval '14 days'
  ),
  (
    '90000000-0000-4000-8000-000000000004',
    'Floating Reed Restaurant',
    'Puno',
    'Peru',
    'Restaurant',
    4,
    'James Okafor',
    'JO',
    'Hyper-local sourcing done right',
    'Everything on the menu was caught or grown within a few kilometers of Lake Titicaca. Owned and run by a Uros family. The only reason it is not five stars is the single-use plastic for takeaway.',
    array['Hyper-Local Food', 'Indigenous-Owned', 'Cultural Heritage'],
    false,
    '#059669',
    now() - interval '21 days',
    now() - interval '21 days'
  )
on conflict (id) do nothing;
