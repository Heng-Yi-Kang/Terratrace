--
-- PostgreSQL database dump
--

\restrict 09q007GiocxxZ2RLQtytBCTeDYuQjToX7IrjcNhpUBJIWO2FyocSCcd0mSwg8eJ

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.user_favourites DROP CONSTRAINT IF EXISTS user_favourites_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_favourites DROP CONSTRAINT IF EXISTS user_favourites_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.trips DROP CONSTRAINT IF EXISTS trips_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.trip_items DROP CONSTRAINT IF EXISTS trip_items_trip_id_fkey;
ALTER TABLE IF EXISTS ONLY public.trip_items DROP CONSTRAINT IF EXISTS trip_items_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.todos DROP CONSTRAINT IF EXISTS todos_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.community_user_badges DROP CONSTRAINT IF EXISTS community_user_badges_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.community_user_badges DROP CONSTRAINT IF EXISTS community_user_badges_badge_id_fkey;
ALTER TABLE IF EXISTS ONLY public.community_reviews DROP CONSTRAINT IF EXISTS community_reviews_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.community_reviews DROP CONSTRAINT IF EXISTS community_reviews_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.community_review_helpful DROP CONSTRAINT IF EXISTS community_review_helpful_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.community_review_helpful DROP CONSTRAINT IF EXISTS community_review_helpful_review_id_fkey;
ALTER TABLE IF EXISTS ONLY public.community_challenges DROP CONSTRAINT IF EXISTS community_challenges_badge_id_fkey;
ALTER TABLE IF EXISTS ONLY public.community_challenge_progress DROP CONSTRAINT IF EXISTS community_challenge_progress_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.community_challenge_progress DROP CONSTRAINT IF EXISTS community_challenge_progress_challenge_id_fkey;
ALTER TABLE IF EXISTS ONLY public.carbon_entries DROP CONSTRAINT IF EXISTS carbon_entries_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.carbon_budget_goals DROP CONSTRAINT IF EXISTS carbon_budget_goals_user_id_fkey;
DROP INDEX IF EXISTS public.users_email_lower_idx;
DROP INDEX IF EXISTS public.user_favourites_user_id_idx;
DROP INDEX IF EXISTS public.trips_user_start_idx;
DROP INDEX IF EXISTS public.trip_items_trip_sort_idx;
DROP INDEX IF EXISTS public.trip_items_location_id_idx;
DROP INDEX IF EXISTS public.todos_user_inserted_idx;
DROP INDEX IF EXISTS public.locations_category_city_idx;
DROP INDEX IF EXISTS public.community_user_badges_user_idx;
DROP INDEX IF EXISTS public.community_reviews_user_idx;
DROP INDEX IF EXISTS public.community_reviews_created_idx;
DROP INDEX IF EXISTS public.community_reviews_category_idx;
DROP INDEX IF EXISTS public.community_progress_user_idx;
DROP INDEX IF EXISTS public.community_helpful_user_idx;
DROP INDEX IF EXISTS public.community_challenges_active_idx;
DROP INDEX IF EXISTS public.carbon_entries_user_created_idx;
DROP INDEX IF EXISTS public.carbon_budget_goals_user_year_idx;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_favourites DROP CONSTRAINT IF EXISTS user_favourites_user_id_location_id_key;
ALTER TABLE IF EXISTS ONLY public.user_favourites DROP CONSTRAINT IF EXISTS user_favourites_pkey;
ALTER TABLE IF EXISTS ONLY public.trips DROP CONSTRAINT IF EXISTS trips_user_id_source_request_id_key;
ALTER TABLE IF EXISTS ONLY public.trips DROP CONSTRAINT IF EXISTS trips_pkey;
ALTER TABLE IF EXISTS ONLY public.trip_items DROP CONSTRAINT IF EXISTS trip_items_pkey;
ALTER TABLE IF EXISTS ONLY public.todos DROP CONSTRAINT IF EXISTS todos_pkey;
ALTER TABLE IF EXISTS ONLY public.locations DROP CONSTRAINT IF EXISTS locations_public_id_key;
ALTER TABLE IF EXISTS ONLY public.locations DROP CONSTRAINT IF EXISTS locations_pkey;
ALTER TABLE IF EXISTS ONLY public.locations DROP CONSTRAINT IF EXISTS locations_foursquare_id_key;
ALTER TABLE IF EXISTS ONLY public.community_user_badges DROP CONSTRAINT IF EXISTS community_user_badges_pkey;
ALTER TABLE IF EXISTS ONLY public.community_reviews DROP CONSTRAINT IF EXISTS community_reviews_pkey;
ALTER TABLE IF EXISTS ONLY public.community_review_helpful DROP CONSTRAINT IF EXISTS community_review_helpful_pkey;
ALTER TABLE IF EXISTS ONLY public.community_challenges DROP CONSTRAINT IF EXISTS community_challenges_slug_key;
ALTER TABLE IF EXISTS ONLY public.community_challenges DROP CONSTRAINT IF EXISTS community_challenges_pkey;
ALTER TABLE IF EXISTS ONLY public.community_challenge_progress DROP CONSTRAINT IF EXISTS community_challenge_progress_pkey;
ALTER TABLE IF EXISTS ONLY public.community_badges DROP CONSTRAINT IF EXISTS community_badges_slug_key;
ALTER TABLE IF EXISTS ONLY public.community_badges DROP CONSTRAINT IF EXISTS community_badges_pkey;
ALTER TABLE IF EXISTS ONLY public.carbon_entries DROP CONSTRAINT IF EXISTS carbon_entries_pkey;
ALTER TABLE IF EXISTS ONLY public.carbon_budget_goals DROP CONSTRAINT IF EXISTS carbon_budget_goals_user_id_year_key;
ALTER TABLE IF EXISTS ONLY public.carbon_budget_goals DROP CONSTRAINT IF EXISTS carbon_budget_goals_pkey;
ALTER TABLE IF EXISTS public.todos ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_favourites;
DROP TABLE IF EXISTS public.trips;
DROP TABLE IF EXISTS public.trip_items;
DROP SEQUENCE IF EXISTS public.todos_id_seq;
DROP TABLE IF EXISTS public.todos;
DROP TABLE IF EXISTS public.locations;
DROP TABLE IF EXISTS public.community_user_badges;
DROP TABLE IF EXISTS public.community_reviews;
DROP TABLE IF EXISTS public.community_review_helpful;
DROP TABLE IF EXISTS public.community_challenges;
DROP TABLE IF EXISTS public.community_challenge_progress;
DROP TABLE IF EXISTS public.community_badges;
DROP TABLE IF EXISTS public.carbon_entries;
DROP TABLE IF EXISTS public.carbon_budget_goals;
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: carbon_budget_goals; Type: TABLE; Schema: public; Owner: terratrace
--

CREATE TABLE public.carbon_budget_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    year integer NOT NULL,
    annual_budget_kg numeric NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT carbon_budget_goals_annual_budget_kg_check CHECK ((annual_budget_kg > (0)::numeric)),
    CONSTRAINT carbon_budget_goals_year_check CHECK (((year >= 2000) AND (year <= 2100)))
);


ALTER TABLE public.carbon_budget_goals OWNER TO terratrace;

--
-- Name: carbon_entries; Type: TABLE; Schema: public; Owner: terratrace
--

CREATE TABLE public.carbon_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    trips jsonb NOT NULL,
    total_emissions numeric DEFAULT 0 NOT NULL,
    flight_emissions numeric DEFAULT 0 NOT NULL,
    car_emissions numeric DEFAULT 0 NOT NULL,
    hotel_emissions numeric DEFAULT 0 NOT NULL,
    rail_emissions numeric DEFAULT 0 NOT NULL,
    bus_emissions numeric DEFAULT 0 NOT NULL,
    taxi_emissions numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.carbon_entries OWNER TO terratrace;

--
-- Name: community_badges; Type: TABLE; Schema: public; Owner: terratrace
--

CREATE TABLE public.community_badges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    icon text DEFAULT 'leaf'::text NOT NULL,
    color text DEFAULT '#059669'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.community_badges OWNER TO terratrace;

--
-- Name: community_challenge_progress; Type: TABLE; Schema: public; Owner: terratrace
--

CREATE TABLE public.community_challenge_progress (
    challenge_id uuid NOT NULL,
    user_id uuid NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT community_challenge_progress_progress_check CHECK ((progress >= 0))
);


ALTER TABLE public.community_challenge_progress OWNER TO terratrace;

--
-- Name: community_challenges; Type: TABLE; Schema: public; Owner: terratrace
--

CREATE TABLE public.community_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    reward text NOT NULL,
    points integer NOT NULL,
    badge_id uuid,
    category text NOT NULL,
    total integer NOT NULL,
    unit text NOT NULL,
    starts_at timestamp with time zone DEFAULT now() NOT NULL,
    ends_at timestamp with time zone,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT community_challenges_category_check CHECK ((category = ANY (ARRAY['Active'::text, 'Featured'::text, 'Streak'::text]))),
    CONSTRAINT community_challenges_points_check CHECK ((points >= 0)),
    CONSTRAINT community_challenges_total_check CHECK ((total > 0))
);


ALTER TABLE public.community_challenges OWNER TO terratrace;

--
-- Name: community_review_helpful; Type: TABLE; Schema: public; Owner: terratrace
--

