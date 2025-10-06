import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://xufneikpvakgomsncqsp.supabase.co";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY secret");
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface SignupBody {
  loginId: string;
  username: string;
  password: string;
}

const validate = (b: SignupBody) => {
  const idOk = /^[a-zA-Z0-9_]{3,20}$/.test(b.loginId?.trim?.());
  const nameOk = typeof b.username === "string" && b.username.trim().length > 0 && b.username.trim().length <= 20;
  const passOk = typeof b.password === "string" && b.password.length >= 6 && b.password.length <= 72;
  return idOk && nameOk && passOk;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const body = (await req.json()) as SignupBody;
    if (!validate(body)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const syntheticEmail = `${body.loginId}@app.internal.com`;

    // 1) Create user with confirmed email
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: syntheticEmail,
      password: body.password,
      email_confirm: true,
      user_metadata: { username: body.username, login_id: body.loginId },
    });

    if (createErr) {
      const msg = createErr.message || "Failed to create user";
      const status = msg.includes("already registered") ? 409 : 500;
      return new Response(JSON.stringify({ error: msg }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = created.user?.id;

    // 2) Create profile and initial pet (service role bypasses RLS)
    if (userId) {
      await admin.from("profiles").insert({ id: userId, username: body.username, food_count: 0 });
      await admin.from("pets").insert({
        user_id: userId,
        name: "첫 번째 알",
        type: "dragon",
        growth_stage: "egg",
        hunger_level: 50,
        happiness_level: 50,
      });
    }

    return new Response(
      JSON.stringify({ success: true, email: syntheticEmail, user_id: userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("username-signup error", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
