import { useEffect, useState } from "react";
import { Shield, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";
import { CyberPiratesBackground } from "@/components/CyberPiratesBackground";
import MagneticButton from "@/components/MagneticButton";
import { motion } from "framer-motion";
import { Session as AppSession } from "@contracts/constants";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setError(signInError.message); setLoading(false); }
      else if (data?.session) {
        document.cookie = `${AppSession.cookieName}=${data.session.access_token}; path=/; max-age=${AppSession.maxAgeMs / 1000}; samesite=lax`;
        window.location.href = "/dashboard";
      }
      else { setError("Unable to initialize session."); setLoading(false); }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred."); setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true); setError("");
    try {
      const { error: oAuthError } = await supabase.auth.signInWithOAuth({ provider: "github", options: { redirectTo: window.location.origin + "/dashboard" } });
      if (oAuthError) { setError(oAuthError.message); setLoading(false); }
    } catch (err: any) { setError(err?.message || "Error."); setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setLoading(true); setError("");
    try {
      const { error: oAuthError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/dashboard" } });
      if (oAuthError) { setError(oAuthError.message); setLoading(false); }
    } catch (err: any) { setError(err?.message || "Error."); setLoading(false); }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#000" }}>
        <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: "#000" }}>
      <CyberPiratesBackground />
      <div className="absolute inset-0 noise-overlay opacity-[0.04] pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-sm px-4"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Shield className="w-8 h-8 mb-3" style={{ color: "rgba(0,255,148,0.8)" }} />
          <span className="font-mono tracking-[0.25em] text-white text-sm">AEGIS</span>
          <p className="mt-3 section-label" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
            BOARDING PASS REQUIRED
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-card" style={{ padding: 36 }}>
          <form onSubmit={handleEmailLogin} className="space-y-5 mb-6">
            {error && (
              <div style={{ background: "rgba(165,45,37,0.12)", border: "1px solid rgba(165,45,37,0.3)", borderRadius: 10, padding: "10px 14px" }}>
                <p style={{ color: "rgba(255,120,100,0.9)", fontSize: 12, fontFamily: "JetBrains Mono, monospace" }}>{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", fontFamily: "JetBrains Mono, monospace" }}>
                EMAIL
              </Label>
              <Input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-mono text-sm"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                placeholder="pirate@aegis.fleet" required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", fontFamily: "JetBrains Mono, monospace" }}>
                PASSWORD
              </Label>
              <Input
                id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-mono text-sm"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                placeholder="••••••••" required
              />
            </div>
            <MagneticButton type="submit" disabled={loading} className="w-full">
              <span className="btn-pill-filled w-full justify-center" style={{ padding: "14px 32px" }}>
                <Zap className="w-4 h-4" />
                {loading ? "BOARDING..." : "BOARD SHIP"}
              </span>
            </MagneticButton>
          </form>

          <div className="relative mb-5">
            <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3" style={{ background: "rgba(255,255,255,0.04)", fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em" }}>OR</span>
          </div>

          <div className="space-y-3">
            <MagneticButton onClick={handleGithubLogin} disabled={loading} className="w-full">
              <span className="btn-pill-ghost w-full justify-center" style={{ padding: "12px 24px", fontSize: 12, letterSpacing: "0.08em" }}>
                CONTINUE WITH GITHUB
              </span>
            </MagneticButton>
            <MagneticButton onClick={handleGoogleLogin} disabled={loading} className="w-full">
              <span className="btn-pill-ghost w-full justify-center" style={{ padding: "12px 24px", fontSize: 12, letterSpacing: "0.08em", borderColor: "rgba(234,67,53,0.3)", color: "rgba(234,67,53,0.8)" }}>
                CONTINUE WITH GOOGLE
              </span>
            </MagneticButton>
          </div>

          <p className="mt-6 text-center section-label" style={{ color: "rgba(255,255,255,0.2)" }}>
            [ ENCRYPTED_CHANNEL // TLS_1.3 ]
          </p>
        </div>

        <p className="mt-8 text-center section-label" style={{ color: "rgba(255,255,255,0.15)" }}>
          AEGIS v2.4.1 // AUTONOMOUS_FLEET_INVESTIGATOR
        </p>
      </motion.div>
    </div>
  );
}