CREATE TABLE public.community_review_helpful (
    review_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.community_review_helpful OWNER TO terratrace;

--
-- Name: community_reviews; Type: TABLE; Schema: public; Owner: terratrace
--

CREATE TABLE public.community_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    location_id uuid,
    location_name text NOT NULL,
    city text,
    country text,
    category text NOT NULL,
    rating integer NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    practices text[] DEFAULT '{}'::text[] NOT NULL,
    reviewer_name text NOT NULL,
    reviewer_initials text NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    accent_color text DEFAULT '#059669'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT community_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.community_reviews OWNER TO terratrace;

--
-- Name: community_user_badges; Type: TABLE; Schema: public; Owner: terratrace
--

CREATE TABLE public.community_user_badges (
    badge_id uuid NOT NULL,
    user_id uuid NOT NULL,
    earned_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.community_user_badges OWNER TO terratrace;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: terratrace
--

CREATE TABLE public.locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text,
    public_id text NOT NULL,
    category text,
    city text,
    country text,
    address text,
    lat double precision,
    lng double precision,
    long double precision,
    eco_certs text[] DEFAULT '{}'::text[] NOT NULL,
    eco_tags text[] DEFAULT '{}'::text[] NOT NULL,
    eco_score numeric,
    description text,
    image_url text,
    image_thumb text,
    foursquare_id text,
    ex_booking_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.locations OWNER TO terratrace;

--
-- Name: todos; Type: TABLE; Schema: public; Owner: terratrace
--

CREATE TABLE public.todos (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    is_complete boolean DEFAULT false NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.todos OWNER TO terratrace;

--
-- Name: todos_id_seq; Type: SEQUENCE; Schema: public; Owner: terratrace
--

CREATE SEQUENCE public.todos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.todos_id_seq OWNER TO terratrace;

--
-- Name: todos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: terratrace
--

ALTER SEQUENCE public.todos_id_seq OWNED BY public.todos.id;


--
-- Name: trip_items; Type: TABLE; Schema: public; Owner: terratrace
--

CREATE TABLE public.trip_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trip_id uuid NOT NULL,
    trip_date date NOT NULL,
    day_part text DEFAULT 'flexible'::text NOT NULL,
    title text NOT NULL,
    category text DEFAULT 'activity'::text NOT NULL,
    estimated_cost numeric,
    rationale text,
    weather_alternative text,
    community_impact text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    location_id uuid,
    CONSTRAINT trip_items_day_part_check CHECK ((day_part = ANY (ARRAY['morning'::text, 'afternoon'::text, 'evening'::text, 'flexible'::text])))
);


ALTER TABLE public.trip_items OWNER TO terratrace;

--
-- Name: trips; Type: TABLE; Schema: public; Owner: terratrace
--

CREATE TABLE public.trips (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    destination text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    budget numeric,
    interests text[] DEFAULT '{}'::text[] NOT NULL,
    eco_score integer DEFAULT 75 NOT NULL,
    status text DEFAULT 'upcoming'::text NOT NULL,
    source text DEFAULT 'manual'::text NOT NULL,
    source_request_id text,
    weather_condition text,
    total_estimated_cost numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT trips_check CHECK ((start_date <= end_date)),
    CONSTRAINT trips_eco_score_check CHECK (((eco_score >= 0) AND (eco_score <= 100))),
    CONSTRAINT trips_source_check CHECK ((source = ANY (ARRAY['manual'::text, 'recommendation'::text, 'local-import'::text]))),
    CONSTRAINT trips_status_check CHECK ((status = ANY (ARRAY['upcoming'::text, 'completed'::text])))
);


ALTER TABLE public.trips OWNER TO terratrace;

--
-- Name: user_favourites; Type: TABLE; Schema: public; Owner: terratrace
--

CREATE TABLE public.user_favourites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    location_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_favourites OWNER TO terratrace;

--
-- Name: users; Type: TABLE; Schema: public; Owner: terratrace
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    username text,
    role text DEFAULT 'user'::text NOT NULL,
    raw_app_meta_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    raw_user_meta_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text])))
);


ALTER TABLE public.users OWNER TO terratrace;

--
-- Name: todos id; Type: DEFAULT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.todos ALTER COLUMN id SET DEFAULT nextval('public.todos_id_seq'::regclass);


--
-- Data for Name: carbon_budget_goals; Type: TABLE DATA; Schema: public; Owner: terratrace
--

COPY public.carbon_budget_goals (id, user_id, year, annual_budget_kg, created_at, updated_at) FROM stdin;
ee180277-067c-4490-af00-96b6f7bc13ea	524cd269-46f2-4e99-9445-6938d34cefff	2026	1000	2026-06-11 18:46:58.539171+00	2026-06-11 18:46:58.539171+00
\.


--
-- Data for Name: carbon_entries; Type: TABLE DATA; Schema: public; Owner: terratrace
--

COPY public.carbon_entries (id, user_id, trips, total_emissions, flight_emissions, car_emissions, hotel_emissions, rail_emissions, bus_emissions, taxi_emissions, created_at) FROM stdin;
9f2f6d71-1070-4e40-ac40-00cadf8908a0	524cd269-46f2-4e99-9445-6938d34cefff	[{"id": "1", "type": "flight", "isReturn": true, "distanceKm": 6, "flightClass": "business"}]	3.7987200000000003	3.7987200000000003	0	0	0	0	0	2026-06-10 16:10:43.85383+00
3c16fd6d-2208-487f-89d4-b1cc4ed6e02b	524cd269-46f2-4e99-9445-6938d34cefff	[{"id": "1", "type": "flight", "isReturn": true, "distanceKm": 6, "flightClass": "business"}, {"id": "2", "type": "car", "CarType": "diesel", "distanceKm": 25, "passengers": 1}]	8.12472	3.7987200000000003	4.326	0	0	0	0	2026-06-10 16:11:16.115355+00
1aad162d-2af2-432c-ae28-dd037dce49ed	524cd269-46f2-4e99-9445-6938d34cefff	[{"id": "1", "type": "flight", "isReturn": true, "distanceKm": 800, "flightClass": "business"}]	506.49600000000004	506.49600000000004	0	0	0	0	0	2026-06-11 15:42:21.961399+00
2e17b7fa-01c8-4474-a790-bccff2a0db84	524cd269-46f2-4e99-9445-6938d34cefff	[{"id": "1", "type": "flight", "isReturn": true, "distanceKm": 800, "flightClass": "business"}]	506.49600000000004	506.49600000000004	0	0	0	0	0	2026-06-11 15:42:47.084679+00
60e674f0-aa85-4b54-8f23-df8bce392b4d	524cd269-46f2-4e99-9445-6938d34cefff	[{"id": "1", "type": "flight", "isReturn": true, "distanceKm": 800, "flightClass": "business"}, {"id": "2", "type": "car", "CarType": "petrol", "distanceKm": 100, "passengers": 1}]	522.768	506.49600000000004	16.272000000000002	0	0	0	0	2026-06-11 15:43:36.15896+00
fc55b5bd-dc63-4acf-9861-f869a3a08a14	524cd269-46f2-4e99-9445-6938d34cefff	[{"id": "1", "type": "flight", "isReturn": false, "distanceKm": 900, "flightClass": "economy"}]	98.244	98.244	0	0	0	0	0	2026-06-11 15:46:07.087416+00
8605bd13-32e7-4482-b1e3-1c690cdbdd07	524cd269-46f2-4e99-9445-6938d34cefff	[{"id": "1", "type": "hotel", "nights": 9, "HotelType": "standard"}]	225	0	0	225	0	0	0	2026-06-11 15:49:36.317174+00
1e95b149-e018-44cb-8f63-00dba1a50181	524cd269-46f2-4e99-9445-6938d34cefff	[{"id": "1", "type": "flight", "isReturn": false, "distanceKm": 2, "flightClass": "economy"}]	0.21832	0.21832	0	0	0	0	0	2026-06-11 15:52:35.575916+00
998cd5d2-9f4e-4f81-ad12-353d4f908c17	524cd269-46f2-4e99-9445-6938d34cefff	[{"id": "1", "type": "flight", "isReturn": false, "distanceKm": 2, "flightClass": "economy"}, {"id": "2", "type": "flight", "isReturn": true, "distanceKm": 900, "flightClass": "economy"}]	196.70632	196.70632	0	0	0	0	0	2026-06-11 15:53:02.783075+00
772fb2f9-7adc-4552-9d97-eaf7d4d9728c	524cd269-46f2-4e99-9445-6938d34cefff	[{"id": "1", "type": "flight", "isReturn": false, "distanceKm": 90, "flightClass": "economy"}]	9.824399999999999	9.824399999999999	0	0	0	0	0	2026-06-11 15:55:30.371925+00
dda2d766-9ae9-4db0-945a-bf87fb8afc61	d54174f7-e22d-4770-9bd2-9fb5bcbbdcf9	[{"id": "1", "type": "flight", "isReturn": false, "distanceKm": 900, "flightClass": "business"}]	284.904	284.904	0	0	0	0	0	2026-06-11 20:53:46.018468+00
e898a3be-d302-4390-a904-8bca035f0dee	524cd269-46f2-4e99-9445-6938d34cefff	[{"id": "1", "type": "flight", "isReturn": false, "distanceKm": 900, "flightClass": "economy"}]	98.244	98.244	0	0	0	0	0	2026-06-11 20:54:37.775072+00
6c03f880-eac2-4627-a21c-b2470729d46d	524cd269-46f2-4e99-9445-6938d34cefff	[{"id": "1", "type": "flight", "isReturn": true, "distanceKm": 900, "flightClass": "business"}]	569.808	569.808	0	0	0	0	0	2026-06-11 21:09:39.840499+00
\.


--
-- Data for Name: community_badges; Type: TABLE DATA; Schema: public; Owner: terratrace
--

COPY public.community_badges (id, slug, name, icon, color, created_at) FROM stdin;
11111111-1111-4111-8111-111111111111	first-step	First Step	leaf	#059669	2026-06-11 09:59:39.788225+00
22222222-2222-4222-8222-222222222222	plastic-free	Plastic-Free	bolt	#0EA5A4	2026-06-11 09:59:39.788225+00
33333333-3333-4333-8333-333333333333	local-hero	Local Hero	map-pin	#F59E0B	2026-06-11 09:59:39.788225+00
44444444-4444-4444-8444-444444444444	streak-7	Streak: 7	fire	#EF4444	2026-06-11 09:59:39.788225+00
55555555-5555-4555-8555-555555555555	carbon-crusher	Carbon Crusher	leaf	#059669	2026-06-11 09:59:39.788225+00
66666666-6666-4666-8666-666666666666	rail-champion	Rail Champion	bolt	#0EA5A4	2026-06-11 09:59:39.788225+00
77777777-7777-4777-8777-777777777777	community-voice	Community Voice	pencil	#F59E0B	2026-06-11 09:59:39.788225+00
88888888-8888-4888-8888-888888888888	forest-guardian	Forest Guardian	globe	#059669	2026-06-11 09:59:39.788225+00
\.


--
-- Data for Name: community_challenge_progress; Type: TABLE DATA; Schema: public; Owner: terratrace
--

