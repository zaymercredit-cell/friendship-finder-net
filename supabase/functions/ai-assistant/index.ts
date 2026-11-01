// AI Assistant — глобальный помощник по платформе ВДрузьях
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { authenticatedUser, boundedJson } from "../_shared/request-auth.ts";
import { z } from "npm:zod@3";
const schema = z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) })).min(1).max(20) });

const SYSTEM_PROMPT = `Ты — дружелюбный AI-помощник платформы знакомств "ВДрузьях".
Твоя роль:
- помогать с советами по знакомствам, общению, написанию первого сообщения
- объяснять как работают фичи (Discover, Matches, Vibe Rooms, Communities, Events, VIP)
- давать тёплые, человечные советы по самопрезентации в профиле
- помогать продумать идеи для встречи или события
- быть кратким (2-4 предложения), тёплым, не назидательным

Стиль: на русском, на "ты", без эмодзи в каждом сообщении (1-2 максимум).
Никогда не выдумывай данные о конкретных пользователях — только общие советы.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!await authenticatedUser(req)) return new Response(JSON.stringify({ error: "Необходим вход" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    let body: unknown;
    try { body = await boundedJson(req); } catch { return new Response(JSON.stringify({ error: "Некорректный или слишком большой запрос" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
    const parsed = schema.safeParse(body);
    if (!parsed.success) return new Response(JSON.stringify({ error: "Некорректные сообщения" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { messages } = parsed.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Слишком много запросов, попробуй чуть позже." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI-кредиты закончились. Пополни в настройках workspace." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
