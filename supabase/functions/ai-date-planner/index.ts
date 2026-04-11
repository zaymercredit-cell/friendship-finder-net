import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "targetUserId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: myProfile }, { data: targetProfile }] = await Promise.all([
      supabase.from("profiles")
        .select("first_name, age, city, interests, communication_goals, about, favorite_movies, favorite_music, favorite_places, ideal_date")
        .eq("user_id", user.id).single(),
      supabase.from("profiles")
        .select("first_name, age, city, interests, communication_goals, about, favorite_movies, favorite_music, favorite_places, ideal_date")
        .eq("user_id", targetUserId).single(),
    ]);

    const myName = myProfile?.first_name || "Пользователь";
    const targetName = targetProfile?.first_name || "собеседник";
    const myInterests = (myProfile?.interests || []).join(", ") || "не указаны";
    const targetInterests = (targetProfile?.interests || []).join(", ") || "не указаны";
    const myCity = myProfile?.city || "не указан";
    const targetCity = targetProfile?.city || "не указан";
    const commonCity = myCity === targetCity ? myCity : null;
    const myPlaces = (myProfile?.favorite_places || []).join(", ");
    const targetPlaces = (targetProfile?.favorite_places || []).join(", ");

    const systemPrompt = `Ты — AI Date Planner в социальной сети знакомств ВДрузьях. Предложи 5 идей для свидания двух пользователей.

Каждая идея должна быть конкретной, романтичной и учитывать общие интересы.
${commonCity ? `Оба пользователя из города ${commonCity} — предложи реальные варианты для этого города.` : ''}

Отвечай ТОЛЬКО JSON массивом из 5 объектов с полями:
- "emoji" (один эмодзи)
- "title" (короткое название, 3-5 слов)  
- "description" (описание на 1-2 предложения)
- "location" (предложение места, если известен город)
- "vibe" (одно из: romantic, active, creative, chill, adventure)`;

    const userPrompt = `Профиль 1: ${myName}, ${myProfile?.age || '?'} лет, город: ${myCity}, интересы: ${myInterests}, идеальное свидание: ${myProfile?.ideal_date || 'не указано'}, любимые места: ${myPlaces || 'не указаны'}
Профиль 2: ${targetName}, ${targetProfile?.age || '?'} лет, город: ${targetCity}, интересы: ${targetInterests}, идеальное свидание: ${targetProfile?.ideal_date || 'не указано'}, любимые места: ${targetPlaces || 'не указаны'}

Предложи 5 идей для свидания. Верни JSON массив.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Слишком много запросов" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Требуется пополнение баланса" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      parsed = [];
    }

    return new Response(JSON.stringify({ data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI date planner error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
