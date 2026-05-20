import "dotenv/config";

const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;
if (!FOURSQUARE_API_KEY) {
    console.error("ERROR: API Key not found!");
    process.exit(1);
}

// ─── Headers (same for all requests) ────────────────────────────
const headers = {
    'X-Places-Api-Version': '2025-06-17',
    accept: 'application/json',
    authorization: `Bearer ${FOURSQUARE_API_KEY}`
};

// ─── Query Params ───────────────────────────────────────────────
// All parameters go as URL search params, NOT in the fetch options.
//
// LOCATION (pick one approach):
//   ll        – lat,lng (e.g. "3.1390,101.6869")
//   radius    – bias radius in meters (0–100000, default 22000)
//   near      – geocodable name (e.g. "Kuala Lumpur, MY")
//   ne & sw   – bounding box corners
//
// SEARCH & FILTER:
//   query              – free-text search (name, category, taste, etc.)
//   fsq_category_ids   – comma-separated category IDs
//   fsq_chain_ids      – comma-separated chain IDs
//   exclude_all_chains – true to exclude chains
//   min_price / max_price – 1 to 4
//   open_now           – true for currently open places
//   open_at            – specific time (DOWTHHMM format)
//
// RESPONSE CONTROL:
//   fields    – comma-separated fields to return
//   sort      – RELEVANCE | RATING | DISTANCE | POPULARITY
//   limit     – 1 to 50 (default 10)
//   tel_format – NATIONAL | E164

const params = new URLSearchParams({
    query: ["plant-based", "organic", "farm-to-table", "zero-waste"].join(","),
    fsq_category_ids: '4bf58dd8d48988d1d3941735,4bf58dd8d48988d1ce941735',
    ll: '3.1390,101.6869',       // KL city center
    radius: '5000',              // 5km radius
    limit: '10',
    sort: 'RELEVANCE',

    // ── CORE fields (free) ──────────────────────────────────────
    fields: [
        'fsq_place_id',
        'name',
        'location',
        'categories',
        'distance',
        'latitude',
        'longitude',
        // ── PREMIUM fields (costs credits — uncomment when needed)
        // 'rating',
        // 'hours',
        // 'tel',
        // 'website',
        // 'description',
        // 'social_media',
        // 'photos',
        // 'tips',
        // 'price',
        // 'tastes',
        // 'features',
    ].join(','),
});

const url = `https://places-api.foursquare.com/places/search?${params}`;
console.log("Request URL:", url);

const res = await fetch(url, { method: 'GET', headers })
    .then(res => res.json())
    .then(data => console.log(JSON.stringify(data, null, 2)))
    .catch(err => console.error(err));