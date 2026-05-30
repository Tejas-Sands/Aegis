import { useEffect, useRef } from "react";
import { Link } from "react-router";
import Navbar from "@/components/Navbar";
import { CyberPiratesBackground } from "@/components/CyberPiratesBackground";
import MagneticButton from "@/components/MagneticButton";
import { Shield, Cpu, Database, Terminal, ArrowRight, Lock } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero headline char reveal
      const chars = headlineRef.current?.querySelectorAll(".abt-char");
      if (chars) {
        gsap.fromTo(chars,
          { opacity: 0, y: 50, rotateX: -30 },
          { opacity: 1, y: 0, rotateX: 0, duration: 1, ease: "expo.out", stagger: 0.03, delay: 0.5 }
        );
      }

      // Architecture cards
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: i * 0.12,
            scrollTrigger: { trigger: card, start: "top 82%" }
          }
        );
      });

      // Pipeline steps
      stepsRef.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { opacity: 0, x: -30 },
          {
            opacity: 1, x: 0, duration: 0.7, ease: "power3.out", delay: i * 0.1,
            scrollTrigger: { trigger: el, start: "top 80%" }
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const headline = "Smarter Raids";

  return (
    <div ref={containerRef} className="min-h-screen overflow-x-hidden" style={{ background: "#000" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden pt-20">
        <CyberPiratesBackground />
        <div className="absolute inset-0 noise-overlay opacity-[0.04] pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
            <Shield className="w-3.5 h-3.5" style={{ color: "rgba(160,224,171,0.8)" }} />
            <span className="section-label" style={{ color: "rgba(255,255,255,0.4)" }}>CORE LORE & STRATEGY</span>
          </div>

          <h1
            ref={headlineRef}
            className="mb-6"
            style={{
              fontSize: "clamp(48px, 8vw, 100px)",
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: "-0.035em",
              color: "#fff",
              perspective: 600,
            }}
          >
            {headline.split("").map((char, i) => (
              <span key={i} className="abt-char inline-block" style={{ opacity: 0, willChange: "transform" }}>
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
            <br />
            <span className="text-gradient">Without the Chaos.</span>
          </h1>

          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 18, fontWeight: 300, lineHeight: 1.6, maxWidth: 500, margin: "0 auto" }}>
            AEGIS replaces multi-tab debugging and chaotic war rooms with unified, local telemetry plundering and autonomous AI cartography.
          </p>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-24 px-6 lg:px-10 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: <Shield className="w-5 h-5" />,
              title: "THE_FLEET_BOTTLENECK",
              body: "When a system goes down, crews enter a reactive loop. They fetch traces from Sentry, scour charts in Datadog, check git logs for recent deploys, and debate hypotheses in Slack. This manual context-switching leads to alert fatigue and high MTTR.",
              color: "rgb(165,45,37)",
            },
            {
              icon: <ArrowRight className="w-5 h-5" />,
              title: "THE_AEGIS_RAID",
              body: "AEGIS acts as an autonomous fleet agent that does the reconnaissance instantly. By plundering remote services as local SQL tables via Coral and correlating events using an LLM, it traces the exact timeline from alert to bad commit automatically.",
              color: "rgb(0,255,148)",
            },
          ].map((item, i) => (
            <div
              key={i}
              ref={(el) => { cardsRef.current[i] = el; }}
              className="glass-card"
              style={{ opacity: 0 }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-6" style={{ background: `${item.color}15`, border: `1px solid ${item.color}30`, color: item.color }}>
                {item.icon}
              </div>
              <h3 className="font-mono mb-4" style={{ fontSize: 13, letterSpacing: "0.12em", color: "#fff" }}>{item.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 300, lineHeight: 1.75 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="py-24 px-6 lg:px-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="section-label block mb-3" style={{ color: "rgba(139,92,246,0.7)" }}>// FLEET ARCHITECTURE</span>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, color: "#fff", letterSpacing: "-0.02em" }}>Arsenal Blueprint</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: <Database className="w-5 h-5" />, num: "1.", title: "Coral SQL Layer", color: "#00D9FF", desc: "Plunders PagerDuty, Datadog, Sentry, GitHub, and Slack APIs under a unified local SQL interface. Executes JOINs across sources locally, keeping confidential telemetry in safe waters." },
            { icon: <Cpu className="w-5 h-5" />, num: "2.", title: "LLM Analysis Engine", color: "#00FF94", desc: "Powered by Groq Cloud's Llama 3.3 model and NVIDIA NIM (Meta Llama 3.1 & 3.3 Instruct). Charts anomalies, analyzes stack traces, and computes confidence scores." },
            { icon: <Terminal className="w-5 h-5" />, num: "3.", title: "Deck Operations", color: "#8B5CF6", desc: "Outputs real-time bounty reports, suggests rollback targets, highlights relevant code changes, and updates Slack channels with detailed root-cause intel." },
          ].map((item, i) => (
            <div
              key={i}
              ref={(el) => { cardsRef.current[i + 2] = el; }}
              className="glass-card group"
              style={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg" style={{ background: `${item.color}15`, color: item.color }}>{item.icon}</div>
                <h4 className="font-mono text-sm" style={{ color: "#fff" }}>{item.num} {item.title}</h4>
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 300, lineHeight: 1.75 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Zero Trust */}
      <section className="py-20 mx-6 lg:mx-10 max-w-6xl xl:mx-auto mb-20 rounded-2xl relative overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Lock className="w-48 h-48 text-white" />
        </div>
        <div className="px-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4" style={{ color: "rgb(160,224,171)" }} />
            <span className="section-label" style={{ color: "rgb(0,255,148)" }}>100%_LOCAL_WATERS_PROTOCOL</span>
          </div>
          <h3 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 400, color: "#fff", letterSpacing: "-0.02em", marginBottom: 16 }}>
            Zero-Trust Observability
          </h3>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, fontWeight: 300, lineHeight: 1.75, marginBottom: 24 }}>
            Traditional SRE agents force you to send metrics, logs, and sensitive source code metadata to third-party databases. AEGIS sails a different course: your data stays in your waters. Coral SQL performs raids directly to platform APIs using credentials stored locally, executing all correlations in-memory.
          </p>
          <div className="flex flex-wrap gap-3">
            {["🔒 Credentials Kept Local", "🛡️ Zero Data on Cloud", "⚡ TLS 1.3 Encryption"].map((tag) => (
              <span key={tag} className="section-label px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="py-24 px-6 lg:px-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="section-label block mb-3" style={{ color: "#00D9FF", opacity: 0.7 }}>// DEEP DIVE</span>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, color: "#fff", letterSpacing: "-0.02em" }}>Raid Discovery Pipeline</h2>
        </div>

        <div className="relative border-l pl-8 ml-4 space-y-12" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {[
            { title: "SIGNAL INTERCEPT", desc: "PagerDuty distress signals feed into the AEGIS router. The platform reads the affected service and logs the bounty in the local database.", color: "rgb(239,68,68)" },
            { title: "TELEMETRY RAID (CORAL SQL)", desc: "AEGIS fires parallel local raids to gather telemetry. It joins recent commits on GitHub with Sentry exceptions, Datadog charts, and Slack alerts.", color: "#00D9FF" },
            { title: "LLM CARTOGRAPHY (GROQ & NVIDIA NIM)", desc: "Meta Llama 3.3 & Llama 3.1 models from Groq Cloud and NVIDIA NIM chart stack traces, detect anomalous spikes, and map changes in commit history to the exact anomaly time.", color: "#00FF94" },
            { title: "PLUNDER RESOLUTION", desc: "A bounty report is published inside The Deck. The crew receives clear recommendations (e.g., \"Roll back commit #ab12cf on payment-service\") alongside metrics.", color: "#8B5CF6" },
          ].map((step, i) => (
            <div key={i} ref={(el) => { stepsRef.current[i] = el; }} className="relative" style={{ opacity: 0 }}>
              <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#000", border: `2px solid ${step.color}` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: step.color }} />
              </div>
              <h4 className="font-mono mb-2" style={{ fontSize: 12, letterSpacing: "0.12em", color: "#fff" }}>{step.title}</h4>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 300, lineHeight: 1.75, maxWidth: 560 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6">
        <h3 className="font-mono mb-6" style={{ fontSize: 18, color: "#fff", letterSpacing: "0.05em" }}>
          Board The Deck
        </h3>
        <div className="flex items-center justify-center gap-4">
          <Link to="/dashboard">
            <MagneticButton>
              <span className="btn-pill-filled">
                Access The Deck
                <ArrowRight className="w-4 h-4" />
              </span>
            </MagneticButton>
          </Link>
          <Link to="/">
            <MagneticButton>
              <span className="btn-pill-ghost">Home Port</span>
            </MagneticButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
