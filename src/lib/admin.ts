import type { AuthClient } from "@supabase/auth-js";
import { supabase } from "@/integrations/supabase/client";

const auth = supabase.auth as unknown as AuthClient;

/** Returns true only when the current session belongs to an admin user. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: userData, error: userError } = await auth.getUser();
  if (userError || !userData.user) return false;

  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (error) return false;
  return data === true;
}
