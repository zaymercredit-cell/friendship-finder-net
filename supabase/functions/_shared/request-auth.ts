import { createClient } from "npm:@supabase/supabase-js@2";

export async function authenticatedUser(req: Request) {
  const authorization = req.headers.get("Authorization");
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_ANON_KEY");
  if (!authorization?.startsWith("Bearer ") || !url || !key) return null;
  const client = createClient(url, key, { auth: { persistSession: false }, global: { headers: { Authorization: authorization } } });
  const { data, error } = await client.auth.getUser(authorization.slice(7));
  return error ? null : data.user;
}

export async function boundedJson(req: Request, maxBytes = 65536): Promise<unknown> {
  if (Number(req.headers.get("content-length")) > maxBytes) throw new Error("Payload too large");
  const reader = req.body?.getReader();
  if (!reader) throw new Error("Missing payload");
  let total = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) { await reader.cancel(); throw new Error("Payload too large"); }
    chunks.push(value);
  }
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(result));
}