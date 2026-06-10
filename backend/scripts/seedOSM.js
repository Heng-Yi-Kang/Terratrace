// scripts/seedOsm.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { createApi } = require('unsplash-js');
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const axios = require('axios');

function getRequiredEnv(name) {
    const value = process.env[name];
    if (typeof value !== 'string' || value.trim() === '') {
        console.error(`Missing required environment variable: ${name}`);
        process.exit(1);
    }
    return value;
}

const databaseUrl = getRequiredEnv('DATABASE_URL');
const unsplashAccessKey = getRequiredEnv('NEXT_UNSPLASH_ACCESS_KEY');

const pool = new Pool({ connectionString: databaseUrl });

const api = createApi({
    accessKey: unsplashAccessKey,
})

// mock eco certs
const ECO_CERTIFICATIONS = [
    'Green Key',
    'LEED Gold',
    'LEED Silver',
    'EarthCheck Gold',
    'EarthCheck Silver',
    'ISO 14001',
    'Green Globe Certified',
    'Rainforest Alliance Certified',
    'Green Star',
];

const CATEGORY_UNSPLASH_QUERIES = {
    Accommodation: 'eco hotel',
    Dining: 'vegan food',
    Transport: 'electric bus public transport'
};

async function getRandomPlaceholderImage(category) {
    const query = CATEGORY_UNSPLASH_QUERIES[category] || 'sustainable city';
    try {
        const result = await api.photos.getRandom({ query, orientation: 'landscape' });
        if (result.type === 'success') return result.response.urls.regular;
    } catch (e) { }

    return 'https://loremflickr.com/1200/800/sustainable-city';
}

const TOURISM_CATEGORY_MAP = {
    hotel: "Accommodation",
}

const AMENITY_CATEGORY_MAP = {
    restaurant: "Dining",
    cafe: "Dining",
    bicycle_rental: "Transport",
    bus_station: "Transport",
    charging_station: "Transport",
}

const HIGHWAY_CATEGORY_MAP = {
    bus_stop: "Transport",
}

const PUBLIC_TRANSPORT_CATEGORY_MAP = {
    platform: "Transport",
}

// overpass query to send to OpenStreetMap API
const OVERPASS_QUERY = `
  [out:json][timeout:10000];
  // Target the Federal Territory of Kuala Lumpur
  area["name"="Kuala Lumpur"]["admin_level"="4"]->.searchArea;
  (
    node["tourism"="hotel"](area.searchArea) -> .hotels;

    node["amenity"="cafe"]["diet:vegetarian"="yes"](area.searchArea) -> .veganCafes;

    node["amenity"="restaurant"]["diet:vegan"="yes"](area.searchArea) -> .veganRestaurantsDiet;
    node["amenity"="restaurant"]["organic"="yes"](area.searchArea) -> .veganRestaurantsOrganic;

    node["amenity"="bicycle_rental"](area.searchArea) -> .transportBicycle;
    node["amenity"="bus_station"](area.searchArea) -> .transportBus;
    node["highway"="bus_stop"](area.searchArea) -> .transportBusstops;
    node["public_transport"="platform"](area.searchArea) -> .transportPublic;
    node["amenity"="charging_station"](area.searchArea) -> .transportEv;

    (.veganRestaurantsDiet; .veganRestaurantsOrganic;)->.veganRestaurants;
    (.transportBicycle; .transportBus; .transportBusstops; .transportPublic; .transportEv;) -> .transports;
  );

  .hotels out center 32;
  .veganRestaurants out center 15;
  .veganCafes out center 15;
  .transports out center 30;
`;

