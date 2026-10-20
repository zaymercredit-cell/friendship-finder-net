import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Retired bootstrap endpoint: never create users, reset passwords or modify roles.
Deno.serve((req) => new Response(
  req.method === "OPTIONS" ? "ok" : JSON.stringify({ error: "Admin bootstrap is disabled" }),
  { status: req.method === "OPTIONS" ? 200 : 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
));