import { createClient } from "@supabase/supabase-js";
import { createApi } from "unsplash-js";
import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch";
import { customAlphabet } from "nanoid";
import "dotenv/config";

const fsqKey = process.env.FOURSQUARE_API_KEY;
const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseService);
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const unsplash = createApi({ accessKey: unsplashKey, });
const nanoid = customAlphabet("23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", 6);

const DESTINATIONS = [
    { city: "Penang", country: "Malaysia", lat: 5.4141, lng: 100.3288 },
    { city: "Kuala Lumpur", country: "Malaysia", lat: 3.1390, lng: 101.6869 },
    { city: "Malacca", country: "Malaysia", lat: 2.1896, lng: 102.2501 },
    { city: "Tokyo", country: "Japan", lat: 35.6764, lng: 139.6500 },
    { city: "Vienna", country: "Austria", lat: 48.2085, lng: 16.3721 },
    { city: "Barcelona", country: "Spain", lat: 41.3888, lng: 2.1590 },
    { city: "Kyoto", country: "Japan", lat: 35.0116, lng: 135.7681 },
    { city: "Copenhagen", country: "Denmark", lat: 55.6761, lng: 12.5683 },
    { city: "San Jose", country: "Costa Rica", lat: 9.9281, lng: -84.0907 },
    { city: "Chiang Mai", country: "Thailand", lat: 18.7883, lng: 98.9853 },
    { city: "Amsterdam", country: "Netherlands", lat: 52.3676, lng: 4.9041 },
];

const CATEGORY_MAP = [
    {
        type: "accommodation",
        foursquareId: "4bf58dd8d48988d1fa931735,4bf58dd8d48988d12f951735,5bae9231bedf3950379f89cb",   // Hotel, Resort, Inn category
        ecoTags: ["eco-stay", "sustainable", "green-certified"],
        unsplashQuery: "eco hotel sustainable resort",
    },
    {
        type: "dining",
        foursquareId: "4bf58dd8d48988d1d3941735",   // Vegan and Vegetarian Restaurant
        ecoTags: ["plant-based", "organic", "farm-to-table", "zero-waste"],
        unsplashQuery: "organic restaurant plant based food",
    },
    {
        type: "transport",
        foursquareId: "5032872391d4c4b30a586d64,63be6904847c3692a84b9c2d",   // ev charging station, public transportation
        ecoTags: ["ev", "cycling", "low-emission", "public-transit"],
        unsplashQuery: "electric vehicle cycling sustainable transport",
    },
];

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

const ECO_TAGS_POOL = {
    accommodation: ["solar-powered", "rainwater-harvesting", "green-certified", "plastic-free", "eco-stay", "carbon-neutral"],
    dining: ["vegan", "vegetarian", "organic", "farm-to-table", "zero-waste", "locally-sourced", "compostable-packaging"],
    transport: ["ev", "cycling", "electric-bus", "low-emission", "carbon-offset", "public-transit", "shared-mobility"],
};

function randomEcoTags(type, count = 3) {
    const pool = [...ECO_TAGS_POOL[type]];
    return pool.sort(() => 0.5 - Math.random()).slice(0, count);
}

function randomEcoScore() {
    // 60 – 99 range (integer for bigint column)
    return Math.floor(60 + Math.random() * 39);
}

function randomCerts() {
    const numCerts = Math.floor(Math.random() * 3) + 1; // 1-3 certs
    const shuffledCerts = [...ECO_CERTIFICATIONS].sort(() => 0.5 - Math.random());
    return shuffledCerts.slice(0, numCerts);
}