async function seedDatabase() {
    console.log('Fetching data from OpenStreetMap...');

    try {
        // 1. Fetch Data from Overpass API
        // Add a 100-second timeout (100000ms) to Axios
        // const response = await axios.post(
        //     'https://overpass-api.de/api/interpreter',
        //     `data=${encodeURIComponent(OVERPASS_QUERY)}`,
        //     { timeout: 200000 }
        // );
        // const elements = response.data.elements;

        // if (!elements || elements.length === 0) {
        //     console.log('No locations found matching the query.');
        //     return;
        // }

        // console.log(`Found ${elements.length} locations. Formatting data...`);
        const OVERPASS_ENDPOINTS = [
            'https://overpass-api.de/api/interpreter',
            'https://lz4.overpass-api.de/api/interpreter',
            'https://overpass.kumi.systems/api/interpreter',
        ];

        async function fetchOverpassData(query) {
            let lastError = null;

            for (const endpoint of OVERPASS_ENDPOINTS) {
                for (let attempt = 1; attempt <= 3; attempt += 1) {
                    try {
                        console.log('Overpass request:', { endpoint, attempt });

                        const response = await axios.post(
                            endpoint,
                            `data=${encodeURIComponent(query)}`,
                            {
                                timeout: 180000,
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'User-Agent': 'TerratraceSeeder/1.0',
                                },
                            }
                        );

                        if (!response?.data || !Array.isArray(response.data.elements)) {
                            throw new Error('Overpass response missing elements array');
                        }

                        return response.data.elements;
                    } catch (error) {
                        lastError = error;
                        const waitMs = 1500 * attempt;
                        console.error('Overpass failed:', {
                            endpoint,
                            attempt,
                            message: error?.message,
                            code: error?.code,
                            status: error?.response?.status,
                        });
                        await new Promise((resolve) => setTimeout(resolve, waitMs));
                    }
                }
            }

            throw lastError || new Error('All Overpass endpoints failed');
        }

        const elements = await fetchOverpassData(OVERPASS_QUERY);

        if (!elements || elements.length === 0) {
            console.log('No locations found matching the query.');
            return;
        }

        console.log(`Found ${elements.length} locations. Formatting data...`);

        // 2. Format Data to match your Supabase schema
        const formattedLocations = (
            await Promise.all(
                elements.map(async (el) => {
                    const tags = el.tags || {};

                    // Determine coordinates depending on if it's a node (point) or way (area)
                    const lat = el.lat || el.center?.lat;
                    const long = el.lon || el.center?.lon;

                    const tourismType = tags.tourism || null;
                    const amenityType = tags.amenity || null;
                    const highwayType = tags.highway || null;
                    const pubtransType = tags.public_transport || null;

                    let category = "Other"
                    if (tourismType && TOURISM_CATEGORY_MAP[tourismType]) {
                        category = TOURISM_CATEGORY_MAP[tourismType];
                    } else if (amenityType && AMENITY_CATEGORY_MAP[amenityType]) {
                        category = AMENITY_CATEGORY_MAP[amenityType];
                    } else if (highwayType && HIGHWAY_CATEGORY_MAP[highwayType]) {
                        category = HIGHWAY_CATEGORY_MAP[highwayType];
                    } else if (pubtransType && PUBLIC_TRANSPORT_CATEGORY_MAP[pubtransType]) {
                        category = PUBLIC_TRANSPORT_CATEGORY_MAP[pubtransType];
                    }

                    // Extract eco-certifications from OSM tags
                    const certs = [];
                    if (category != "Transport") {
                        if (tags.eco) certs.push(`eco: ${tags.eco}`);
                        if (tags.sustainable) certs.push(`sustainable: ${tags.sustainable}`);

                        // Add mock eco certifications - randomly select 1-3 certifications
                        const numMockCerts = Math.floor(Math.random() * 3) + 1; // 1-3 certs
                        const shuffledCerts = ECO_CERTIFICATIONS.sort(() => 0.5 - Math.random());
                        const mockCerts = shuffledCerts.slice(0, numMockCerts);
                        certs.push(...mockCerts);
                    }

                    const public_id = nanoid(6);

                    return {
                        // id: will be auto-generated by Supabase if your column is set to gen_random_uuid()
                        name: tags['name:en'] || tags.name || 'Unnamed Location',
                        category: category,
                        city: 'Kuala Lumpur',
                        lat: lat,
                        long: long,
                        eco_certs: certs, // maps to jsonb
                        image_url: await getRandomPlaceholderImage(category),
                        ex_booking_url: tags.website || null,
                        public_id: public_id
                    };
                }))).filter(loc => loc.lat && loc.long); // Ensure we have valid coordinates

        console.log('Inserting into local Postgres locations table...');
        for (const loc of formattedLocations) {
            await pool.query(
                `insert into locations (
                    name, category, city, lat, long, eco_certs, image_url, ex_booking_url, public_id
                 ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 on conflict (public_id) do update set
                    name = excluded.name,
                    category = excluded.category,
                    city = excluded.city,
                    lat = excluded.lat,
                    long = excluded.long,
                    eco_certs = excluded.eco_certs,
                    image_url = excluded.image_url,
                    ex_booking_url = excluded.ex_booking_url,
                    updated_at = now()`,
                [
                    loc.name,
                    loc.category,
                    loc.city,
                    loc.lat,
                    loc.long,
                    loc.eco_certs,
                    loc.image_url,
                    loc.ex_booking_url,
                    loc.public_id,
                ],
            );
        }
        console.log(`Successfully inserted ${formattedLocations.length} records!`);

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios message:', error.message);
            console.error('Axios code:', error.code);
            console.error('Axios status:', error.response?.status);
            console.error('Axios response:', error.response?.data);
            console.error('Axios config URL:', error.config?.url);
        } else if (error instanceof Error) {
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        } else {
            console.error('Unknown error object:', error);
        }
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

seedDatabase();
