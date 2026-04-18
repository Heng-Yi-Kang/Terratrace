// scripts/seedOsm.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

const CATEGORY_LOREMFLICKR_TAGS = {
    Accommodation: 'hotel',
    Dining: 'vegetables',
    Transport: 'electric-bus,public-transport',
};

function getRandomPlaceholderImage(category, rowSeed) {
    const tags = CATEGORY_LOREMFLICKR_TAGS[category] || 'sustainable-city,green-lifestyle';
    // const query = CATEGORY_UNSPLASH_QUERIES[category] || 'sustainable-city,green-lifestyle';
    // return `https://source.unsplash.com/featured/1200x800?${encodeURIComponent(query)}&sig=${rowSeed}`;
    return `https://loremflickr.com/1200/800/${tags}?lock=${encodeURIComponent(rowSeed)}`;
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
        const response = await axios.post(
            'https://overpass-api.de/api/interpreter',
            `data=${encodeURIComponent(OVERPASS_QUERY)}`,
            { timeout: 100000 }
        );
        const elements = response.data.elements;

        if (!elements || elements.length === 0) {
            console.log('No locations found matching the query.');
            return;
        }

        console.log(`Found ${elements.length} locations. Formatting data...`);

        // 2. Format Data to match your Supabase schema
        const formattedLocations = elements.map((el) => {
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

            return {
                // id: will be auto-generated by Supabase if your column is set to gen_random_uuid()
                name: tags['name:en'] || tags.name || 'Unnamed Location',
                category: category,
                city: 'Kuala Lumpur',
                lat: lat,
                long: long,
                eco_certs: certs, // maps to jsonb
                image_url: getRandomPlaceholderImage(category, `${el.type}-${el.id}`),
                ex_booking_url: tags.website || null
            };
        }).filter(loc => loc.lat && loc.long); // Ensure we have valid coordinates

        // 3. Insert into Supabase
        console.log('Inserting into Supabase locations table...');
        const { data, error } = await supabase
            .from('locations')
            .insert(formattedLocations)
            .select();

        if (error) {
            console.error('Error inserting data:', error);
        } else {
            console.log(`Successfully inserted ${data.length} records!`);
        }

    } catch (error) {
        console.error('An error occurred during seeding:', error.message);
    }
}

seedDatabase();