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

create table if not exists todos (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  is_complete boolean not null default false,
  inserted_at timestamptz not null default now()
);

create index if not exists locations_category_city_idx on locations (lower(category), city);
create index if not exists user_favourites_user_id_idx on user_favourites (user_id);
create index if not exists carbon_entries_user_created_idx on carbon_entries (user_id, created_at desc);
create index if not exists todos_user_inserted_idx on todos (user_id, inserted_at desc);