COPY public.community_challenge_progress (challenge_id, user_id, progress, joined_at, completed_at, updated_at) FROM stdin;
aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa	524cd269-46f2-4e99-9445-6938d34cefff	7	2026-06-11 15:36:36.690434+00	2026-06-11 15:36:41.721+00	2026-06-11 15:36:41.720755+00
cccccccc-cccc-4ccc-8ccc-cccccccccccc	524cd269-46f2-4e99-9445-6938d34cefff	10	2026-06-11 15:37:07.456436+00	2026-06-11 15:37:09.529+00	2026-06-11 15:37:09.529451+00
dddddddd-dddd-4ddd-8ddd-dddddddddddd	524cd269-46f2-4e99-9445-6938d34cefff	12	2026-06-11 15:37:12.548717+00	\N	2026-06-11 15:37:15.641928+00
bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb	524cd269-46f2-4e99-9445-6938d34cefff	3	2026-06-11 15:37:17.00985+00	2026-06-11 15:37:17.502+00	2026-06-11 15:37:17.502154+00
\.


--
-- Data for Name: community_challenges; Type: TABLE DATA; Schema: public; Owner: terratrace
--

COPY public.community_challenges (id, slug, title, description, reward, points, badge_id, category, total, unit, starts_at, ends_at, active, created_at, updated_at) FROM stdin;
aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa	low-carbon-week	Low Carbon Week	Keep your daily travel emissions under 5kg CO2 for 7 consecutive days.	Carbon Crusher Badge	500	55555555-5555-4555-8555-555555555555	Active	7	days	2026-06-11 09:59:39.789072+00	2026-06-13 21:59:20.516948+00	t	2026-06-11 09:59:39.789072+00	2026-06-11 21:59:20.516948+00
bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb	train-over-plane	Train Over Plane	Choose rail travel over flights for 3 trips of 500km or less.	Rail Champion Badge	750	66666666-6666-4666-8666-666666666666	Featured	3	trips	2026-06-11 09:59:39.789072+00	2026-07-09 21:59:20.516948+00	t	2026-06-11 09:59:39.789072+00	2026-06-11 21:59:20.516948+00
cccccccc-cccc-4ccc-8ccc-cccccccccccc	eco-reviewer-streak	Eco-Reviewer Streak	Write 10 verified eco-reviews of certified-green stays this month.	Community Voice Badge	400	77777777-7777-4777-8777-777777777777	Streak	10	reviews	2026-06-11 09:59:39.789072+00	2026-06-23 21:59:20.516948+00	t	2026-06-11 09:59:39.789072+00	2026-06-11 21:59:20.516948+00
dddddddd-dddd-4ddd-8ddd-dddddddddddd	plant-a-forest	Plant a Forest	Offset 1 ton of CO2 by supporting verified reforestation partners.	Forest Guardian Badge	1000	88888888-8888-4888-8888-888888888888	Featured	1000	kg	2026-06-11 09:59:39.789072+00	2026-08-10 21:59:20.516948+00	t	2026-06-11 09:59:39.789072+00	2026-06-11 21:59:20.516948+00
\.


--
-- Data for Name: community_review_helpful; Type: TABLE DATA; Schema: public; Owner: terratrace
--

COPY public.community_review_helpful (review_id, user_id, created_at) FROM stdin;
90000000-0000-4000-8000-000000000001	524cd269-46f2-4e99-9445-6938d34cefff	2026-06-11 15:35:51.604999+00
90000000-0000-4000-8000-000000000003	524cd269-46f2-4e99-9445-6938d34cefff	2026-06-11 15:35:53.105984+00
\.


--
-- Data for Name: community_reviews; Type: TABLE DATA; Schema: public; Owner: terratrace
--

COPY public.community_reviews (id, user_id, location_id, location_name, city, country, category, rating, title, body, practices, reviewer_name, reviewer_initials, verified, accent_color, created_at, updated_at) FROM stdin;
90000000-0000-4000-8000-000000000001	\N	\N	Selva Verde Lodge	Sarapiqui	Costa Rica	Eco-Lodge	5	Genuinely sustainable, not just greenwashed	Solar panels powering everything, on-site composting, rainwater harvesting visible across the property. Staff are mostly locals and they actively run reforestation programs guests can join.	{"Solar Energy","Local Hiring",Reforestation,"Zero Waste"}	Priya Sharma	PS	t	#059669	2026-06-08 09:59:39.790094+00	2026-06-08 09:59:39.790094+00
90000000-0000-4000-8000-000000000002	\N	\N	Kyoto Bamboo Inn	Arashiyama	Japan	Boutique Hotel	4	Strong on materials, weaker on energy	Beautiful traditional construction with sustainable bamboo and reclaimed wood. Locally-sourced food was excellent. Half-star deduction: energy mix is still mostly grid, no visible renewables.	{"Local Food","Sustainable Materials","Water Conservation"}	Marcus Weber	MW	t	#0EA5A4	2026-06-04 09:59:39.790094+00	2026-06-04 09:59:39.790094+00
90000000-0000-4000-8000-000000000003	\N	\N	Atlas Mountain Trek Co.	Imlil	Morocco	Tour Operator	5	Pack-in pack-out is non-negotiable for them	Guides actively educate every group on Leave No Trace. They contract directly with Berber families and a large share of fees goes back into village schools. Refreshing to see structural impact.	{"Leave No Trace","Community Investment","Fair Wages"}	Emma Rodriguez	ER	t	#F59E0B	2026-05-28 09:59:39.790094+00	2026-05-28 09:59:39.790094+00
90000000-0000-4000-8000-000000000004	\N	\N	Floating Reed Restaurant	Puno	Peru	Restaurant	4	Hyper-local sourcing done right	Everything on the menu was caught or grown within a few kilometers of Lake Titicaca. Owned and run by a Uros family. The only reason it is not five stars is the single-use plastic for takeaway.	{"Hyper-Local Food",Indigenous-Owned,"Cultural Heritage"}	James Okafor	JO	f	#059669	2026-05-21 09:59:39.790094+00	2026-05-21 09:59:39.790094+00
b85fdca9-dd63-4317-8bc1-affe32bb8547	524cd269-46f2-4e99-9445-6938d34cefff	\N	test locat	kl	malaysia	Eco-Lodge	5	test	test test	{"local hiring"}	yk	Y	t	#059669	2026-06-11 15:35:48.320074+00	2026-06-11 15:35:48.320074+00
\.


--
-- Data for Name: community_user_badges; Type: TABLE DATA; Schema: public; Owner: terratrace
--

COPY public.community_user_badges (badge_id, user_id, earned_at) FROM stdin;
55555555-5555-4555-8555-555555555555	524cd269-46f2-4e99-9445-6938d34cefff	2026-06-11 15:36:41.720755+00
77777777-7777-4777-8777-777777777777	524cd269-46f2-4e99-9445-6938d34cefff	2026-06-11 15:37:09.529451+00
66666666-6666-4666-8666-666666666666	524cd269-46f2-4e99-9445-6938d34cefff	2026-06-11 15:37:17.502154+00
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: terratrace
--

