import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Shield, ArrowRight, LogIn, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import { CyberPiratesBackground } from "@/components/CyberPiratesBackground";
import MagneticButton from "@/components/MagneticButton";
import { useAuth } from "@/hooks/useAuth";
import { TextScramble } from "@/components/TextScramble";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#000" }}>
      <Navbar />
      <HeroSection />
      <ManifestoSection />
      <WorkShowcase />
      <StatsMarquee />
      <HowItWorks />
      <ContactSection />
      <FooterSection />
    </div>
  );
}

/* ─── HERO ─── */
function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlineRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.4 });

      tl.fromTo(overlineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      // Character-level reveal for headline
      const chars = headlineRef.current?.querySelectorAll(".char");
      if (chars) {
        tl.fromTo(chars,
          { opacity: 0, y: 60, rotateX: -40 },
          { opacity: 1, y: 0, rotateX: 0, duration: 1, ease: "expo.out", stagger: 0.025 },
          "-=0.4"
        );
      }

      tl.fromTo(subRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
        "-=0.5"
      );
      tl.fromTo(ctaRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        "-=0.5"
      );
      tl.fromTo(scrollRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        "-=0.2"
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const headline = "AEGIS";

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      <CyberPiratesBackground />

      {/* Noise */}
      <div className="absolute inset-0 noise-overlay opacity-[0.04] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div ref={overlineRef} className="mb-8" style={{ opacity: 0 }}>
          <span className="section-label flex items-center justify-center gap-2" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.3em" }}>
            <TextScramble text="AUTONOMOUS FLEET INVESTIGATOR" speed={40} delay={600} />
            &nbsp;·&nbsp; GROQ + NVIDIA NIM
          </span>
        </div>

        <div
          ref={headlineRef}
          className="mb-8 overflow-hidden"
          style={{
            fontSize: "clamp(72px, 18vw, 240px)",
            fontWeight: 400,
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            perspective: 800,
          }}
        >
          {headline.split("").map((char, i) => (
            <span
              key={i}
              className="char inline-block text-gradient-plunder"
              style={{ opacity: 0, willChange: "transform" }}
            >
              {char}
            </span>
          ))}
        </div>

        <p
          ref={subRef}
          className="mb-12 mx-auto"
          style={{
            opacity: 0,
            maxWidth: 480,
            color: "rgba(255,255,255,0.45)",
            fontSize: 18,
            fontWeight: 300,
            lineHeight: 1.6,
          }}
        >
          Plunders alerts, commits, errors, and metrics in a single raid.
          Cross-source JOINs. Zero trust. 100% local waters.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4" style={{ opacity: 0 }}>
          {!isLoading && (
            isAuthenticated ? (
              <MagneticButton onClick={() => navigate("/dashboard")}>
                <span className="btn-pill-filled">
                  Board The Deck
                  <ArrowRight className="w-4 h-4" />
                </span>
              </MagneticButton>
            ) : (
              <>
                <MagneticButton onClick={() => navigate("/login")}>
                  <span className="btn-pill-filled">
                    <LogIn className="w-4 h-4" />
                    Board Ship
                  </span>
                </MagneticButton>
                <MagneticButton href="/about">
                  <span className="btn-pill-ghost">
                    Explore The Lore
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </MagneticButton>
              </>
            )
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity: 0, animation: "scroll-bounce 2s ease-in-out infinite" }}
      >
        <span className="section-label" style={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}>SCROLL</span>
        <ChevronDown className="w-4 h-4" style={{ color: "rgba(255,255,255,0.2)" }} />
      </div>
    </section>
  );
}

