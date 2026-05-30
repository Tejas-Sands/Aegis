import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Shield, ArrowRight, LogIn, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import { CyberPiratesBackground } from "@/components/CyberPiratesBackground";
import MagneticButton from "@/components/MagneticButton";
import { useAuth } from "@/hooks/useAuth";
import { TextScramble } from "@/components/TextScramble";
import { SceneWrapper } from "@/components/3d/SceneWrapper";
import { RoboticSkull } from "@/components/3d/RoboticSkull";
import { CyberShip } from "@/components/3d/CyberShip";
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

      // 3D Skull Parallax
      gsap.to(".skull-3d", {
        y: 200,
        rotationZ: 15,
        scale: 1.2,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
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

      {/* 3D Robotic Skull Background */}
      <div className="skull-3d absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-40 md:opacity-60">
        <SceneWrapper cameraPosition={[0, 0, 8]}>
          <RoboticSkull scale={1.8} position={[0, -0.5, -3]} />
        </SceneWrapper>
      </div>

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
  const [activeTab, setActiveTab] = useState(0);
  const [typedCommand, setTypedCommand] = useState("");
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const animationRef = useRef<number | null>(null);

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

  const consoleData = [
    {
      cmd: 'aegis --query "SELECT * FROM pagerduty JOIN sentry JOIN datadog LIMIT 2"',
      logs: [
        '[RAID] Establishing secure connections to local federated nodes...',
        '[RAID] Querying PagerDuty incidents table (cached: 14s ago)... OK (5 rows)',
        '[RAID] Querying Sentry issues database... OK (3 rows)',
        '[RAID] Performing in-memory cross-source JOIN on \'service_name\'...',
        '[DATA] Egress payload: 0 bytes. Processing duration: 32.4ms',
        '+------------+---------------------+----------+-----------+',
        '| SERVICE    | ERROR               | COMMIT   | SEVERITY  |',
        '+------------+---------------------+----------+-----------+',
        '| auth-api   | NullPointerException| 9a8d7c6b | CRITICAL  |',
        '| web-portal | ChunkLoadError      | f2c8e1a5 | WARNING   |',
        '+------------+---------------------+----------+-----------+',
        '[SUCCESS] Federation complete. The Deck holds the logs.'
      ]
    },
    {
      cmd: 'aegis --analyze --culprit 9a8d7c6b --engine groq-llama-3.3',
      logs: [
        '[AI] Downloading raw diffs for commit 9a8d7c6b...',
        '[AI] Found modified file: services/AuthService.java (+24, -2 lines)',
        '[AI] Triggering Groq Llama 3.3-Preview (NVIDIA NIM Fallback Active)...',
        '[AI] Scanning stack traces for NullPointerException...',
        '[AI] Match found at AuthService.java:142 -> config.getTokenCache()',
        '[AI] Reasoning: Cache config object is returned null on expiration.',
        '[CONFIDENCE] 87.2% root cause match score.',
        '[REVERT_TARGET] Commit 9a8d7c6b. Impact: zero-downtime rollback recommended.'
      ]
    },
    {
      cmd: 'aegis --action auto-rollback --target auth-api --confirm',
      logs: [
        '[OPS] Intercepting webhook target rollback deployment...',
        '[OPS] Communicating with Kubernetes engine (Local Deck Node)...',
        '[OPS] Rolling back Deployment auth-api: v1.4.2 -> v1.4.1 (hash: b8d7c6)',
        '[OPS] Kubernetes rollout status: SUCCESS',
        '[OPS] Running HTTP health probes on auth-api endpoints... OK',
        '[SLACK] Broadcasted incident resolution alert to #war-room-deck',
        '[RECOVERY] Incident closed. Resolution MTTR: 58.2 seconds.'
      ]
    }
  ];

  const startAnimation = (tabIdx: number) => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setTypedCommand("");
    setDisplayedLogs([]);
    setIsTyping(true);

    const fullCommand = consoleData[tabIdx].cmd;
    let charIndex = 0;
    let currentCmd = "";

    const typeCommand = () => {
      if (charIndex < fullCommand.length) {
        currentCmd += fullCommand[charIndex];
        setTypedCommand(currentCmd);
        charIndex++;
        animationRef.current = window.setTimeout(typeCommand, 25);
      } else {
        setIsTyping(false);
        let logIndex = 0;
        const logs = consoleData[tabIdx].logs;

        const printLogs = () => {
          if (logIndex < logs.length) {
            const currentLine = logs[logIndex];
            setDisplayedLogs((prev) => [...prev, currentLine]);
            logIndex++;
            animationRef.current = window.setTimeout(printLogs, 120);
          }
        };
        animationRef.current = window.setTimeout(printLogs, 200);
      }
    };

    animationRef.current = window.setTimeout(typeCommand, 100);
  };

  useEffect(() => {
    startAnimation(activeTab);
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [activeTab]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const activeColor = cards[activeTab].color;

  return (
    <section ref={sectionRef} className="relative py-32" style={{ background: "#000" }}>
      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scanner-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(480px); }
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="mb-20">
          <span className="section-label block mb-4">WEAPONS CACHE</span>
          <h2 style={{ fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 400, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            The Arsenal That<br />
            <span className="text-gradient">Arms The Fleet</span>
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Interactive Cards Tabs */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {cards.map((card, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={card.num}
                  onClick={() => setActiveTab(idx)}
                  className="w-full text-left relative overflow-hidden transition-all duration-500"
                  style={{
                    borderRadius: 16,
                    background: isActive ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
                    border: isActive ? `1px solid ${card.color}50` : "1px solid rgba(255,255,255,0.06)",
                    padding: "32px",
                    boxShadow: isActive ? `0 0 30px -10px ${card.color}25` : "none",
                    cursor: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  }}
                >
                  {/* Top accent line */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }} />
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <span className="section-label" style={{ color: card.color, letterSpacing: "0.15em", fontSize: 9 }}>
                      {card.num} // {card.category}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: 20, fontWeight: 400, color: "#fff", letterSpacing: "-0.01em", marginBottom: 10 }}>
                    {card.title}
                  </h3>
                  
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 300, lineHeight: 1.6, marginBottom: 20 }}>
                    {card.desc}
                  </p>
                  
                  <div className="flex items-center gap-6 pt-4 border-t border-white/[0.04]">
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 300, color: card.color }}>{card.stat.value}</div>
                      <div className="section-label" style={{ color: "rgba(255,255,255,0.3)", fontSize: 8, marginTop: 1 }}>{card.stat.label}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Holographic Terminal Screen */}
          <div className="lg:col-span-7 flex flex-col">
            <div 
              className="relative flex-grow flex flex-col overflow-hidden"
              style={{
                borderRadius: 16,
                background: "rgba(5, 5, 5, 0.7)",
                border: `1px solid ${activeColor}20`,
                boxShadow: `0 0 40px -15px ${activeColor}15, inset 0 0 20px rgba(0,0,0,0.8)`,
                backdropFilter: "blur(20px)",
                minHeight: 450,
              }}
            >
              {/* Terminal Title Bar */}
              <div 
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{
                  borderColor: "rgba(255,255,255,0.05)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444", opacity: 0.7 }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#F59E0B", opacity: 0.7 }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#10B981", opacity: 0.7 }} />
                  <span className="font-mono text-[10px] ml-2 text-white/30 tracking-[0.1em]">AEGIS_SECURE_SHELL v2.4.1</span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startAnimation(activeTab);
                  }}
                  className="px-3 py-1 rounded border text-[9px] font-mono tracking-wider transition-all duration-300"
                  style={{
                    borderColor: `${activeColor}30`,
                    color: activeColor,
                    background: "transparent",
                    cursor: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${activeColor}15`;
                    e.currentTarget.style.borderColor = activeColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = `${activeColor}30`;
                  }}
                >
                  RE-RUN RAID
                </button>
              </div>

              {/* Terminal Screen Body */}
              <div className="relative p-8 flex-grow overflow-hidden bg-scanlines select-none">
                
                {/* Vignette Shadow Overlay */}
                <div className="absolute inset-0 bg-vignette pointer-events-none" />

                {/* CRT Scanline Horizontal Sweep Line */}
                <div 
                  className="absolute left-0 right-0 h-px pointer-events-none" 
                  style={{
                    background: `linear-gradient(90deg, transparent, ${activeColor}20, transparent)`,
                    boxShadow: `0 0 10px ${activeColor}15`,
                    top: 0,
                    animation: "scanner-line 5s linear infinite"
                  }}
                />

                {/* Radar Scope Ambient Graphic */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/[0.02] pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border border-white/[0.015] flex items-center justify-center animate-pulse">
                    <div className="w-32 h-32 rounded-full border border-white/[0.01]" />
                  </div>
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-white/[0.015]" />
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-white/[0.015]" />
                  <div 
                    className="absolute inset-0 rounded-full" 
                    style={{
                      background: `conic-gradient(from 0deg, ${activeColor}00 60%, ${activeColor}08)`,
                      animation: "radar-sweep 5s linear infinite"
                    }}
                  />
                </div>

                {/* Simulated Content */}
                <div className="relative z-10 font-mono text-xs md:text-sm">
                  
                  {/* Console Command Input */}
                  <div style={{ color: "rgba(255,255,255,0.4)" }} className="mb-4 flex items-center gap-2">
                    <span style={{ color: "#00FF94" }}>aegis-deck@ship</span>
                    <span style={{ color: "rgba(255,255,255,0.2)" }}>:</span>
                    <span style={{ color: "#8B5CF6" }}>~/weapons</span>
                    <span style={{ color: "rgba(255,255,255,0.2)" }}>$</span>
                    <span style={{ color: "#fff" }}>{typedCommand}</span>
                    {isTyping && <span className="terminal-cursor" style={{ background: activeColor, width: 6, height: 14, display: "inline-block", animation: "blink 1s step-end infinite" }} />}
                  </div>

                  {/* Logs output list */}
                  <div className="flex flex-col gap-2">
                    {displayedLogs.map((log, index) => {
                      let color = "rgba(255,255,255,0.65)";
                      if (log.startsWith("[SUCCESS]") || log.startsWith("[RECOVERY]") || log.includes("OK")) {
                        color = "#00FF94";
                      } else if (log.startsWith("[RAID]") || log.startsWith("[AI]") || log.startsWith("[OPS]")) {
                        color = activeColor;
                      } else if (log.includes("CRITICAL") || log.includes("culprit") || log.includes("Revert") || log.includes("rollback")) {
                        color = "#EF4444";
                      } else if (log.startsWith("+") || log.startsWith("|")) {
                        color = "rgba(255,255,255,0.25)";
                      }

                      return (
                        <div key={index} style={{ color, whiteSpace: "pre-wrap" }} className="leading-relaxed font-mono">
                          {log}
                        </div>
                      );
                    })}

                    {/* Blinking block cursor at end of output logs */}
                    {!isTyping && displayedLogs.length < consoleData[activeTab].logs.length && (
                      <span className="terminal-cursor mt-1" style={{ background: activeColor, width: 6, height: 14, display: "inline-block", animation: "blink 1s step-end infinite" }} />
                    )}
                  </div>

                </div>

              </div>
            </div>
          </div>

        </div>
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

    // 3D Ship Fly-by
    gsap.fromTo(".ship-container",
      { x: "30vw", y: 100, rotationZ: -10, opacity: 0 },
      {
        x: "-10vw",
        y: -100,
        rotationZ: 10,
        opacity: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".raid-protocol-section",
          start: "top 10%",
          end: "bottom 10%",
          scrub: 1,
        }
      }
    );
  }, []);

  return (
    <section className="raid-protocol-section relative py-32 overflow-hidden" style={{ background: "#0a0a0a" }}>
      
      {/* 3D Cyber Ship */}
      <div className="ship-container absolute left-0 top-0 w-full h-screen pointer-events-none z-0">
        <SceneWrapper cameraPosition={[0, 2, 8]}>
          <CyberShip scale={1.5} rotation={[0.4, -0.6, 0.2]} glowColor="#00FF94" />
        </SceneWrapper>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
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