COPY public.locations (id, name, public_id, category, city, country, address, lat, lng, long, eco_certs, eco_tags, eco_score, description, image_url, image_thumb, foursquare_id, ex_booking_url, created_at, updated_at) FROM stdin;
3db37352-bfce-46e1-a6e9-e339ab20fa34	都営 浜田山四丁目第2アパート EV充電スタンド	DAfrnf	transport	Tokyo	Japan	浜田山4丁目959, 杉並区, 東京都, 168-0065	35.68283	139.634071	139.634071	{"Rainforest Alliance Certified","Green Globe Certified"}	{low-emission,shared-mobility,ev}	78	This EV charging station at Toei Hamadayama 4-chome Apartment supports a greener urban lifestyle by facilitating low-emission transport for all residents. By integrating shared-mobility infrastructure into the neighborhood, it makes sustainable electric vehicle charging both accessible and convenient.	\N	\N	69808955e7dd691fbc660fd6	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
68e7e98e-508f-4c40-b063-0351a1840771	Very Hotel - Very Good Stay	aHf46o	accommodation	Penang	Malaysia	28, Lebuh Penang, George Town, 10200 Georgetown, Pulau Pinang	5.418406	100.341072	100.341072	{"EarthCheck Gold"}	{solar-powered,eco-stay,rainwater-harvesting}	60	Experience a serene escape at Very Hotel, where modern comfort meets sustainability through our advanced solar-powered energy and efficient rainwater-harvesting systems. Our eco-stay in Penang invites you to enjoy a mindful retreat that treads lightly on the planet while ensuring a truly memorable visit.	https://images.unsplash.com/photo-1767440398636-eb35f46bb342?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyNjV8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1767440398636-eb35f46bb342?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyNjV8&ixlib=rb-4.1.0&q=80&w=200	645f36bdded414161b23fd1f	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
088357fa-226f-499b-be1e-4c35157c7416	iStay Hotel	CPf7M9	accommodation	Penang	Malaysia	94-96 Rangoon Road (Jalan Macalister), 10400 Georgetown, Pulau Pinang	5.416742	100.32375	100.32375	{"Green Star"}	{solar-powered,rainwater-harvesting,green-certified}	80	Experience a conscious stay at iStay Hotel, where our green-certified building seamlessly integrates solar-powered energy and advanced rainwater-harvesting systems. Immerse yourself in the heart of Penang while enjoying modern comfort designed with deep respect for the environment.	https://images.unsplash.com/photo-1762255121620-3ca4c551404c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyMjN8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1762255121620-3ca4c551404c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyMjN8&ixlib=rb-4.1.0&q=80&w=200	59854bf1f5e9d71716fe180d	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
be5bc768-e0e3-426d-b0b2-d19837644270	Tokyu Stay Shibuya Shin-minamiguchi (東急ステイ渋谷新南口)	Ns2fBN	accommodation	Tokyo	Japan	渋谷3-26-21, 渋谷区, 東京都, 150-0002	35.6548021545862	139.705145806074	139.705145806074	{"Green Key","LEED Gold"}	{eco-stay,solar-powered,plastic-free}	85	Experience a mindful urban retreat at Tokyu Stay Shibuya Shin-minamiguchi, where our commitment to the planet is integrated into every guest experience through solar-powered energy systems. By prioritizing a plastic-free environment and promoting sustainable eco-stay practices, we offer a refreshing way to explore Tokyo with a lighter carbon footprint.	https://images.unsplash.com/photo-1776761604095-e8dd031864d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1OTV8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1776761604095-e8dd031864d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1OTV8&ixlib=rb-4.1.0&q=80&w=200	4c06e2e1b4aa0f47d0d16462	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
7c181ec5-3247-43fa-97cf-b82e639569bc	Tokyu Stay Aoyama Premier (東急ステイ青山プレミア)	pzq4Rx	accommodation	Tokyo	Japan	南青山2-27-18, 港区, 東京都, 107-0062	35.6685797703422	139.71660668225	139.71660668225	{"Rainforest Alliance Certified","EarthCheck Gold"}	{plastic-free,solar-powered,rainwater-harvesting}	64	Tokyu Stay Aoyama Premier elevates your Tokyo experience through an advanced eco-conscious design that integrates solar-powered electricity and innovative rainwater-harvesting systems. Guests can enjoy a refined urban retreat while supporting our commitment to sustainability, evidenced by our comprehensive plastic-free amenities and waste-reduction initiatives.	https://images.unsplash.com/photo-1767440398636-eb35f46bb342?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1ODF8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1767440398636-eb35f46bb342?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1ODF8&ixlib=rb-4.1.0&q=80&w=200	4b99bf5ff964a520cd8f35e3	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
67016a14-cfd6-4ba0-9bac-9f5bbd0fea14	Tokyu Stay Shinjuku (東急ステイ新宿)	jMYbom	accommodation	Tokyo	Japan	新宿3-7-1, 新宿区, 東京都, 160-0022	35.6908833074304	139.706124592751	139.706124592751	{"Green Star","EarthCheck Silver","Green Globe Certified"}	{plastic-free,eco-stay,rainwater-harvesting}	84	Experience a sustainable Tokyo getaway at Tokyu Stay Shinjuku, where our commitment to an eco-stay includes innovative rainwater-harvesting systems to minimize environmental impact. We prioritize the planet by maintaining a plastic-free environment throughout our guest facilities, ensuring your comfort aligns with responsible travel practices.	https://images.unsplash.com/photo-1771232427978-c4411e365843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1NzJ8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1771232427978-c4411e365843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1NzJ8&ixlib=rb-4.1.0&q=80&w=200	554dac7d498ece2b65347ad8	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
1aeb57b2-e460-4fa4-9a60-b147f00cab41	Green House @ Popus	SwXtZT	accommodation	Penang	Malaysia	8,10,12 Popus Lane, 10050 Georgetown, Pulau Pinang	5.419552	100.329423	100.329423	{"LEED Gold","EarthCheck Gold"}	{plastic-free,carbon-neutral,rainwater-harvesting}	98	Experience a rejuvenating stay at Green House @ Popus, where our commitment to a carbon-neutral footprint and innovative rainwater-harvesting systems ensures your comfort aligns with nature. We invite you to enjoy a refined, plastic-free environment thoughtfully designed to preserve the pristine beauty of Penang for generations to come.	https://images.unsplash.com/photo-1776761420412-e6451f458162?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyMTB8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1776761420412-e6451f458162?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyMTB8&ixlib=rb-4.1.0&q=80&w=200	067d944b37494c5d57efb98f	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
c90ae6fb-fc37-40b1-8e33-f051f8d5ab70	Good 2 Stay Hotel	5bDj6Q	accommodation	Malacca	Malaysia	75000 Melaka, Melaka	2.188931	102.24709	102.24709	{"Green Key","Green Globe Certified","Rainforest Alliance Certified"}	{rainwater-harvesting,green-certified,carbon-neutral}	75	Experience a guilt-free getaway at Good 2 Stay Hotel in Malacca, where our green-certified sanctuary operates as a carbon-neutral retreat for the conscious traveler. We invite you to relax in comfort supported by eco-conscious innovations, including an advanced rainwater-harvesting system that helps preserve our local resources.	https://images.unsplash.com/photo-1759150594926-69079830088f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1MTN8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1759150594926-69079830088f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1MTN8&ixlib=rb-4.1.0&q=80&w=200	65c6c41a0db4476912a5d845	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
9922fc23-a368-4f85-8485-f0e355037259	Harbor Stay Hotel	GtMdDu	accommodation	Malacca	Malaysia	Hotel Harbour Stay, G19, Jalan Pm 3, Plaza Mahkota, Malacca, Malaysia, 75000 Melaka, Melaka	2.1897218	102.247116	102.247116	{"LEED Silver","Rainforest Alliance Certified","LEED Gold"}	{eco-stay,carbon-neutral,plastic-free}	70	Experience a serene getaway at Harbor Stay Hotel, where our carbon-neutral sanctuary in the heart of Malacca seamlessly blends luxury with mindful living. We invite you to enjoy a completely plastic-free environment designed to protect our coastal heritage while providing a premium eco-stay experience.	https://images.unsplash.com/photo-1759150594926-69079830088f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1MDZ8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1759150594926-69079830088f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1MDZ8&ixlib=rb-4.1.0&q=80&w=200	65ad0615b049455111934b27	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
4b9801a4-0524-4e3a-869f-a74d0cd42dd0	Apa Kaba Home & Stay	KudKpB	accommodation	Malacca	Malaysia		2.19293334874516	102.254554188349	102.254554188349	{"Green Key","LEED Gold","Green Globe Certified"}	{plastic-free,green-certified,eco-stay}	88	Experience a mindful getaway at Apa Kaba Home & Stay, a green-certified retreat in Malacca dedicated to preserving the environment. Our plastic-free sanctuary offers an authentic eco-stay experience where sustainable living meets comfort.	https://images.unsplash.com/photo-1774280954999-9758f11f3d41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0NzB8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1774280954999-9758f11f3d41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0NzB8&ixlib=rb-4.1.0&q=80&w=200	4d49145011a36ea8ead9231c	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
efc3f715-a86f-414d-b190-646ece9e7b04	Eco Tree Hotel	AZEhSR	accommodation	Malacca	Malaysia		2.18720491442911	102.255813351463	102.255813351463	{"ISO 14001"}	{solar-powered,carbon-neutral,rainwater-harvesting}	63	Experience a refreshing stay at Eco Tree Hotel in Malacca, where our commitment to a carbon-neutral footprint is powered entirely by advanced solar energy. Guests can enjoy premium comfort knowing every drop of water is thoughtfully managed through our efficient onsite rainwater-harvesting system.	https://images.unsplash.com/photo-1760942994028-faea27e67045?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0ODd8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1760942994028-faea27e67045?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0ODd8&ixlib=rb-4.1.0&q=80&w=200	53527107498e67ae3bcd4bf9	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
35470e0b-dcb4-40a6-abae-b1fb8e7f5d72	Kings Green Hotel City Centre	L6Lpqk	accommodation	Malacca	Malaysia	No 28 (Jalan Tun Perak), 75300 Melaka, Melaka	2.20928783936128	102.243844578408	102.243844578408	{"EarthCheck Silver"}	{rainwater-harvesting,carbon-neutral,solar-powered}	66	Experience a sustainable sanctuary at Kings Green Hotel City Centre, where our commitment to a carbon-neutral footprint is powered by advanced solar energy systems. Guests can enjoy guilt-free comfort knowing our operations integrate innovative rainwater-harvesting technologies to preserve Malacca's precious natural resources.	https://images.unsplash.com/photo-1759150594926-69079830088f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0OTd8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1759150594926-69079830088f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0OTd8&ixlib=rb-4.1.0&q=80&w=200	52496cb011d219fd0088b800	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
31646b51-1c68-443a-8798-672cbc0a9acd	Tokyu Stay Nishi-Shinjuku (東急ステイ西新宿)	kDurUM	accommodation	Tokyo	Japan	西新宿5-9-8, 新宿区, 東京都, 160-0023	35.6908655375881	139.686954809554	139.686954809554	{"LEED Gold","Green Key"}	{eco-stay,plastic-free,carbon-neutral}	87	Tokyu Stay Nishi-Shinjuku offers a sophisticated urban retreat committed to an eco-friendly stay through its comprehensive plastic-free initiatives and waste-reduction policies. By prioritizing carbon-neutral operations, we ensure that your visit to the heart of Tokyo supports a healthier planet without compromising on comfort.	https://images.unsplash.com/photo-1759147806909-970d2258a50c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1ODl8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1759147806909-970d2258a50c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1ODl8&ixlib=rb-4.1.0&q=80&w=200	4c8665f5d34ca1435a644f80	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
97b245e2-ba63-472b-8011-6dc3388b7867	Tokyu Stay Shibuya (東急ステイ渋谷)	sgHGGy	accommodation	Tokyo	Japan	神泉町8-14, 渋谷区, 東京都, 150-0045	35.655505	139.693538	139.693538	{"Rainforest Alliance Certified"}	{solar-powered,rainwater-harvesting,carbon-neutral}	78	Tokyu Stay Shibuya offers a refined urban retreat that operates with a net-zero carbon footprint, powered entirely by renewable solar energy. Our commitment to the planet extends to our sophisticated infrastructure, which utilizes advanced rainwater-harvesting systems to minimize our environmental impact.	https://images.unsplash.com/photo-1758775150908-45951c9bbe71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1ODZ8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1758775150908-45951c9bbe71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1ODZ8&ixlib=rb-4.1.0&q=80&w=200	4c25f65df1272d7fe6a085c5	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
b799900c-70b9-4f64-8fc9-ac94d0e5a792	Stay Green Inn Hotel	HCPiwm	accommodation	Kuala Lumpur	Malaysia	Kuala Lumpur, Federal Territory of Kuala Lum	3.145851	101.696978	101.696978	{"EarthCheck Gold","LEED Silver"}	{carbon-neutral,plastic-free,eco-stay}	89	Experience a guilt-free getaway at Stay Green Inn, Kuala Lumpur’s premier carbon-neutral destination dedicated to a completely plastic-free guest experience. Relax in our thoughtfully curated eco-stay, where modern luxury meets a profound commitment to preserving the environment.	https://images.unsplash.com/photo-1762255121620-3ca4c551404c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzNTl8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1762255121620-3ca4c551404c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzNTl8&ixlib=rb-4.1.0&q=80&w=200	4e1e99b3d4c0fc6e343ab286	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
483862d9-cac6-4846-9972-748332eb6750	The OM Stay 唵居	hTp9fW	accommodation	Kuala Lumpur	Malaysia	10th Floor, Menara Ruyi (Seputeh), Kuala Lumpur, Kuala Lumpur	3.12222398290476	101.681597738917	101.681597738917	{"Green Globe Certified","Green Key","LEED Gold"}	{solar-powered,rainwater-harvesting,eco-stay}	84	Experience a serene urban retreat at The OM Stay, where modern comfort meets mindful living through our dedicated solar-powered energy and rainwater-harvesting systems. Nestled in the heart of Kuala Lumpur, our eco-stay offers a conscious sanctuary designed to minimize your environmental footprint without compromising on luxury.	https://images.unsplash.com/photo-1608387371413-f2566ac510e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzNjR8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1608387371413-f2566ac510e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzNjR8&ixlib=rb-4.1.0&q=80&w=200	5715fbe8498e93b0de0e17b4	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
da2996c8-27d4-4293-9f2b-fdfc7dc94184	Eco Hotel	EfgVAA	accommodation	Kuala Lumpur	Malaysia	Jalan Pudu, 59100 Kuala Lumpur, KL	3.138708	101.709738	101.709738	{"Green Globe Certified","Green Star","LEED Gold"}	{carbon-neutral,solar-powered,plastic-free}	72	Experience a guilt-free retreat in the heart of Kuala Lumpur at our carbon-neutral sanctuary, where every stay is powered entirely by clean solar energy. We invite you to enjoy a refined hospitality experience rooted in conscious living, featuring a strictly plastic-free environment designed to protect our planet.	https://images.unsplash.com/photo-1760942994028-faea27e67045?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzNzB8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1760942994028-faea27e67045?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzNzB8&ixlib=rb-4.1.0&q=80&w=200	5be6e4a81c0b34002c5bfcf2	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
747565c8-9d0e-480a-8cbb-329643084871	Stay with Bintang	ouaeeS	accommodation	Kuala Lumpur	Malaysia	51-A Changkat Bukit Bintang, 50200 Kuala Lumpur, Kuala Lumpur	3.14711275535659	101.708340538735	101.708340538735	{"EarthCheck Silver","Rainforest Alliance Certified"}	{plastic-free,green-certified,rainwater-harvesting}	63	Experience a guilt-free retreat at Stay with Bintang, a green-certified urban sanctuary dedicated to a plastic-free environment. Your stay directly supports our commitment to the planet through advanced rainwater-harvesting systems that conserve Kuala Lumpur's precious natural resources.	https://images.unsplash.com/photo-1771232427978-c4411e365843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzNzV8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1771232427978-c4411e365843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzNzV8&ixlib=rb-4.1.0&q=80&w=200	6489d1a1799e1a3ffa2484b7	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
b9bbc65c-03c0-4a89-a833-ad12eb97fb77	Hotel Greenland	z7mgwG	accommodation	Kuala Lumpur	Malaysia	No. 63-1, Jalan Alor, 50200 Bukit Bintang, Kuala Lumpur	3.145854	101.7090258	101.7090258	{"EarthCheck Gold","Green Globe Certified"}	{solar-powered,carbon-neutral,eco-stay}	71	Experience a guilt-free urban retreat at Hotel Greenland, Kuala Lumpur’s premier carbon-neutral destination powered entirely by renewable solar energy. Our commitment to sustainability ensures that every aspect of your eco-stay supports a greener future without compromising on modern luxury.	https://images.unsplash.com/photo-1759150594926-69079830088f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzODR8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1759150594926-69079830088f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzODR8&ixlib=rb-4.1.0&q=80&w=200	4d7de9c66174a35d9af27e03	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
da487720-21ef-401b-a832-5362c5a79190	Lili Stay Lebuh Melayu	3gEFDr	accommodation	Penang	Malaysia	33 Lebuh Melayu, 10100 Georgetown, Pulau Pinang	5.413545	100.335027	100.335027	{"EarthCheck Gold","EarthCheck Silver","Green Key"}	{eco-stay,carbon-neutral,rainwater-harvesting}	96	Experience a rejuvenating escape at Lili Stay Lebuh Melayu, a premier eco-stay in the heart of Penang that offsets its footprint to remain fully carbon-neutral. Our heritage retreat thoughtfully integrates rainwater-harvesting systems to provide a sustainable sanctuary that honors both history and the environment.	https://images.unsplash.com/photo-1760942994028-faea27e67045?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyNDF8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1760942994028-faea27e67045?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyNDF8&ixlib=rb-4.1.0&q=80&w=200	69a821a0d96ae457f4e7b3dc	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
d0cde971-efa1-4141-b58a-8bd81698ab33	Stay @ Twonine4	WkbDn4	accommodation	Penang	Malaysia	294, Lebuh Pantai, 10300 Georgetown, Pulau Pinang	5.414099	100.33783	100.33783	{"EarthCheck Gold"}	{plastic-free,green-certified,eco-stay}	83	Experience a refreshing escape at Stay @ Twonine4, a premier green-certified accommodation dedicated to providing a premium eco-stay experience in the heart of Penang. We invite you to enjoy a guilt-free retreat in our thoughtfully curated plastic-free environment designed to protect our natural surroundings.	https://images.unsplash.com/photo-1774280954999-9758f11f3d41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyNTd8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1774280954999-9758f11f3d41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyNTd8&ixlib=rb-4.1.0&q=80&w=200	5b6fad8d396de0002c6df453	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
ded2a61b-e39a-4919-8fa1-63c22f33f2be	Old Farmosa Vegetarian Restaurant	ueFFoc	dining	Malacca	Malaysia	Melaka	2.245657	102.27587921	102.27587921	{"Green Key","EarthCheck Gold","LEED Silver"}	{vegetarian,compostable-packaging,locally-sourced}	79	Old Farmosa Vegetarian Restaurant offers a nutritious selection of plant-based dishes crafted exclusively from fresh, locally-sourced produce harvested in Malacca. Every meal is served in eco-friendly, compostable packaging to ensure your dining experience supports both your health and a greener planet.	https://images.unsplash.com/photo-1668072921628-6e024f6aadd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1NjF8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1668072921628-6e024f6aadd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1NjF8&ixlib=rb-4.1.0&q=80&w=200	4b77e892f964a52063ae2ee3	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
ccef7f6a-d9fb-4d6d-8b3a-b52eb5c4f142	Pinxin Vegan Cuisine (Pin Xin Vegan Cuisine 品馨)	8yj7yX	dining	Penang	Malaysia	38 Lebuh Tye Sin, 10300 Georgetown, Pulau Pinang	5.41022333835114	100.330626603338	100.330626603338	{"LEED Gold"}	{zero-waste,farm-to-table,locally-sourced}	91	Pinxin Vegan Cuisine celebrates the vibrant flavors of Penang by transforming locally-sourced, farm-to-table ingredients into wholesome plant-based dishes. Our kitchen is committed to a zero-waste philosophy, ensuring that every meal honors the environment as much as your palate.	https://images.unsplash.com/photo-1770818743998-c1ddbed16e56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyNzV8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1770818743998-c1ddbed16e56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyNzV8&ixlib=rb-4.1.0&q=80&w=200	5926e210364d971c132b29b0	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
57fe7a9a-d206-4e28-876e-12f62155aa18	Idealite Organic Wellness Kitchen (生命陽光)	ht6ThD	dining	Penang	Malaysia	37, Lengkok Berjaya, 10350 Georgetown, Pulau Pinang	5.43077999957399	100.308100732824	100.308100732824	{"EarthCheck Silver","Green Globe Certified","ISO 14001"}	{farm-to-table,vegetarian,locally-sourced}	62	Idealite Organic Wellness Kitchen celebrates the bounty of Penang by bringing fresh, locally-sourced produce directly from nearby farms to your table. Our nourishing vegetarian menu honors both your health and the planet through a mindful, earth-conscious dining experience.	https://images.unsplash.com/photo-1469307670224-ee31d24b6b9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyODF8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1469307670224-ee31d24b6b9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyODF8&ixlib=rb-4.1.0&q=80&w=200	4e03191ee4cdbd9a51763b95	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
feebfa2c-333c-4eee-9d82-e1746ce2389c	Touch Veggie Delight	KDPi2j	dining	Penang	Malaysia	Sunrise Gurney (68-1-1), 10250 Georgetown, Pulau Pinang	5.43264038805262	100.316650794136	100.316650794136	{"ISO 14001","Green Key"}	{vegan,vegetarian,organic}	79	Touch Veggie Delight invites you to enjoy a flavorful dining experience in Penang featuring an entirely vegan and vegetarian menu crafted from the finest organic ingredients. Our commitment to sustainability ensures that every wholesome dish celebrates nature while nourishing both you and the planet.	https://images.unsplash.com/photo-1516749396351-ab12ad535d7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyODZ8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1516749396351-ab12ad535d7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyODZ8&ixlib=rb-4.1.0&q=80&w=200	5886e2a9b792076eb662bd57	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
b8c3d092-be75-46c7-824a-65202783e13b	BMS Organics Cafe	Qcm6Mk	dining	Penang	Malaysia	Moulmein Rise, 10350 Georgetown, Pulau Pinang	5.4294615	100.31231	100.31231	{"Green Star"}	{farm-to-table,compostable-packaging,organic}	84	BMS Organics Cafe brings the best of farm-to-table dining to Penang by serving wholesome, certified organic ingredients sourced directly from sustainable growers. Every meal is thoughtfully prepared and served in eco-friendly, compostable packaging to ensure your dining experience honors both your health and the planet.	https://images.unsplash.com/photo-1598214863200-2547d7a7d86a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyOTZ8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1598214863200-2547d7a7d86a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEyOTZ8&ixlib=rb-4.1.0&q=80&w=200	58afbd5e951e7d0a63556c3e	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
7d29694a-3cb0-413b-942d-21bef2c5cb60	LOHAS Health & Organic Enterprise	RZsbd7	dining	Penang	Malaysia	44, Ground Floor, Medan Angsana 4, 11500 Bandar Baru Air Itam, Pulau Pinang	5.39057621497422	100.283288955688	100.283288955688	{"EarthCheck Gold"}	{zero-waste,farm-to-table,locally-sourced}	84	LOHAS Health & Organic Enterprise celebrates Penang’s local bounty by transforming fresh, farm-to-table ingredients into wholesome meals that honor the land. We are dedicated to a zero-waste dining experience, ensuring every locally-sourced plate nourishes both you and the environment.	https://images.unsplash.com/photo-1664988851359-61052d954ef7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzMTh8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1664988851359-61052d954ef7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzMTh8&ixlib=rb-4.1.0&q=80&w=200	4dc8d504d22d4e36b44fcc56	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
a27c818e-22ca-4e5e-a90c-8f6a2efb2b88	BMS Organics	JRX55E	dining	Kuala Lumpur	Malaysia	Mid Valley Megamall, 59200 Kuala Lumpur, Kuala Lumpur	3.11809859026807	101.677423056655	101.677423056655	{"ISO 14001","EarthCheck Silver"}	{vegan,zero-waste,compostable-packaging}	93	BMS Organics offers a wholesome vegan dining experience in the heart of Kuala Lumpur, committed to a zero-waste philosophy that nurtures both your health and the planet. Every meal is served in eco-conscious, fully compostable packaging, ensuring your sustainable lifestyle is seamlessly supported from our kitchen to your table.	https://images.unsplash.com/photo-1716346062173-4b4ef43cea2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzOTR8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1716346062173-4b4ef43cea2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzOTR8&ixlib=rb-4.1.0&q=80&w=200	55c02038498efe3e61940a88	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
cca96e97-ab4b-4f95-b1e0-4cdd2dac81a6	Fo Guang Vegetarian @ China Town Food Paradise	h5NYG9	dining	Kuala Lumpur	Malaysia	Kuala Lumpur, Federal Territory of Kuala Lum	3.14193156611424	101.697141898215	101.697141898215	{"Green Star","Green Key"}	{vegan,locally-sourced,vegetarian}	66	Fo Guang Vegetarian at China Town Food Paradise offers a wholesome plant-based dining experience featuring vegan and vegetarian dishes crafted from fresh, locally-sourced ingredients. By prioritizing regional produce, we provide a sustainable way to enjoy authentic flavors in the heart of Kuala Lumpur.	https://images.unsplash.com/photo-1544510808-91bcbee1df55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0MDR8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1544510808-91bcbee1df55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0MDR8&ixlib=rb-4.1.0&q=80&w=200	4de71140b0fb9a99f6fa0199	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
5e5c0802-324a-4006-8a05-3c0c5c55d722	De Health Paradise Organic	ctADss	dining	Kuala Lumpur	Malaysia	14-0 Jalan 1/109E, Desa Business Park, Taman Desa, 58100 KL, 58100 Kuala Lumpur, Federal Territory of Kuala Lum	3.09668087300241	101.677848889086	101.677848889086	{"LEED Silver"}	{farm-to-table,vegan,zero-waste}	88	De Health Paradise Organic brings a mindful farm-to-table experience to the heart of Kuala Lumpur, serving vibrant vegan dishes crafted from ethically sourced, locally grown ingredients. Our commitment to the planet extends beyond the plate through a dedicated zero-waste kitchen that ensures every meal nourishes both you and the environment.	https://images.unsplash.com/photo-1576229577926-7352e9db23b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0MTB8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1576229577926-7352e9db23b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0MTB8&ixlib=rb-4.1.0&q=80&w=200	4d6b4d2dd2596ea8f71d7020	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
6c2be2c4-cbda-47f7-9ed4-791383becdf9	Sprout Plant Based Fusion	pCDkeD	dining	Kuala Lumpur	Malaysia	F13A Bangsar Village, 1 Jalan Telawi 1, 59000 Kuala Lumpur, Kuala Lumpur	3.129819	101.670964	101.670964	{"LEED Silver"}	{zero-waste,farm-to-table,compostable-packaging}	62	Sprout Plant Based Fusion brings the farm-to-table experience to Kuala Lumpur by serving vibrant, locally-sourced ingredients that minimize our carbon footprint. Through our commitment to a zero-waste kitchen and fully compostable packaging, we ensure that every delicious meal nourishes both you and the planet.	https://images.unsplash.com/photo-1626158611098-7a750a39ee9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0MTZ8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1626158611098-7a750a39ee9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0MTZ8&ixlib=rb-4.1.0&q=80&w=200	5f7e7f5d6a05172a04d505d4	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
611710f2-6bc3-4ef0-9626-1b21852c75f9	Organic Kitchen	ii32Bd	dining	Kuala Lumpur	Malaysia		3.14454885628759	101.708789287983	101.708789287983	{"Rainforest Alliance Certified"}	{vegan,zero-waste,vegetarian}	96	Organic Kitchen invites you to savor wholesome vegan and vegetarian cuisine crafted from locally sourced ingredients in the heart of Kuala Lumpur. We are committed to a zero-waste philosophy, ensuring every delicious meal is as kind to the planet as it is to your body.	https://images.unsplash.com/photo-1765100021213-c647e4c4e067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0MjJ8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1765100021213-c647e4c4e067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0MjJ8&ixlib=rb-4.1.0&q=80&w=200	4f7e783ee4b0f67484f3eb68	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
1941d17a-2f99-4963-bc5b-e4f11ed42d1c	Simply life style cafe, organic food	X3QSzC	dining	Malacca	Malaysia	Melaka raya, Melaka, Melaka	2.18804324582133	102.255764007568	102.255764007568	{"LEED Silver","LEED Gold","ISO 14001"}	{zero-waste,vegetarian,vegan}	60	Simply Life Style Cafe offers a nourishing sanctuary in Malacca, serving wholesome vegetarian and vegan dishes crafted from the finest organic ingredients. We are dedicated to a sustainable dining experience, championing a zero-waste philosophy that honors both your health and the environment.	https://images.unsplash.com/photo-1541014489759-2dfbb495a81f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1MzN8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1541014489759-2dfbb495a81f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1MzN8&ixlib=rb-4.1.0&q=80&w=200	4db4034643a1369cb5b0db67	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
2802cc22-f80d-4343-9316-8f2547e49152	Anob Organic	QDokaH	dining	Malacca	Malaysia	15 Jalan Melaka Raya, 75000 Melaka, Melaka	2.18443308839973	102.259600701282	102.259600701282	{"Green Globe Certified"}	{compostable-packaging,organic,vegetarian}	63	Anob Organic offers a delicious array of wholesome vegetarian dishes crafted entirely from fresh, organic ingredients sourced for your well-being. Every meal is served in fully compostable packaging, ensuring your dining experience in Malacca remains as kind to the planet as it is to your palate.	https://images.unsplash.com/photo-1574519903064-dcffaff5ab82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1Mzh8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1574519903064-dcffaff5ab82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1Mzh8&ixlib=rb-4.1.0&q=80&w=200	4c9ac879b8e9224bff32513d	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
cd0f8e40-d73f-4628-bfef-8bd1e5ae7f19	Marco Vegetarian & Organic Mart	WpF9hx	dining	Malacca	Malaysia	Bukit beruang, Melaka, Melaka	2.2450360983237	102.271566318132	102.271566318132	{"Green Globe Certified"}	{vegan,vegetarian,locally-sourced}	73	Marco Vegetarian & Organic Mart offers a nourishing dining experience in Malacca by exclusively serving wholesome vegan and vegetarian cuisine. We prioritize the environment by sourcing our fresh, high-quality ingredients from local farmers to reduce our carbon footprint and support the community.	https://images.unsplash.com/photo-1602492105679-74634e0c8496?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1NTR8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1602492105679-74634e0c8496?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1NTR8&ixlib=rb-4.1.0&q=80&w=200	4d95449a744f3704e63b9d57	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
63043cd3-8389-4ed3-a99c-f97f56f47a0c	WE ARE THE FARM	apaS4G	dining	Tokyo	Japan	松濤1-28-11 (Pigeon松濤高田ビル 1F), 渋谷区, 東京都, 150-0046	35.6595282734928	139.693959653378	139.693959653378	{"ISO 14001","Green Key","LEED Gold"}	{farm-to-table,organic,zero-waste}	94	Experience the true essence of farm-to-table dining at WE ARE THE FARM, where every seasonal dish features organic vegetables harvested directly from our own dedicated fields. We are deeply committed to a zero-waste philosophy, transforming our culinary process into a sustainable journey that honors the land and minimizes our environmental footprint.	https://images.unsplash.com/photo-1603903632541-17f4c956c79d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE2MDR8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1603903632541-17f4c956c79d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE2MDR8&ixlib=rb-4.1.0&q=80&w=200	5abb26e667f62b4d5c1baa93	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
cb8041cb-cc23-4b86-9054-457940718108	Mr. FARMER	WvHtC8	dining	Tokyo	Japan	駒沢公園1-1-2 (駒沢オリンピック公園), 世田谷区, 東京都, 154-0013	35.6281173898084	139.656642891213	139.656642891213	{"ISO 14001"}	{farm-to-table,organic,zero-waste}	60	Mr. FARMER brings the vibrant bounty of organic, farm-to-table produce directly to the heart of Tokyo through nutrient-dense meals crafted for optimal health. Our commitment to the planet is reflected in our dedicated zero-waste practices, ensuring every delicious bite supports a sustainable and mindful future.	https://images.unsplash.com/photo-1676807889027-5552f38a0c5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE2MTN8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1676807889027-5552f38a0c5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE2MTN8&ixlib=rb-4.1.0&q=80&w=200	58c875e514fb4137a3078d33	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
ed5233ba-bf32-42d0-88f3-95ba2a339b61	WE ARE THE FARM EBISU	27SXbf	dining	Tokyo	Japan	恵比寿西2-8-10 (ORIX恵比寿西ビル 1F), 渋谷区, 東京都, 150-0021	35.6492401020891	139.707488715649	139.707488715649	{"LEED Silver","Green Globe Certified"}	{farm-to-table,organic,zero-waste}	89	At WE ARE THE FARM EBISU, we bring the vibrant bounty of our own pesticide-free fields directly to your plate, celebrating the purity of seasonal, organic ingredients. Our commitment to the planet extends beyond the harvest, as we practice dedicated zero-waste culinary techniques to ensure every nutrient-rich element is honored and utilized.	https://images.unsplash.com/photo-1598215444804-82111e906dab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE2MjJ8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1598215444804-82111e906dab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE2MjJ8&ixlib=rb-4.1.0&q=80&w=200	569502a7498e11466febdea8	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
45d03d2c-b6e5-49ac-ad45-3fa67a7c46c1	WE ARE THE FARM (WE ARE THE FARM AZABU)	9hwuNa	dining	Tokyo	Japan	元麻布3-10-4 (Re-Flat 1F), 港区, 東京都, 106-0046	35.657121	139.732432	139.732432	{"EarthCheck Gold","Green Globe Certified"}	{vegetarian,locally-sourced,farm-to-table}	67	At WE ARE THE FARM Azabu, we celebrate the purity of nature by serving vibrant, vegetable-forward dishes crafted from seasonal produce harvested daily at our own organic farms. This authentic farm-to-table experience brings the freshest locally-sourced ingredients directly from the soil to your plate, ensuring a sustainable and nourishing meal in the heart of Tokyo.	https://images.unsplash.com/photo-1668072921628-6e024f6aadd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE2NDF8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1668072921628-6e024f6aadd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE2NDF8&ixlib=rb-4.1.0&q=80&w=200	59a594ec8b98fd13d0424bfb	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
d6727c9b-b4f1-478d-ba25-804dbb3e2d1e	Mappers Cafe @ Low Yat Plaza	4MjD53	transport	Kuala Lumpur	Malaysia	Jalan Bintang, Kuala Lumpur, Selangor	3.14394497871399	101.710182189941	101.710182189941	{"Green Star","ISO 14001","EarthCheck Gold"}	{shared-mobility,public-transit,carbon-offset}	90	Located right at the heart of Kuala Lumpur’s public transit network, Mappers Cafe @ Low Yat Plaza encourages low-carbon travel by serving as a convenient hub for commuters and shared-mobility users. We are committed to a greener future by facilitating sustainable transit options and actively investing in verified carbon-offset programs for every guest visit.	https://images.unsplash.com/photo-1772462798130-f0f74a119c82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0MzZ8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1772462798130-f0f74a119c82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0MzZ8&ixlib=rb-4.1.0&q=80&w=200	506be1ace4b0fee324cc2d89	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
eec9693f-0611-4f1f-a729-5ad8bccc608d	Bus stop depan public bank brickfields	LwkZay	transport	Kuala Lumpur	Malaysia	Brickfields, Kl	3.13476556902346	101.691343707774	101.691343707774	{"Green Globe Certified","Rainforest Alliance Certified"}	{ev,cycling,carbon-offset}	88	This Bus stop fronting Public Bank Brickfields serves as a key transit hub for electric buses, promoting zero-emission travel across Kuala Lumpur. With integrated bicycle parking and nearby carbon-offset green spaces, it offers a seamless and environmentally conscious commute for every passenger.	https://images.unsplash.com/photo-1777201351972-61f6ae37fdc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0Mjl8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1777201351972-61f6ae37fdc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0Mjl8&ixlib=rb-4.1.0&q=80&w=200	4fc0d114e4b0c9fe05873a13	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
ca06c152-1419-4b09-99e0-d8b11751ba75	Stop Over Bus / Car Transit Pit Stop	ZjBvtL	transport	Penang	Malaysia		5.39020090312591	100.405800235443	100.405800235443	{"EarthCheck Silver"}	{ev,carbon-offset,shared-mobility}	64	Experience a greener way to travel across Penang with our fleet of electric transit vehicles designed to minimize your environmental impact. By choosing our shared-mobility platform, you actively contribute to carbon-offset initiatives that preserve the island’s natural beauty for future generations.	https://images.unsplash.com/photo-1758218328650-f2677bfcb6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzNTF8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1758218328650-f2677bfcb6a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzNTF8&ixlib=rb-4.1.0&q=80&w=200	52907d7311d21d637162327f	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
ea65ad99-9abf-4da4-9382-1925b7a52dc9	Rapid MPPP Shutter Bus (Hop On Free Central Area Transit / CAT)	vUn94P	transport	Penang	Malaysia	George Town, Georgetown, Pulau Pinang	5.41441591760903	100.34203994817	100.34203994817	{"Rainforest Alliance Certified"}	{shared-mobility,public-transit,carbon-offset}	82	The Rapid MPPP Shutter Bus champions sustainable urban mobility by providing a seamless, shared public transit solution that reduces traffic congestion within Penang’s central area. By choosing this efficient hop-on service, passengers actively participate in a carbon-offset initiative that preserves the city's heritage environment for a cleaner, greener future.	https://images.unsplash.com/photo-1774366258076-e7fd9d0e4dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzMzR8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1774366258076-e7fd9d0e4dad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzMzR8&ixlib=rb-4.1.0&q=80&w=200	4e98d30361af89f39df34600	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
7d00b333-837d-443a-9510-9c3cc0346668	Genting Klang Public Bus Stop	EGDggY	transport	Kuala Lumpur	Malaysia		3.19588651899871	101.71287035236	101.71287035236	{"Green Key","LEED Gold"}	{shared-mobility,carbon-offset,cycling}	90	By utilizing the Genting Klang public bus stop, you contribute to a cleaner Kuala Lumpur through shared mobility that significantly reduces individual carbon footprints. This hub also serves as a vital link for multi-modal travel, seamlessly integrating cycling paths to make your daily commute both efficient and environmentally responsible.	https://images.unsplash.com/photo-1768131340697-96dafe3962bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0NTl8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1768131340697-96dafe3962bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0NTl8&ixlib=rb-4.1.0&q=80&w=200	4e40af5518389e021465aa17	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
2572b5a5-dd16-4acd-8494-4333ccbe61a5	EvCharging Station	jnnWD9	transport	Kuala Lumpur	Malaysia	55000 Kuala Lumpur, Kuala Lumpur	3.1464868	101.72577	101.72577	{"Green Globe Certified","LEED Gold","ISO 14001"}	{shared-mobility,electric-bus,cycling}	62	Our integrated charging network empowers Kuala Lumpur’s transition to green transport by fueling a seamless fleet of electric buses and shared-mobility services. By bridging the gap between public transit and last-mile cycling, we provide a sustainable foundation for a cleaner, more connected city.	https://images.unsplash.com/photo-1771508215016-981f425b5425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0NDh8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1771508215016-981f425b5425?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0NDh8&ixlib=rb-4.1.0&q=80&w=200	65e8271ed0a6c0046148a576	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
59c8f07b-2f79-47ff-b03a-d1dc86eef651	Rapid Penang Airport Transit (At)	KeRGtQ	transport	Penang	Malaysia	10200 Georgetown, Pulau Pinang	5.416956	100.33824	100.33824	{"EarthCheck Gold","LEED Silver"}	{ev,public-transit,cycling}	63	Rapid Penang Airport Transit offers a seamless public-transit experience by integrating electric buses that significantly lower your carbon footprint during island commutes. Our service bridges the gap for active travelers by providing easy connectivity for those combining cycling with their journey to ensure a greener transit network for everyone.	https://images.unsplash.com/photo-1767658589816-c6b3bee0653f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzMjh8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1767658589816-c6b3bee0653f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTEzMjh8&ixlib=rb-4.1.0&q=80&w=200	5abca81291eaca443f564f5d	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
050b3152-089e-4f17-bb2e-a5ce03ff6ca5	EV充電スタンド	sqScnx	transport	Tokyo	Japan	下高井戸1丁目17-15, 杉並区, 東京都, 168-0073	35.667907371872	139.63602727655	139.63602727655	{"Rainforest Alliance Certified","Green Globe Certified","EarthCheck Gold"}	{cycling,carbon-offset,public-transit}	97	Power your journey through Tokyo with our EV charging network, seamlessly integrated to complement public transit routes and support a carbon-offset lifestyle. By bridging the gap between electric mobility and cycling infrastructure, we make sustainable urban travel an effortless part of your daily commute.	https://images.unsplash.com/photo-1775726903912-d7c0cbb4c5d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE2NDd8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1775726903912-d7c0cbb4c5d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE2NDd8&ixlib=rb-4.1.0&q=80&w=200	60fb929c0dfed44d5d0315ad	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
089d6baf-3f8a-4a09-ba47-2d7aa69c5289	Mandarin Oriental EV Charging Station	Dz6dhi	transport	Kuala Lumpur	Malaysia		3.1556902	101.711914	101.711914	{"EarthCheck Gold","Green Key","ISO 14001"}	{shared-mobility,public-transit,carbon-offset}	70	The Mandarin Oriental EV charging station supports a greener Kuala Lumpur by powering shared-mobility services that seamlessly integrate with the city's extensive public-transit network. This initiative reduces urban congestion while empowering commuters to actively contribute to meaningful carbon-offset efforts with every journey.	https://images.unsplash.com/photo-1760588774918-769cb07ab9c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0NDB8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1760588774918-769cb07ab9c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE0NDB8&ixlib=rb-4.1.0&q=80&w=200	57f5c500498e65739e5fb7cb	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
b2a9a5b0-f59e-4073-9ae0-7fd5c1b239d5	EVPOWER Charging Station	FDQkTa	transport	Malacca	Malaysia	10 Jalan Gajah Berang, 75200 Melaka, Melaka	2.208655	102.243095	102.243095	{"ISO 14001","Green Globe Certified","EarthCheck Gold"}	{carbon-offset,low-emission,electric-bus}	71	The EVPOWER Charging Station powers Malacca’s fleet of zero-emission electric buses, providing a clean and efficient transit solution for the historic city. By facilitating this transition to low-emission travel, we actively reduce your carbon footprint and support a sustainable future for every passenger.	https://images.unsplash.com/photo-1763542950623-725ca5be52ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1NjZ8&ixlib=rb-4.1.0&q=80&w=1080	https://images.unsplash.com/photo-1763542950623-725ca5be52ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MzQ2MzZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Nzg0MTE1NjZ8&ixlib=rb-4.1.0&q=80&w=200	6950bb0c0a1e727e1c417ceb	\N	2026-06-11 15:19:06.547145+00	2026-06-11 15:19:35.836254+00
\.


