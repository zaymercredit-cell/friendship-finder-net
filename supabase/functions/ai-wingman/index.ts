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

    const { type, targetUserId, lastMessages, context } = await req.json();

    const { data: myProfile } = await supabase
      .from("profiles")
      .select("first_name, age, city, interests, communication_goals, about, temperament, communication_style, life_values, lifestyle, ideal_date")
      .eq("user_id", user.id)
      .single();

    let targetProfile = null;
    if (targetUserId) {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, age, city, interests, communication_goals, about, temperament, communication_style, life_values, lifestyle, ideal_date")
        .eq("user_id", targetUserId)
        .single();
      targetProfile = data;
    }

    const myName = myProfile?.first_name || "Пользователь";
    const targetName = targetProfile?.first_name || "собеседник";
    const myInterests = (myProfile?.interests || []).join(", ") || "не указаны";
    const targetInterests = (targetProfile?.interests || []).join(", ") || "не указаны";
    const myGoals = (myProfile?.communication_goals || []).join(", ") || "не указаны";
    const targetGoals = (targetProfile?.communication_goals || []).join(", ") || "не указаны";

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "conversation_coach":
        systemPrompt = `Ты — AI-тренер общения (Wingman) в приложении знакомств ВДрузьях. Анализируй диалог и давай умные, ненавязчивые подсказки. Будь кратким, дружелюбным. Отвечай ТОЛЬКО JSON объектом: {"nudge": "одна подсказка", "tone": "friendly|flirty|deep|fun", "suggest_meetup": boolean, "energy": "high|medium|low"}`;
        userPrompt = `Последние сообщения:\n${(lastMessages || []).map((m: any) => `${m.isMine ? 'Я' : targetName}: ${m.text}`).join('\n')}\n\nМои интересы: ${myInterests}\nИнтересы собеседника: ${targetInterests}\nМой стиль: ${myProfile?.communication_style || 'не указан'}\nПроанализируй и дай подсказку.`;
        break;

      case "date_ideas":
        systemPrompt = `Ты — AI-планировщик свиданий. Предложи 4 идеи первой встречи на основе интересов и города. Отвечай ТОЛЬКО JSON массивом из 4 объектов: [{idea: "название", emoji: "один эмодзи", description: "1 предложение", type: "coffee|walk|activity|event"}]`;
        userPrompt = `Мой профиль: ${myName}, ${myProfile?.age || '?'} лет, город: ${myProfile?.city || '?'}, интересы: ${myInterests}, идеальное свидание: ${myProfile?.ideal_date || 'не указано'}
Собеседник: ${targetName}, ${targetProfile?.age || '?'} лет, город: ${targetProfile?.city || '?'}, интересы: ${targetInterests}, идеальное свидание: ${targetProfile?.ideal_date || 'не указано'}
Предложи 4 идеи встречи.`;
        break;

      case "smart_replies":
        systemPrompt = `Ты — AI-ассистент общения. Сгенерируй 3 варианта ответа разного тона: 1) краткий и дружелюбный, 2) игривый/с юмором, 3) глубокий/серьёзный. Отвечай ТОЛЬКО JSON массивом из 3 объектов: [{text: "ответ", tone: "friendly|playful|deep", emoji: "один эмодзи"}]`;
        userPrompt = `Последние сообщения:\n${(lastMessages || []).map((m: any) => `${m.isMine ? 'Я' : targetName}: ${m.text}`).join('\n')}\n\nМои интересы: ${myInterests}\nСгенерируй 3 варианта ответа.`;
        break;

      case "wingman_insights":
        systemPrompt = `Ты — AI Wingman в приложении знакомств. Проанализируй профиль и дай краткие инсайты: почему с этим человеком будет легко общаться, что у вас общего, какие темы подойдут. Отвечай ТОЛЬКО JSON объектом: {"chemistry": "краткий вывод", "common_ground": ["общее 1", "общее 2", "общее 3"], "talk_about": ["тема 1", "тема 2"], "vibe": "romantic|friendly|intellectual|adventurous", "tip": "один совет"}`;
        userPrompt = `Мой профиль: ${myName}, ${myProfile?.age || '?'} лет, ${myProfile?.city || '?'}, интересы: ${myInterests}, цели: ${myGoals}, темперамент: ${myProfile?.temperament || '?'}, стиль: ${myProfile?.communication_style || '?'}, ценности: ${(myProfile?.life_values || []).join(', ') || '?'}
Профиль: ${targetName}, ${targetProfile?.age || '?'} лет, ${targetProfile?.city || '?'}, интересы: ${targetInterests}, цели: ${targetGoals}, темперамент: ${targetProfile?.temperament || '?'}, стиль: ${targetProfile?.communication_style || '?'}, ценности: ${(targetProfile?.life_values || []).join(', ') || '?'}
О себе: ${targetProfile?.about || 'не указано'}`;
        break;

      case "conversation_starters":
        systemPrompt = `Ты — AI-генератор стартеров разговора. Создай 3 креативных, персонализированных способа начать разговор. Каждый должен быть коротким (1-2 предложения), основанным на общих интересах. Отвечай ТОЛЬКО JSON массивом из 3 объектов: [{text: "стартер", category: "interests|humor|question|compliment", emoji: "один эмодзи"}]`;
        userPrompt = `Мои интересы: ${myInterests}, город: ${myProfile?.city || '?'}
Интересы собеседника: ${targetInterests}, город: ${targetProfile?.city || '?'}
О собеседнике: ${targetProfile?.about || 'не указано'}
Создай 3 стартера разговора.`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Unknown type" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

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
      console.error("AI wingman error:", response.status, t);
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
      parsed = content;
    }

    return new Response(JSON.stringify({ data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI wingman error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
