import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://mutual-connections.lovable.app";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const city = url.searchParams.get("city") || "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    let q = supabase.from("news").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(50);
    if (city) q = q.eq("city", city);

    const { data: articles } = await q;

    const items = (articles ?? []).map((a: any) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${BASE_URL}/news/${a.slug}</link>
      <description><![CDATA[${a.excerpt || ""}]]></description>
      <pubDate>${new Date(a.published_at).toUTCString()}</pubDate>
      <guid>${BASE_URL}/news/${a.slug}</guid>
      ${a.category ? `<category>${a.category}</category>` : ""}
    </item>`).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ВДрузьях — Новости${city ? ` (${city})` : ""}</title>
    <link>${BASE_URL}/news</link>
    <description>Последние новости ВДрузьях</description>
    <language>ru</language>
    ${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: { ...corsHeaders, "Content-Type": "application/rss+xml; charset=utf-8" },
    });
  } catch (err: any) {
    return new Response(`<error>${err.message}</error>`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }
});
