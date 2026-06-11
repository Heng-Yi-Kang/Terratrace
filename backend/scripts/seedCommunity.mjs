// backend/scripts/seedCommunity.mjs
//
// Seeds the Community Impact module:
//   - 4 challenges (catalog)
//   - 4 sample eco-reviews tied to existing locations
//
// Requires:
//   - public.challenges, public.eco_reviews tables already created via Supabase SQL Editor
//   - At least 4 rows in public.locations
//   - At least one user in auth.users (sign up via the app first)
//
// Run from project root:
//   node backend/scripts/seedCommunity.mjs

import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseService) {
  console.error("ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseService);

// ─── Challenge catalog ───────────────────────────────────────────────────────

const CHALLENGES = [
  {
    title: "Low Carbon Week",
    description: "Keep your daily travel emissions under 5kg CO\u2082 for 7 consecutive days.",
    category: "Active",
    total: 7,
    unit: "days",
    points: 500,
    badge_name: "Carbon Crusher",
    badge_color: "#FBBF24",
    badge_icon: "leaf",
    participants: 12483,
    ends_at_days: 2,
  },
  {
    title: "Train Over Plane",
    description: "Choose rail travel over flights for 3 trips of 500km or less.",
    category: "Featured",
    total: 3,
    unit: "trips",
    points: 750,
    badge_name: "Rail Champion",
    badge_color: "#059669",
    badge_icon: "bolt",
    participants: 8201,
    ends_at_days: 28,
  },
  {
    title: "Eco-Reviewer Streak",
    description: "Write 10 verified eco-reviews of certified-green stays this month.",
    category: "Streak",
    total: 10,
    unit: "reviews",
    points: 400,
    badge_name: "Community Voice",
    badge_color: "#10B981",
    badge_icon: "pencil",
    participants: 4521,
    ends_at_days: 12,
  },
  {
    title: "Plant a Forest",
    description: "Offset 1 ton of CO\u2082 by supporting verified reforestation partners.",
    category: "Featured",
    total: 1000,
    unit: "kg",
    points: 1000,
    badge_name: "Forest Guardian",
    badge_color: "#FBBF24",
    badge_icon: "globe",
    participants: 2987,
    ends_at_days: 60,
  },
];

// ─── Sample review templates ─────────────────────────────────────────────────

const REVIEW_TEMPLATES = [
  {
    rating: 5,
    title: "Genuinely sustainable, not just greenwashed",
    body: "Solar panels powering everything, on-site composting, rainwater harvesting visible across the property. Staff are mostly locals and they actively run reforestation programs guests can join.",
    practices: ["Solar Energy", "Local Hiring", "Reforestation", "Zero Waste"],
    verified: true,
  },
  {
    rating: 4,
    title: "Strong on materials, weaker on energy",
    body: "Beautiful traditional construction with sustainable bamboo and reclaimed wood. Locally-sourced food was excellent. Half-star deduction \u2014 energy mix is still mostly grid, no visible renewables.",
    practices: ["Local Food", "Sustainable Materials", "Water Conservation"],
    verified: true,
  },
  {
    rating: 5,
    title: "Pack-in pack-out is non-negotiable for them",
    body: "Guides actively educate every group on Leave No Trace. They contract directly with local families and a large share of fees goes back into village schools. Refreshing to see structural impact.",
    practices: ["Leave No Trace", "Community Investment", "Fair Wages"],
    verified: true,
  },
  {
    rating: 4,
    title: "Hyper-local sourcing done right",
    body: "Everything on the menu was caught or grown within a few kilometers. Owned and run by a local family. The only reason it isn't five stars is the single-use plastic for takeaway.",
    practices: ["Hyper-Local Food", "Locally-Owned", "Cultural Heritage"],
    verified: false,
  },
];

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function seedChallenges() {
  console.log("NOTE: Seeding challenges catalog...");

  const rows = CHALLENGES.map(c => {
    const { ends_at_days, ...rest } = c;
    return { ...rest, ends_at: daysFromNow(ends_at_days) };
  });

  // Use upsert on title so re-running the script doesn't create duplicates.
  // Requires a unique constraint on challenges.title.
  // If you didn't add one, change this to plain .insert() but only run once.
  const { error } = await supabase
    .from("challenges")
    .upsert(rows, { onConflict: "title" });

  if (error) {
    console.error("ERROR seeding challenges:", error.message);
    return false;
  }

  console.log(`SUCCESS: ${rows.length} challenges seeded`);
  return true;
}

async function seedReviews() {
  console.log("\nNOTE: Seeding sample reviews...");

  // 1. Get the first 4 locations
  const { data: locations, error: locErr } = await supabase
    .from("locations")
    .select("id, name, city, country, category")
    .limit(4);

  if (locErr || !locations || locations.length === 0) {
    console.error("ERROR: Could not load locations. Make sure seedLocations.mjs ran first.");
    return false;
  }

  if (locations.length < 4) {
    console.warn(`WARNING: Only ${locations.length} locations found, expected 4. Seeding what we can.`);
  }

  // 2. Get the first user from auth.users
  const { data: usersData, error: userErr } = await supabase.auth.admin.listUsers();
  if (userErr || !usersData?.users?.length) {
    console.error("ERROR: No users in auth.users. Sign up via the app first, then re-run.");
    return false;
  }

  const sampleUserId = usersData.users[0].id;
  console.log(`NOTE: Using user ${usersData.users[0].email} as review author`);

  // 3. Build review rows
  const rows = locations.slice(0, 4).map((loc, i) => {
    const tmpl = REVIEW_TEMPLATES[i];
    return {
      location_id: loc.id,
      user_id: sampleUserId,
      rating: tmpl.rating,
      title: tmpl.title,
      body: tmpl.body,
      practices: tmpl.practices,
      verified: tmpl.verified,
    };
  });

  const { error } = await supabase.from("eco_reviews").insert(rows);

  if (error) {
    console.error("ERROR seeding reviews:", error.message);
    return false;
  }

  console.log(`SUCCESS: ${rows.length} reviews seeded`);
  return true;
}

async function main() {
  console.log("NOTE: Starting Community Impact seed...\n");

  const challengesOk = await seedChallenges();
  const reviewsOk = await seedReviews();

  if (challengesOk && reviewsOk) {
    console.log("\nFINISHED: Community seed complete!");
    process.exit(0);
  } else {
    console.log("\nFINISHED: Community seed completed with errors. See above.");
    process.exit(1);
  }
}

main().catch(err => {
  console.error("FATAL:", err);
  process.exit(1);
});
