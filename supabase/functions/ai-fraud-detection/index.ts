import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { authenticatedUser, boundedJson } from "../_shared/request-auth.ts";
import { z } from "npm:zod@3";
const schema = z.object({ message_text: z.string().min(1).max(10000), sender_id: z.string().uuid().optional() });

// Patterns that indicate potential fraud/spam
const spamPatterns = [
  /перевед(и|ите)\s*(мне\s*)?деньг/i,
  /отправь(те)?\s*(мне\s*)?на\s*карт/i,
  /срочн(о|ый)\s*(нуж|треб)/i,
  /инвестиц(ия|ии|ий)/i,
  /заработ(ок|ай|ать)\s*(без|легк|быстр)/i,
  /crypto|bitcoin|btc|крипт/i,
  /бесплатн(о|ый|ая)\s*(подарок|приз|выигры)/i,
  /перейд(и|ите)\s*по\s*ссылк/i,
  /telegram\.me|t\.me|wa\.me|bit\.ly/i,
  /пиши\s*(мне\s*)?(в|на)\s*(whatsapp|telegram|viber|инст)/i,
];

const suspiciousIndicators = [
  { pattern: /https?:\/\//gi, weight: 2, label: "external_link" },
  { pattern: /\b\d{16,}\b/g, weight: 5, label: "card_number" },
  { pattern: /\+?\d{10,}/g, weight: 1, label: "phone_number" },
  { pattern: /@\w+\.\w+/g, weight: 1, label: "email_in_message" },
];

function analyzeMessage(text: string): { score: number; flags: string[] } {
  let score = 0;
  const flags: string[] = [];

  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      score += 10;
      flags.push("spam_pattern");
    }
  }

  for (const indicator of suspiciousIndicators) {
    const matches = text.match(indicator.pattern);
    if (matches) {
      score += indicator.weight * matches.length;
      flags.push(indicator.label);
    }
  }

  // Very short repeated messages pattern
  if (text.length < 10 && /^(.)\1{4,}$/.test(text)) {
    score += 3;
    flags.push("repetitive_chars");
  }

  return { score: Math.min(100, score), flags: [...new Set(flags)] };
}

async function checkMassSending(supabase: any, userId: string): Promise<{ isMassSending: boolean; count: number }> {
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("sender_id", userId)
    .gte("created_at", oneHourAgo);

  return { isMassSending: (count || 0) > 50, count: count || 0 };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const user = await authenticatedUser(req);
    if (!user) return new Response(JSON.stringify({ error: "Необходим вход" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    let body: unknown;
    try { body = await boundedJson(req); } catch { return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
    const parsed = schema.safeParse(body);
    if (!parsed.success || (parsed.data.sender_id && parsed.data.sender_id !== user.id)) return new Response(JSON.stringify({ error: "Invalid sender or message" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) throw new Error("Server configuration missing");
    const supabase = createClient(supabaseUrl, serviceKey);

    const { message_text } = parsed.data;
    const sender_id = user.id;

    if (!message_text || !sender_id) {
      return new Response(JSON.stringify({ error: "message_text and sender_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const analysis = analyzeMessage(message_text);
    const massSending = await checkMassSending(supabase, sender_id);

    if (massSending.isMassSending) {
      analysis.score += 30;
      analysis.flags.push("mass_sending");
    }

    const isSuspicious = analysis.score >= 15;

    // Log to audit if suspicious
    if (isSuspicious) {
      await supabase.from("audit_log").insert({
        user_id: sender_id,
        action: "fraud_detection_alert",
        details: {
          score: analysis.score,
          flags: analysis.flags,
          messages_last_hour: massSending.count,
        },
      });
    }

    return new Response(JSON.stringify({
      suspicious: isSuspicious,
      score: analysis.score,
      flags: analysis.flags,
      warning: isSuspicious
        ? "Будьте осторожны — это сообщение может содержать подозрительный контент"
        : null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