--
-- Data for Name: todos; Type: TABLE DATA; Schema: public; Owner: terratrace
--

COPY public.todos (id, user_id, name, is_complete, inserted_at) FROM stdin;
\.


--
-- Data for Name: trip_items; Type: TABLE DATA; Schema: public; Owner: terratrace
--

COPY public.trip_items (id, trip_id, trip_date, day_part, title, category, estimated_cost, rationale, weather_alternative, community_impact, sort_order, created_at, location_id) FROM stdin;
eb0657b7-42c0-4372-868c-ba43c79783a2	08c3ff13-4564-4f9a-97be-a4371e60ad88	2026-06-12	morning	test	activity	50	\N	\N	\N	0	2026-06-11 16:27:28.504609+00	\N
9e7b8f8c-bfde-45eb-95fb-c032fb2e19de	08c3ff13-4564-4f9a-97be-a4371e60ad88	2026-06-12	flexible	EV充電スタンド	Transport	\N	Sustainable transport option in Tokyo.	\N	Rainforest Alliance Certified, Green Globe Certified, EarthCheck Gold	1	2026-06-11 16:27:28.504609+00	050b3152-089e-4f17-bb2e-a5ce03ff6ca5
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: terratrace
--

COPY public.trips (id, user_id, destination, start_date, end_date, budget, interests, eco_score, status, source, source_request_id, weather_condition, total_estimated_cost, created_at, updated_at) FROM stdin;
ecdf34b4-fde3-4b00-842c-2b927b3a5f09	524cd269-46f2-4e99-9445-6938d34cefff	Kuala Lumpur	2026-06-11	2026-07-11	30	{food}	75	upcoming	manual	\N	\N	\N	2026-06-11 14:47:27.438822+00	2026-06-11 14:47:27.438822+00
08c3ff13-4564-4f9a-97be-a4371e60ad88	524cd269-46f2-4e99-9445-6938d34cefff	tokyo	2026-06-12	2026-06-14	900	{food}	97	upcoming	manual	\N	\N	\N	2026-06-11 16:26:31.541762+00	2026-06-11 16:27:28.504609+00
\.