async function fetchPlaces(lat, lng, categoryId, ecoTags, limit = 5) {
    // const url = new URL("https://api.foursquare.com/v3/places/search");
    // url.searchParams.set("ll", `${lat},${lng}`);
    // url.searchParams.set("categories", categoryId);
    // url.searchParams.set("limit", limit);
    // url.searchParams.set("radius", 10000); // 10km radius

    // const res = await fetch(url.toString(), {
    //     headers: {
    //         Authorization: fsqKey,
    //         Accept: "application/json",
    //     },
    // });

    // if (!res.ok) {
    //     const errorBody = await res.text();
    //     console.error(`ERROR: Foursquare API ${res.status} ${res.statusText}: ${errorBody}`);
    //     return [];
    // }

    // const data = await res.json();
    // if (!data.results || data.results.length === 0) {
    //     console.warn(`WARNING: No places found for category ${categoryId} near ${lat},${lng}`);
    // }
    // return data.results ?? [];
    const headers = {
        'X-Places-Api-Version': '2025-06-17',
        accept: 'application/json',
        authorization: `Bearer ${fsqKey}`
    };

    const params = new URLSearchParams({
        query: ecoTags.join(","),
        fsq_category_ids: categoryId,
        ll: `${lat},${lng}`,
        radius: '10000',
        sort: 'RELEVANCE',
        limit: limit,
        fields: [
            'fsq_place_id',
            'name',
            'location',
            'categories',
            'distance',
            'latitude',
            'longitude',
        ].join(","),
    })

    const url = `https://places-api.foursquare.com/places/search?${params}`;

    const res = await fetch(url, { method: 'GET', headers })
        .then(res => res.json())
        .catch(err => console.error(err));

    return res.results ?? [];
}

async function fetchUnsplashPhoto(query) {
    try {
        const result = await unsplash.photos.getRandom({ query, orientation: "landscape", contentFilter: "high" });
        if (result.type === "success") {
            const photo = result.response;
            return {
                url: photo.urls?.regular,
                thumb: photo.urls?.thumb,
            };
        }
        console.warn(`ERROR: Unsplash returned type: ${result.type}`, JSON.stringify(result.errors ?? result.status ?? result));
    } catch (e) {
        console.warn(`ERROR: Unsplash error: ${e.message}`);
    }

    return null;
}

async function generateEcoDescription(name, type, city, ecoTags) {
    const response = await gemini.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Write a 2-sentence eco-friendly description for "${name}", 
               a ${type} in ${city}. Highlight these sustainability aspects: ${ecoTags.join(", ")}. 
               Be specific and appealing. No hashtags or emojis.`,
    });

    return response.text ?? null;
}

// Rate limiter — Unsplash allows 50 req/hour on demo
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main seeding loop
async function seed() {
    console.log("NOTE: Starting Eco-Scout database seed...\n");

    for (const destination of DESTINATIONS) {
        console.log(`NOTE: Seeding ${destination.city}, ${destination.country}`);

        for (const category of CATEGORY_MAP) {
            const places = await fetchPlaces(
                destination.lat,
                destination.lng,
                category.foursquareId,
                category.ecoTags,
                5  // 5 places per city per category = ~165 rows total
            );

            for (const place of places) {
                // Fetch a relevant Unsplash image
                const photo = await fetchUnsplashPhoto(
                    `${category.unsplashQuery}`
                );
                await sleep(75000); // stay under Unsplash's 50 req/hour limit

                const eco_tags = randomEcoTags(category.type);
                const description = await generateEcoDescription(place.name, category.type, destination.city, eco_tags);

                const row = {
                    name: place.name,
                    public_id: nanoid(),
                    category: category.type,
                    city: destination.city,
                    country: destination.country,
                    address: place.location?.formatted_address ?? null,
                    lat: place.latitude ?? destination.lat,
                    lng: place.longitude ?? destination.lng,
                    eco_certs: randomCerts(),
                    eco_score: randomEcoScore(),
                    eco_tags: eco_tags,
                    description: description ?? null,
                    image_url: photo?.url ?? null,
                    image_thumb: photo?.thumb ?? null,
                    foursquare_id: place.fsq_place_id,
                };

                const { error } = await supabase.from("locations").upsert(row, {
                    onConflict: "foursquare_id",  // prevents duplicates if you re-run
                });

                if (error) console.error(`ERROR: ${place.name}:`, error.message);
                else console.log(`SUCCESS: ${category.type}: ${place.name}`);
            }
        }
    }

    console.log("\nFINISHED: Seeding complete!");
}

seed();