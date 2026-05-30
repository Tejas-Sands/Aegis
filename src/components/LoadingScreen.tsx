import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { TextScramble } from "./TextScramble";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const innerGlowRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const minDuration = 2500;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Phase 1: Wireframe cube appears and rotates
      tl.fromTo(cubeRef.current, { opacity: 0, scale: 0.6 }, {
        opacity: 1, scale: 1, duration: 0.8, ease: "power3.out"
      });

      // Phase 2: Inner glow cube fades in
      tl.fromTo(innerGlowRef.current, { opacity: 0, scale: 0.3 }, {
        opacity: 1, scale: 1, duration: 0.6, ease: "expo.out"
      }, "-=0.2");

      // Phase 3: Progress bar fills
      tl.fromTo(progressTrackRef.current, { opacity: 0, y: 10 }, {
        opacity: 1, y: 0, duration: 0.4
      }, "-=0.2");

      tl.to(progressBarRef.current, {
        width: "100%",
        duration: 1.2,
        ease: "power2.inOut",
        onUpdate: function () {
          setProgress(Math.round(this.progress() * 100));
        }
      });

      // Phase 4: Cube explodes to particles
      tl.to(cubeRef.current, {
        scale: 1.6,
        opacity: 0,
        duration: 0.5,
        ease: "expo.in"
      });

      tl.to(innerGlowRef.current, {
        scale: 2,
        opacity: 0,
        duration: 0.5,
        ease: "expo.in"
      }, "<");

      // Scatter particles
      tl.fromTo(".particle", 
        { opacity: 1, x: 0, y: 0, scale: 1 },
        {
          opacity: 0,
          x: () => (Math.random() - 0.5) * 400,
          y: () => (Math.random() - 0.5) * 400,
          scale: 0,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.02
        }, "-=0.3"
      );

      // Phase 5: Fade out loading screen
      tl.to(containerRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, minDuration - elapsed);
          setTimeout(() => {
            onComplete();
          }, remaining);
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  const particlePositions = Array.from({ length: 16 }, () => ({
    x: (Math.random() - 0.5) * 80,
    y: (Math.random() - 0.5) * 80,
    size: Math.random() * 4 + 2,
  }));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "#000000" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,255,148,0.08) 0%, transparent 70%)"
        }}
      />

      {/* Cube wrapper */}
      <div className="relative mb-12" style={{ width: 120, height: 120 }}>
        {/* Particles */}
        <div ref={particlesRef} className="absolute inset-0 flex items-center justify-center">
          {particlePositions.map((p, i) => (
            <div
              key={i}
              className="particle absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: i % 2 === 0 ? "rgba(0,255,148,0.6)" : "rgba(139,92,246,0.6)",
                left: "50%",
                top: "50%",
                transform: `translate(${p.x}px, ${p.y}px)`,
                boxShadow: i % 2 === 0 ? "0 0 6px rgba(0,255,148,0.8)" : "0 0 6px rgba(139,92,246,0.8)",
              }}
            />
          ))}
        </div>

        {/* Wireframe CSS 3D cube */}
        <div
          ref={cubeRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: 0 }}
        >
          <div className="cube-container" style={{ width: 80, height: 80, perspective: 400 }}>
            <div className="cube" style={{
              width: "100%",
              height: "100%",
              position: "relative",
              transformStyle: "preserve-3d",
              animation: "cube-rotate 3s linear infinite",
            }}>
              {["front", "back", "left", "right", "top", "bottom"].map((face) => (
                <div
                  key={face}
                  className={`cube-face cube-face-${face}`}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    border: "1px solid rgba(0,255,148,0.4)",
                    background: "rgba(0,255,148,0.03)",
                    boxShadow: "inset 0 0 20px rgba(0,255,148,0.05)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Inner glowing cube */}
        <div
          ref={innerGlowRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: 0 }}
        >
          <div style={{
            width: 32,
            height: 32,
            background: "rgba(0,255,148,0.3)",
            border: "1px solid rgba(0,255,148,0.8)",
            boxShadow: "0 0 30px rgba(0,255,148,0.6), 0 0 60px rgba(0,255,148,0.3), 0 0 30px rgba(139,92,246,0.2), inset 0 0 20px rgba(0,255,148,0.2)",
            animation: "pulse-glow 1.5s ease-in-out infinite",
          }} />
        </div>
      </div>

      {/* Progress bar */}
      <div
        ref={progressTrackRef}
        className="relative"
        style={{ width: 240, opacity: 0 }}
      >
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <div
            ref={progressBarRef}
            style={{
              height: "100%",
              width: "0%",
              background: "linear-gradient(90deg, #00FF94, #00D9FF 50%, #8B5CF6)",
              borderRadius: 1,
              boxShadow: "0 0 10px rgba(0,255,148,0.4)",
            }}
          />
        </div>
        <div
          className="flex justify-between mt-3"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(0,255,148,0.4)", letterSpacing: "0.1em" }}
        >
          <span><TextScramble text="INITIALIZING_PLUNDER_SEQUENCE" speed={40} delay={200} /></span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