--
-- Data for Name: user_favourites; Type: TABLE DATA; Schema: public; Owner: terratrace
--

COPY public.user_favourites (id, user_id, location_id, created_at) FROM stdin;
15845082-3b56-493d-8632-5dde453bce7c	524cd269-46f2-4e99-9445-6938d34cefff	b2a9a5b0-f59e-4073-9ae0-7fd5c1b239d5	2026-06-11 16:02:39.923454+00
994d5898-e1ba-401b-9525-323a17846603	524cd269-46f2-4e99-9445-6938d34cefff	4b9801a4-0524-4e3a-869f-a74d0cd42dd0	2026-06-11 21:06:58.446179+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: terratrace
--

COPY public.users (id, email, password_hash, username, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) FROM stdin;
a1329478-df12-4272-99ca-372c06caa55b	alex@gmail.com	$2b$12$4MUmhpk01BjYCUn2bdsA/e4jRkTzkcqttf1YKSHTjhazaCla8DKt2	alex	user	{}	{}	2026-06-11 19:06:40.263956+00	2026-06-11 19:06:40.263956+00
d54174f7-e22d-4770-9bd2-9fb5bcbbdcf9	alexa@gmail.com	$2b$12$Ue3SeyENld2NKg0Hc7qdKeQ0lQ7X27afM7zWCCRQyjfUQAByBySgq	alex	user	{}	{}	2026-06-11 19:10:11.584967+00	2026-06-11 19:10:11.584967+00
b8385ec1-0540-4b37-a236-f0095c412ba2	test@gmail.com	$2b$12$y/KWhHRqLssq7ZRfS/MDJenv2SkkHGF2t/W1G1.LC7xv8CKFm/qhW	test	user	{}	{}	2026-06-11 21:03:05.970097+00	2026-06-11 21:03:05.970097+00
524cd269-46f2-4e99-9445-6938d34cefff	yikangheng@gmail.com	$2b$12$00I/jbH.6Bu9cMmm9otfs.gCaTVkd4q1JWHk7p9eRWB05/gK6CfAO	yksuperman	user	{}	{}	2026-06-10 15:04:37.645886+00	2026-06-11 21:05:05.906958+00
3c00f316-5b77-48a7-8be0-561715f0e3b7	admin@terratrace.my	$2b$12$ZwcJ3y9rKdPmg18UBX2QZ.f8e1ZRtGBOBucsb14k5G/YgebToB4j.	admin	admin	{}	{}	2026-06-11 21:26:37.75862+00	2026-06-11 21:26:37.75862+00
00000000-0000-4000-8000-000000000001	traveler@terratrace.local	$2b$12$.fFBJuZMXorZqoMbXlouVeFPZTlf/OwJ0MloVRnkUxLM9gpSBmZ9y	Terratrace Traveler	user	{}	{}	2026-06-11 21:59:20.508006+00	2026-06-11 21:59:20.508006+00
\.


