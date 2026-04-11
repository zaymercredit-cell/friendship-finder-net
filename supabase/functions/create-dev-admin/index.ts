import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const email = "info@vdruzyah.local";
  const password = "admin";

  // Check if user exists
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);

  let userId: string;

  if (existing) {
    userId = existing.id;
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
      password,
    });
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: "Admin", last_name: "ВДрузьях", username: "admin" },
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    userId = data.user.id;
  }

  // Remove admin role from ALL other users
  const { error: cleanError } = await supabaseAdmin
    .from("user_roles")
    .delete()
    .eq("role", "admin")
    .neq("user_id", userId);

  // Assign admin role to this user (upsert)
  const { error: roleError } = await supabaseAdmin.from("user_roles").upsert(
    { user_id: userId, role: "admin" },
    { onConflict: "user_id,role" }
  );

  return new Response(
    JSON.stringify({
      ok: true,
      userId,
      email,
      cleanError: cleanError?.message ?? null,
      roleError: roleError?.message ?? null,
      message: "info@vdruzyah.local is now the ONLY admin",
    }),
    { headers: { "Content-Type": "application/json" } }
  );
});
