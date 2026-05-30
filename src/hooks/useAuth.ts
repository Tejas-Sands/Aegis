import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useNavigate } from "react-router";
import { LOGIN_PATH } from "@/const";
import { supabase } from "@/lib/supabase";

export interface AuthUser {
  id: number;
  unionId: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: string;
  createdAt: Date;
}

export function useAuth(options?: {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
}) {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [isLoading, setIsLoading] = useState(true);

  const {
    data: user,
    isLoading: queryLoading,
    error,
  } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!queryLoading) {
      setIsLoading(false);
    }
  }, [queryLoading]);

  useEffect(() => {
    if (
      options?.redirectOnUnauthenticated &&
      !isLoading &&
      !user &&
      error
    ) {
      navigate(options.redirectPath ?? LOGIN_PATH);
    }
  }, [options, isLoading, user, error, navigate]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    utils.auth.me.invalidate();
    window.location.href = "/";
  }, [utils]);

  return {
    user: user as AuthUser | undefined,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.role === "admin",
    logout,
  };
}