/* ─── MANIFESTO ─── */
function ManifestoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const cards = [
    { num: "01", title: "Plunder Without Mercy", desc: "We don't guess root causes. We prove them with cross-source SQL raids across every signal in your stack." },
    { num: "02", title: "Pirate Code", desc: "Rooted in the open seas, informed by global SRE wisdom, serving engineering crews worldwide." },
    { num: "03", title: "Digital Bounty", desc: "Every query considered. Every AI inference intentional. Every pixel on the deck earns its place." },
    { num: "04", title: "Crew First", desc: "Technology serves your crew, not the other way around. AEGIS reduces cognitive load, not autonomy." },
  ];

  useEffect(() => {
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.fromTo(card,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          delay: i * 0.12,
          scrollTrigger: { trigger: card, start: "top 82%", toggleActions: "play none none reverse" }
        }
      );
    });
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32" style={{ background: "#0a0a0a" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Left sticky */}
          <div className="lg:sticky lg:top-28">
            <span className="section-label block mb-6">THE PIRATE CODE</span>
            <h2
              style={{
                fontSize: "clamp(40px, 5vw, 60px)",
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                color: "#fff",
                marginBottom: 24,
              }}
            >
              Observe.
              <br />
              <span className="text-gradient">Correlate.</span>
              <br />
              Resolve.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, fontWeight: 300, lineHeight: 1.7, maxWidth: 380 }}>
              We believe in the power of{" "}
              <span style={{ color: "rgba(0,255,148,0.9)" }}>signal plundering</span>. When your infrastructure speaks, AEGIS listens across every channel simultaneously — turning{" "}
              <span style={{ color: "rgba(139,92,246,0.9)" }}>chaos into bounty</span>.
            </p>
          </div>

          {/* Right: floating glass cards */}
          <div className="flex flex-col gap-5">
            {cards.map((card, i) => (
              <div
                key={card.num}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="glass-card"
                style={{ opacity: 0 }}
              >
                <div className="flex items-start gap-5">
                  <span className="section-label" style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0, marginTop: 2 }}>{card.num}</span>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 400, color: "#fff", marginBottom: 10, letterSpacing: "-0.01em" }}>{card.title}</h3>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 300, lineHeight: 1.7 }}>{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── WORK SHOWCASE (Horizontal Pinned Scroll) ─── */
function WorkShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const cards = [
    {
      num: "01",
      title: "Coral SQL Layer",
      category: "Query Engine / Data Federation",
      desc: "PagerDuty, Datadog, GitHub, Sentry and Slack as local SQL tables. Cross-source JOINs with zero egress.",
      color: "#00F0FF",
      stat: { label: "Sources", value: "5+" },
    },
    {
      num: "02",
      title: "LLM Analysis Engine",
      category: "AI / Root Cause Analysis",
      desc: "Groq Llama 3.3 + NVIDIA NIM fallback. Extracts anomalies, traces commits, computes confidence scores.",
      color: "rgb(160,224,171)",
      stat: { label: "Accuracy", value: "~87%" },
    },
    {
      num: "03",
      title: "War Room Operations",
      category: "Incident Response / Automation",
      desc: "Real-time incident correlation, rollback recommendations, and Slack notifications — all automated.",
      color: "rgb(255,172,46)",
      stat: { label: "MTTR Reduction", value: "~60%" },
    },
  ];

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    let ctx: gsap.Context;

    const timeoutId = setTimeout(() => {
      ctx = gsap.context(() => {
        if (!sectionRef.current || !trackRef.current) return;

        const getScrollAmount = () =>
          trackRef.current!.scrollWidth - window.innerWidth;

        gsap.to(trackRef.current, {
          x: () => -getScrollAmount(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${getScrollAmount()}`,
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      }, sectionRef);
    }, 1200);

    return () => {
      clearTimeout(timeoutId);
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden" style={{ background: "#000" }}>
      <div className="pt-24 px-6 lg:px-10 max-w-6xl mx-auto">
        <div className="mb-16">
          <span className="section-label block mb-4">WEAPONS CACHE</span>
          <h2 style={{ fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 400, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            The Arsenal That<br />
            <span className="text-gradient">Arms The Fleet</span>
          </h2>
        </div>
      </div>

      {/* FIX: removed pr-24 and the 80px spacer. pr-10 gives a small 40px breath without dead scroll. */}
      <div ref={trackRef} className="flex gap-6 pl-6 lg:pl-10 pr-10" style={{ width: "max-content" }}>
        {cards.map((card) => (
          <div
            key={card.num}
            className="flex-shrink-0 relative overflow-hidden"
            style={{
              width: "min(70vw, 820px)",
              height: 480,
              borderRadius: 16,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              padding: 48,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "border-color 0.4s ease",
              cursor: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = `${card.color}30`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${card.color}50, transparent)` }} />

            <div>
              <div className="flex items-start justify-between mb-8">
                <span className="section-label" style={{ color: card.color, letterSpacing: "0.15em" }}>{card.num} // {card.category}</span>
                <div className="text-right">
                  <div style={{ fontSize: 28, fontWeight: 300, color: card.color }}>{card.stat.value}</div>
                  <div className="section-label" style={{ color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{card.stat.label}</div>
                </div>
              </div>
              <h3 style={{ fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 400, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 20 }}>
                {card.title}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 16, fontWeight: 300, lineHeight: 1.7, maxWidth: 480 }}>
                {card.desc}
              </p>
            </div>

            {/* Bottom background glow */}
            <div
              className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: card.color,
                filter: "blur(100px)",
                opacity: 0.06,
                transform: "translate(30%, 30%)",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );

}

/* ─── STATS MARQUEE ─── */
function StatsMarquee() {
  const items = [
    { value: "50+", label: "Bounties Claimed" },
    { value: "5", label: "Raided Sources" },
    { value: "<60s", label: "Mean Detection Time" },
    { value: "100%", label: "Local Waters Only" },
    { value: "2", label: "AI Crew Members" },
    { value: "0", label: "Data Leaked to Shore" },
  ];

  const doubled = [...items, ...items];

  return (
    <section
      className="relative overflow-hidden py-10"
      style={{ background: "rgba(0,255,148,0.04)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-12 px-12">
            <div className="flex items-baseline gap-3">
              <span style={{ fontSize: 32, fontWeight: 300, color: "#fff", letterSpacing: "-0.02em" }}>{item.value}</span>
              <span className="section-label" style={{ color: "rgba(255,255,255,0.35)" }}>{item.label}</span>
            </div>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 8 }}>◆</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─── */
function HowItWorks() {
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  const steps = [
    { num: "01", title: "Signal Intercept", desc: "PagerDuty fires a distress signal. AEGIS intercepts the webhook and logs the bounty instantly.", color: "rgb(239,68,68)" },
    { num: "02", title: "Telemetry Raid", desc: "Coral SQL fires parallel raids on GitHub, Sentry, Datadog, and Slack — joining in-memory, never on enemy shores.", color: "#00D9FF" },
    { num: "03", title: "LLM Cartography", desc: "Groq Llama 3.3 (with NVIDIA NIM fallback) charts the correlated dataset and maps the anomaly to its source.", color: "#00FF94" },
    { num: "04", title: "Plunder Report", desc: "A confidence-scored bounty report is published to The Deck. Your crew gets exact rollback targets, not hunches.", color: "#8B5CF6" },
  ];

  useEffect(() => {
    stepsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
        {
          opacity: 1,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          duration: 0.9,
          ease: "power3.out",
          delay: i * 0.1,
          scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" }
        }
      );
    });
  }, []);

  return (
    <section className="relative py-32" style={{ background: "#0a0a0a" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-20">
          <span className="section-label block mb-4">THE RAID PROTOCOL</span>
          <h2 style={{ fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 400, color: "#fff", letterSpacing: "-0.02em" }}>
            Alert to Plunder<br />
            <span className="text-gradient">In Seconds</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {steps.map((step, i) => (
            <div
              key={step.num}
              ref={(el) => { stepsRef.current[i] = el; }}
              className="glass-card group"
              style={{ opacity: 0 }}
            >
              <div className="flex items-start justify-between mb-6">
                <span className="section-label" style={{ color: step.color }}>{step.num}</span>
                <div className="w-2 h-2 rounded-full" style={{ background: step.color, boxShadow: `0 0 12px ${step.color}` }} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 400, color: "#fff", marginBottom: 12, letterSpacing: "-0.01em" }}>{step.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 300, lineHeight: 1.75 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CONTACT ─── */
function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headlineRef.current,
        { opacity: 0, scale: 0.92, y: 30 },
        {
          opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%", toggleActions: "play none none reverse" }
        }
      );
      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2,
          scrollTrigger: { trigger: sectionRef.current, start: "top 60%", toggleActions: "play none none reverse" }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-32">
      <CyberPiratesBackground />
      <div className="absolute inset-0 noise-overlay opacity-[0.04] pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <span className="section-label block mb-8" style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.25em" }}>
          RAISE THE FLAG
        </span>

        <h2
          ref={headlineRef}
          style={{
            fontSize: "clamp(48px, 9vw, 120px)",
            fontWeight: 400,
            letterSpacing: "-0.035em",
            lineHeight: 0.9,
            color: "#fff",
            marginBottom: 32,
            opacity: 0,
          }}
        >
          Set Sail<br />
          <span className="text-gradient">With AEGIS</span>
        </h2>

        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 18, fontWeight: 300, maxWidth: 420, margin: "0 auto 48px", lineHeight: 1.6 }}>
          Have an incident that haunts your fleet? Perfect. That's where we hunt.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4" style={{ opacity: 0 }}>
          {isAuthenticated ? (
            <MagneticButton onClick={() => navigate("/dashboard")}>
              <span className="btn-pill-filled">
                Board The Deck
                <ArrowRight className="w-4 h-4" />
              </span>
            </MagneticButton>
          ) : (
            <MagneticButton onClick={() => navigate("/login")}>
              <span className="btn-pill-filled">
                Board Ship
                <ArrowRight className="w-4 h-4" />
              </span>
            </MagneticButton>
          )}
          <MagneticButton href="/about">
            <span className="btn-pill-ghost">
              View Ship Blueprints
            </span>
          </MagneticButton>
        </div>

        <p className="mt-12 section-label" style={{ color: "rgba(255,255,255,0.2)" }}>
          Forged for Coral Hackathon · The Digital Seas, 2025
        </p>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function FooterSection() {
  return (
    <footer className="relative py-16 px-6 lg:px-10" style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Shield className="w-5 h-5" style={{ color: "rgba(255,255,255,0.6)" }} />
              <span className="font-mono text-white tracking-[0.2em] text-xs">AEGIS</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, fontWeight: 300 }}>
              Autonomous Fleet Investigator
            </p>
          </div>

          <div className="flex items-center gap-8">
            {["GitHub", "Lore", "The Deck"].map((link) => (
              <Link
                key={link}
                to={link === "GitHub" ? "/" : link === "Lore" ? "/about" : "/dashboard"}
                className="section-label transition-colors duration-300"
                style={{ color: "rgba(255,255,255,0.25)", cursor: "none" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.25)"; }}
              >
                {link}
              </Link>
            ))}
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full section-label transition-all duration-300"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "none" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "rgba(255,255,255,0.3)";
              el.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "rgba(255,255,255,0.1)";
              el.style.color = "rgba(255,255,255,0.4)";
            }}
          >
            ↑ TOP
          </button>
        </div>

        <div className="mt-10 pt-6 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontWeight: 300 }}>
            © 2025 AEGIS. All plunder reserved.
          </span>
          <span className="section-label" style={{ color: "rgba(255,255,255,0.15)" }}>
            AEGIS v2.4.1 · ☠
          </span>
        </div>
      </div>
    </footer>
  );
}