--
-- Name: todos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: terratrace
--

SELECT pg_catalog.setval('public.todos_id_seq', 4, true);


--
-- Name: carbon_budget_goals carbon_budget_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.carbon_budget_goals
    ADD CONSTRAINT carbon_budget_goals_pkey PRIMARY KEY (id);


--
-- Name: carbon_budget_goals carbon_budget_goals_user_id_year_key; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.carbon_budget_goals
    ADD CONSTRAINT carbon_budget_goals_user_id_year_key UNIQUE (user_id, year);


--
-- Name: carbon_entries carbon_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.carbon_entries
    ADD CONSTRAINT carbon_entries_pkey PRIMARY KEY (id);


--
-- Name: community_badges community_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_badges
    ADD CONSTRAINT community_badges_pkey PRIMARY KEY (id);


--
-- Name: community_badges community_badges_slug_key; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_badges
    ADD CONSTRAINT community_badges_slug_key UNIQUE (slug);


--
-- Name: community_challenge_progress community_challenge_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_challenge_progress
    ADD CONSTRAINT community_challenge_progress_pkey PRIMARY KEY (challenge_id, user_id);


--
-- Name: community_challenges community_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_challenges
    ADD CONSTRAINT community_challenges_pkey PRIMARY KEY (id);


--
-- Name: community_challenges community_challenges_slug_key; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_challenges
    ADD CONSTRAINT community_challenges_slug_key UNIQUE (slug);


