import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BASE_URL = "https://mutual-connections.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const cities = [
  "moscow", "spb", "kazan", "novosibirsk", "ekaterinburg",
  "nizhny-novgorod", "sochi", "krasnodar", "samara", "rostov-na-donu",
  "voronezh", "krasnoyarsk", "perm", "volgograd", "tyumen",
];

const interests = [
  "travel", "photography", "sport", "cinema", "music", "cooking",
  "yoga", "it", "art", "books", "mountains", "cycling", "games",
  "dance", "science", "design", "languages", "volunteering", "theatre",
  "coffee", "wine", "running", "swimming", "meditation",
];

const ageRanges = ["18-22", "23-27", "28-32", "33-37", "38-45", "45-55"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    let urls: string[] = [
      BASE_URL + "/",
      BASE_URL + "/cities",
      BASE_URL + "/interests",
    ];

    // City pages
    cities.forEach(c => urls.push(`${BASE_URL}/dating/${c}`));

    // Interest pages
    interests.forEach(i => urls.push(`${BASE_URL}/dating/interests/${i}`));

    // Age pages
    ageRanges.forEach(r => urls.push(`${BASE_URL}/dating/age/${r}`));

    // Public profiles (first 1000)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("username")
      .not("username", "is", null)
      .limit(1000);

    if (profiles) {
      profiles.forEach(p => {
        if (p.username) urls.push(`${BASE_URL}/u/${p.username}`);
      });
    }

    // Events
    const { data: meetups } = await supabase
      .from("meetups")
      .select("id")
      .limit(500);

    if (meetups) {
      meetups.forEach(m => urls.push(`${BASE_URL}/events/${m.id}`));
    }

    // News
    urls.push(`${BASE_URL}/news`);
    const { data: newsArticles } = await supabase
      .from("news")
      .select("slug, category")
      .eq("status", "published")
      .limit(1000);

    if (newsArticles) {
      newsArticles.forEach((n: any) => urls.push(`${BASE_URL}/news/${n.slug}`));
    }

    // News categories
    ["city","incidents","business","sport","culture","society"].forEach(c =>
      urls.push(`${BASE_URL}/news?category=${c}`)
    );

    const today = new Date().toISOString().split("T")[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
  </url>`).join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  } catch (err: any) {
    return new Response(`<error>${err.message}</error>`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }
});
