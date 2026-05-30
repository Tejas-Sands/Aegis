import { createClient } from "@supabase/supabase-js";
import * as cookie from "cookie";
import ws from "ws";
import { findUserByUnionId, upsertUser } from "../queries/users";
import { Errors } from "../../contracts/errors";
import { Session } from "../../contracts/constants";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
  realtime: {
    transport: ws as any,
  },
});

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie found in request.");
    throw Errors.forbidden("Invalid authentication token.");
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      console.warn("[auth] Supabase token verification failed:", error);
      throw Errors.forbidden("Invalid authentication token.");
    }

    let localUser = await findUserByUnionId(user.id);
    if (!localUser) {
      const metadata = user.user_metadata || {};
      const name = metadata.full_name || metadata.name || user.email?.split("@")[0] || "Agent";
      const avatar = metadata.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`;
      
      await upsertUser({
        unionId: user.id,
        name,
        avatar,
        email: user.email,
        lastSignInAt: new Date(),
      });
      localUser = await findUserByUnionId(user.id);
    }

    return localUser!;
  } catch (err) {
    console.error("[auth] authenticateRequest error:", err);
    throw Errors.forbidden("Authentication failed.");
  }
}