--
-- Name: community_review_helpful community_review_helpful_pkey; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_review_helpful
    ADD CONSTRAINT community_review_helpful_pkey PRIMARY KEY (review_id, user_id);


--
-- Name: community_reviews community_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_reviews
    ADD CONSTRAINT community_reviews_pkey PRIMARY KEY (id);


--
-- Name: community_user_badges community_user_badges_pkey; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_user_badges
    ADD CONSTRAINT community_user_badges_pkey PRIMARY KEY (badge_id, user_id);


--
-- Name: locations locations_foursquare_id_key; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_foursquare_id_key UNIQUE (foursquare_id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: locations locations_public_id_key; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_public_id_key UNIQUE (public_id);


--
-- Name: todos todos_pkey; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_pkey PRIMARY KEY (id);


--
-- Name: trip_items trip_items_pkey; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.trip_items
    ADD CONSTRAINT trip_items_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: trips trips_user_id_source_request_id_key; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_user_id_source_request_id_key UNIQUE (user_id, source_request_id);


--
-- Name: user_favourites user_favourites_pkey; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.user_favourites
    ADD CONSTRAINT user_favourites_pkey PRIMARY KEY (id);


--
-- Name: user_favourites user_favourites_user_id_location_id_key; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.user_favourites
    ADD CONSTRAINT user_favourites_user_id_location_id_key UNIQUE (user_id, location_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: carbon_budget_goals_user_year_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX carbon_budget_goals_user_year_idx ON public.carbon_budget_goals USING btree (user_id, year);


--
-- Name: carbon_entries_user_created_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX carbon_entries_user_created_idx ON public.carbon_entries USING btree (user_id, created_at DESC);


--
-- Name: community_challenges_active_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX community_challenges_active_idx ON public.community_challenges USING btree (active, starts_at DESC);


--
-- Name: community_helpful_user_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX community_helpful_user_idx ON public.community_review_helpful USING btree (user_id);


--
-- Name: community_progress_user_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX community_progress_user_idx ON public.community_challenge_progress USING btree (user_id, updated_at DESC);


--
-- Name: community_reviews_category_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX community_reviews_category_idx ON public.community_reviews USING btree (lower(category));


--
-- Name: community_reviews_created_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX community_reviews_created_idx ON public.community_reviews USING btree (created_at DESC);


--
-- Name: community_reviews_user_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX community_reviews_user_idx ON public.community_reviews USING btree (user_id, created_at DESC);


--
-- Name: community_user_badges_user_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX community_user_badges_user_idx ON public.community_user_badges USING btree (user_id, earned_at DESC);


--
-- Name: locations_category_city_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX locations_category_city_idx ON public.locations USING btree (lower(category), city);


--
-- Name: todos_user_inserted_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX todos_user_inserted_idx ON public.todos USING btree (user_id, inserted_at DESC);


--
-- Name: trip_items_location_id_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX trip_items_location_id_idx ON public.trip_items USING btree (location_id);


--
-- Name: trip_items_trip_sort_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX trip_items_trip_sort_idx ON public.trip_items USING btree (trip_id, trip_date, sort_order);


--
-- Name: trips_user_start_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX trips_user_start_idx ON public.trips USING btree (user_id, start_date DESC);


--
-- Name: user_favourites_user_id_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE INDEX user_favourites_user_id_idx ON public.user_favourites USING btree (user_id);


--
-- Name: users_email_lower_idx; Type: INDEX; Schema: public; Owner: terratrace
--

CREATE UNIQUE INDEX users_email_lower_idx ON public.users USING btree (lower(email));


--
-- Name: carbon_budget_goals carbon_budget_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.carbon_budget_goals
    ADD CONSTRAINT carbon_budget_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: carbon_entries carbon_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.carbon_entries
    ADD CONSTRAINT carbon_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: community_challenge_progress community_challenge_progress_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_challenge_progress
    ADD CONSTRAINT community_challenge_progress_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.community_challenges(id) ON DELETE CASCADE;


--
-- Name: community_challenge_progress community_challenge_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_challenge_progress
    ADD CONSTRAINT community_challenge_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: community_challenges community_challenges_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_challenges
    ADD CONSTRAINT community_challenges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.community_badges(id) ON DELETE SET NULL;


--
-- Name: community_review_helpful community_review_helpful_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_review_helpful
    ADD CONSTRAINT community_review_helpful_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.community_reviews(id) ON DELETE CASCADE;


--
-- Name: community_review_helpful community_review_helpful_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_review_helpful
    ADD CONSTRAINT community_review_helpful_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: community_reviews community_reviews_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_reviews
    ADD CONSTRAINT community_reviews_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL;


--
-- Name: community_reviews community_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_reviews
    ADD CONSTRAINT community_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: community_user_badges community_user_badges_badge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_user_badges
    ADD CONSTRAINT community_user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.community_badges(id) ON DELETE CASCADE;


--
-- Name: community_user_badges community_user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.community_user_badges
    ADD CONSTRAINT community_user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: todos todos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: trip_items trip_items_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.trip_items
    ADD CONSTRAINT trip_items_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL;


--
-- Name: trip_items trip_items_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.trip_items
    ADD CONSTRAINT trip_items_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: trips trips_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_favourites user_favourites_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.user_favourites
    ADD CONSTRAINT user_favourites_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE CASCADE;


--
-- Name: user_favourites user_favourites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: terratrace
--

ALTER TABLE ONLY public.user_favourites
    ADD CONSTRAINT user_favourites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 09q007GiocxxZ2RLQtytBCTeDYuQjToX7IrjcNhpUBJIWO2FyocSCcd0mSwg8eJ

