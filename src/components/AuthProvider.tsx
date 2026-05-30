import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Session as AppSession } from "@contracts/constants";
import type { Session } from "@supabase/supabase-js";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        document.cookie = `${AppSession.cookieName}=${session.access_token}; path=/; max-age=${AppSession.maxAgeMs / 1000}; samesite=lax`;
      } else {
        document.cookie = `${AppSession.cookieName}=; path=/; max-age=0; samesite=lax`;
      }
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      if (session) {
        document.cookie = `${AppSession.cookieName}=${session.access_token}; path=/; max-age=${AppSession.maxAgeMs / 1000}; samesite=lax`;
      } else {
        document.cookie = `${AppSession.cookieName}=; path=/; max-age=0; samesite=lax`;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[#030305] flex items-center justify-center text-[#00F0FF]">Loading...</div>;
  }

  return <>{children}</>;
}
