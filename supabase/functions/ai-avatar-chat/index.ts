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

    const { targetUserId, question, history } = await req.json();
    if (!targetUserId || !question) {
      return new Response(JSON.stringify({ error: "targetUserId and question required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch target profile
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name, age, city, interests, communication_goals, gender, about, work, education, ideal_date, favorite_movies, favorite_music, favorite_books, favorite_places, is_online")
      .eq("user_id", targetUserId)
      .single();

    if (!targetProfile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if avatar is enabled
    const { data: avatarSettings } = await supabase
      .from("ai_avatar_profiles")
      .select("*")
      .eq("user_id", targetUserId)
      .single();

    // Avatar is available by default (even without explicit settings row)
    const isEnabled = avatarSettings ? avatarSettings.enabled : true;
    if (!isEnabled) {
      return new Response(JSON.stringify({ error: "AI-аватар этого пользователя отключён" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const name = targetProfile.first_name || "Пользователь";
    const interests = (targetProfile.interests || []).join(", ") || "не указаны";
    const goals = (targetProfile.communication_goals || []).join(", ") || "не указаны";
    const movies = (targetProfile.favorite_movies || []).join(", ");
    const music = (targetProfile.favorite_music || []).join(", ");
    const books = (targetProfile.favorite_books || []).join(", ");
    const places = (targetProfile.favorite_places || []).join(", ");
    const personalitySummary = avatarSettings?.personality_summary || "";

    const systemPrompt = `Ты — AI-аватар пользователя ${name} в социальной сети знакомств ВДрузьях.

Твоя задача — представлять ${name}, пока он(а) не в сети, и помогать другим пользователям узнать о нём/ней больше.

ДАННЫЕ ПРОФИЛЯ:
- Имя: ${name}
- Возраст: ${targetProfile.age || "не указан"}
- Город: ${targetProfile.city || "не указан"}
- Пол: ${targetProfile.gender === "male" ? "мужской" : targetProfile.gender === "female" ? "женский" : "не указан"}
- О себе: ${targetProfile.about || "не заполнено"}
- Интересы: ${interests}
- Цели общения: ${goals}
- Работа: ${targetProfile.work || "не указана"}
- Образование: ${targetProfile.education || "не указано"}
- Идеальное свидание: ${targetProfile.ideal_date || "не указано"}
- Любимые фильмы: ${movies || "не указаны"}
- Любимая музыка: ${music || "не указана"}
- Любимые книги: ${books || "не указаны"}
- Любимые места: ${places || "не указаны"}
${personalitySummary ? `- Дополнительно о себе: ${personalitySummary}` : ""}

ПРАВИЛА:
1. Говори от третьего лица: "Судя по профилю, ${name}..." или "${name} интересуется..."
2. НИКОГДА не выдавай личные данные (номер телефона, email, точный адрес)
3. Не отвечай на провокационные, оскорбительные или чувствительные вопросы
4. Если информация отсутствует в профиле, честно скажи: "Этой информации в профиле нет"
5. Будь дружелюбным, тёплым и естественным
6. Отвечай коротко — 1-3 предложения
7. Если уместно, предложи написать ${name} напрямую для более подробного ответа
8. Не выдумывай факты — используй только данные из профиля`;

    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: "user", content: question });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Слишком много запросов, попробуйте позже" }), {
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
    const answer = aiData.choices?.[0]?.message?.content || "Не удалось получить ответ.";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI avatar error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
