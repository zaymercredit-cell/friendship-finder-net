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

    const { type, targetUserId, conversationId, lastMessages } = await req.json();

    // Fetch user profile
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("first_name, last_name, age, city, interests, communication_goals, gender, about, work, education, ideal_date, favorite_movies, favorite_music, favorite_books, favorite_places, avatar_url")
      .eq("user_id", user.id)
      .single();

    // Fetch target profile if provided
    let targetProfile = null;
    if (targetUserId) {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, age, city, interests, communication_goals, gender, about, work, education, ideal_date, favorite_movies, favorite_music, favorite_books, favorite_places")
        .eq("user_id", targetUserId)
        .single();
      targetProfile = data;
    }

    let systemPrompt = "";
    let userPrompt = "";

    const myName = myProfile?.first_name || "Пользователь";
    const targetName = targetProfile?.first_name || "собеседник";
    const myInterests = (myProfile?.interests || []).join(", ") || "не указаны";
    const targetInterests = (targetProfile?.interests || []).join(", ") || "не указаны";
    const myGoals = (myProfile?.communication_goals || []).join(", ") || "не указаны";
    const targetGoals = (targetProfile?.communication_goals || []).join(", ") || "не указаны";
    const myCity = myProfile?.city || "не указан";
    const targetCity = targetProfile?.city || "не указан";

    switch (type) {
      case "first_message":
        systemPrompt = `Ты — AI-ассистент знакомств в приложении ВДрузьях. Генерируй дружелюбные, интересные варианты первого сообщения на русском языке. Будь естественным, не формальным. Учитывай интересы и город обоих пользователей. Отвечай ТОЛЬКО JSON массивом из 3 строк.`;
        userPrompt = `Сгенерируй 3 варианта первого сообщения.
Мой профиль: ${myName}, ${myProfile?.age || '?'} лет, город: ${myCity}, интересы: ${myInterests}, цели: ${myGoals}
Профиль собеседника: ${targetName}, ${targetProfile?.age || '?'} лет, город: ${targetCity}, интересы: ${targetInterests}, цели: ${targetGoals}
О себе собеседника: ${targetProfile?.about || 'не указано'}
Верни JSON массив из 3 строк.`;
        break;

      case "reply_suggestions":
        systemPrompt = `Ты — AI-ассистент знакомств. Предложи 3 варианта ответа на последнее сообщение собеседника. Будь дружелюбным и естественным. Отвечай ТОЛЬКО JSON массивом из 3 строк на русском.`;
        userPrompt = `Последние сообщения в диалоге:\n${(lastMessages || []).map((m: any) => `${m.isMine ? 'Я' : targetName}: ${m.text}`).join('\n')}\n\nМои интересы: ${myInterests}\nИнтересы собеседника: ${targetInterests}\nПредложи 3 варианта ответа. Верни JSON массив из 3 строк.`;
        break;

      case "conversation_topics":
        systemPrompt = `Ты — AI-ассистент знакомств. Предложи темы для разговора на основе общих интересов двух пользователей. Отвечай ТОЛЬКО JSON массивом из 5 объектов с полями "topic" и "question" на русском.`;
        userPrompt = `Мои интересы: ${myInterests}, цели: ${myGoals}\nИнтересы собеседника: ${targetInterests}, цели: ${targetGoals}\nОбщий город: ${myCity === targetCity ? myCity : 'разные города'}\nПредложи 5 тем для разговора. Верни JSON массив объектов [{topic, question}].`;
        break;

      case "compatibility_analysis":
        systemPrompt = `Ты — AI-аналитик совместимости. Проанализируй совместимость двух пользователей и дай краткое объяснение на русском. Отвечай ТОЛЬКО JSON объектом с полями "score" (0-100), "summary" (1 предложение), "shared" (массив общих черт), "tips" (массив 2 советов для общения).`;
        userPrompt = `Мой профиль: ${myName}, ${myProfile?.age || '?'} лет, город: ${myCity}, интересы: ${myInterests}, цели: ${myGoals}, пол: ${myProfile?.gender || '?'}
Профиль собеседника: ${targetName}, ${targetProfile?.age || '?'} лет, город: ${targetCity}, интересы: ${targetInterests}, цели: ${targetGoals}, пол: ${targetProfile?.gender || '?'}
Проанализируй совместимость. Верни JSON: {score, summary, shared, tips}`;
        break;

      case "profile_tips":
        systemPrompt = `Ты — AI-консультант по профилям знакомств. Дай советы по улучшению профиля. Отвечай ТОЛЬКО JSON массивом из 2-3 объектов с полями "tip" и "impact" (high/medium/low) на русском.`;
        userPrompt = `Профиль: имя: ${myName}, возраст: ${myProfile?.age || 'не указан'}, город: ${myCity}, интересы: ${myInterests} (${(myProfile?.interests || []).length} шт), цели: ${myGoals}, о себе: ${myProfile?.about || 'не заполнено'}, фото: ${myProfile?.avatar_url ? 'есть' : 'нет'}, работа: ${myProfile?.work || 'не указана'}, образование: ${myProfile?.education || 'не указано'}\nДай советы по улучшению. Верни JSON: [{tip, impact}]`;
        break;

      case "icebreaker":
        systemPrompt = `Ты — AI-генератор вопросов для знакомств. Генерируй интересные, необычные, весёлые вопросы для начала общения. Вопросы должны быть легкими, не слишком личными, стимулировать интересный диалог. Отвечай ТОЛЬКО JSON массивом из 5 строк на русском.`;
        userPrompt = `Мои интересы: ${myInterests}, цели: ${myGoals}
${targetProfile ? `Интересы собеседника: ${targetInterests}` : ''}
Сгенерируй 5 интересных вопросов-icebreaker для начала разговора. Верни JSON массив из 5 строк.`;
        break;

      case "profile_highlights":
        systemPrompt = `Ты — AI-аналитик профилей знакомств. Выдели 3-5 ключевых привлекательных черт профиля пользователя — то, что выделяет его среди других. Отвечай ТОЛЬКО JSON массивом из 3-5 объектов с полями "highlight" (короткая фраза) и "emoji" (один эмодзи) на русском.`;
        userPrompt = `Профиль: ${myName}, ${myProfile?.age || '?'} лет, город: ${myCity}, интересы: ${myInterests}, цели: ${myGoals}, о себе: ${myProfile?.about || 'не указано'}, работа: ${myProfile?.work || 'не указана'}, идеальное свидание: ${myProfile?.ideal_date || 'не указано'}
Выдели ключевые привлекательные черты. Верни JSON: [{highlight, emoji}]`;
        break;

      case "profile_score":
        systemPrompt = `Ты — AI-аналитик профилей знакомств. Оцени качество профиля по шкале 0-100 и дай конкретные рекомендации. Отвечай ТОЛЬКО JSON объектом с полями "score" (число 0-100), "level" (одно из: "начинающий", "базовый", "хороший", "отличный", "идеальный"), "recommendations" (массив из 2-3 объектов с полями "action" и "impact_points" — сколько баллов добавит это действие).`;
        userPrompt = `Оцени профиль: имя: ${myName}, возраст: ${myProfile?.age || 'не указан'}, город: ${myCity}, интересы: ${myInterests} (${(myProfile?.interests || []).length} шт), цели: ${myGoals}, о себе: ${myProfile?.about || 'не заполнено'} (${(myProfile?.about || '').length} символов), фото: ${myProfile?.avatar_url ? 'есть' : 'нет'}, работа: ${myProfile?.work || 'не указана'}, образование: ${myProfile?.education || 'не указано'}, любимые фильмы: ${(myProfile?.favorite_movies || []).length}, любимая музыка: ${(myProfile?.favorite_music || []).length}, любимые книги: ${(myProfile?.favorite_books || []).length}
Верни JSON: {score, level, recommendations: [{action, impact_points}]}`;
        break;

      case "daily_suggestions":
        systemPrompt = `Ты — AI-рекомендатель в социальной сети знакомств. Составь краткие персонализированные рекомендации на сегодня. Отвечай ТОЛЬКО JSON объектом с полями: "greeting" (тёплое приветствие на 1 строку), "tips" (массив из 3 объектов с полями "type" (people/event/action), "text" (короткая рекомендация), "emoji" (один эмодзи)).`;
        userPrompt = `Мой профиль: ${myName}, город: ${myCity}, интересы: ${myInterests}, цели: ${myGoals}
Составь персональные рекомендации на сегодня. Верни JSON: {greeting, tips: [{type, text, emoji}]}`;
        break;

      case "match_insights":
        systemPrompt = `Ты — AI-аналитик совпадений в соцсети знакомств. Кратко объясни, почему два человека совпали, и дай совет для первого общения. Отвечай ТОЛЬКО JSON объектом с полями: "reasons" (массив из 2-3 коротких причин совпадения), "conversation_tip" (один совет для начала общения).`;
        userPrompt = `Мой профиль: ${myName}, ${myProfile?.age || '?'} лет, город: ${myCity}, интересы: ${myInterests}, цели: ${myGoals}
Профиль совпадения: ${targetName}, ${targetProfile?.age || '?'} лет, город: ${targetCity}, интересы: ${targetInterests}, цели: ${targetGoals}
Объясни причины совпадения. Верни JSON: {reasons, conversation_tip}`;
        break;

      case "personality_compatibility": {
        // Fetch personality profiles
        const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        const [myPers, theirPers] = await Promise.all([
          serviceClient.from("personality_profiles").select("personality_type, traits").eq("user_id", user.id).maybeSingle(),
          serviceClient.from("personality_profiles").select("personality_type, traits").eq("user_id", targetUserId).maybeSingle(),
        ]);
        const myPersonality = myPers.data?.personality_type || "не определён";
        const myTraits = JSON.stringify(myPers.data?.traits || {});
        const theirPersonality = theirPers.data?.personality_type || "не определён";
        const theirTraits = JSON.stringify(theirPers.data?.traits || {});

        systemPrompt = `Ты — AI-психолог в социальной сети знакомств. Проанализируй психологическую совместимость двух пользователей на основе их психотипов, черт характера, интересов и целей. Отвечай ТОЛЬКО JSON объектом с полями: "score" (0-100), "summary" (1-2 предложения), "dimensions" (массив из 4 объектов {label, score (0-100), emoji} — оценки по категориям: интересы, характер, стиль общения, цели), "communication_style" (совет по стилю общения), "tips" (массив из 2-3 советов).`;
        userPrompt = `Мой профиль: ${myName}, ${myProfile?.age || '?'} лет, город: ${myCity}, интересы: ${myInterests}, цели: ${myGoals}, психотип: ${myPersonality}, черты: ${myTraits}
Профиль собеседника: ${targetName}, ${targetProfile?.age || '?'} лет, город: ${targetCity}, интересы: ${targetInterests}, цели: ${targetGoals}, психотип: ${theirPersonality}, черты: ${theirTraits}
Проанализируй психологическую совместимость. Верни JSON: {score, summary, dimensions: [{label, score, emoji}], communication_style, tips}`;
        break;
      }

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
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      parsed = content;
    }

    // Cache the suggestion
    if (targetUserId && (Array.isArray(parsed) || typeof parsed === 'object')) {
      const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await serviceClient.from("ai_suggestions").insert({
        user_id: user.id,
        target_user_id: targetUserId,
        suggestion_type: type,
        content: JSON.stringify(parsed),
      }).catch(() => {});
    }

    return new Response(JSON.stringify({ data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
