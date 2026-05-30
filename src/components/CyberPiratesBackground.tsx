import { useEffect, useRef } from "react";

export function CyberPiratesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 1.5);

    // Set initial size
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const colors = ["#00FF94", "#8B5CF6", "#A855F7", "#00D9FF"];

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulse: Math.random() * Math.PI * 2,
    }));

    let lastTime = performance.now();
    let lightningTimer = 0;
    let flareTimer = 0;
    let shouldDrawFlare = false;
    let rafId: number;

    const animate = (currentTime: number) => {
      // Calculate delta time (time elapsed since last frame in ms)
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Safe guard against massive jumps (e.g., user switches tabs)
      if (deltaTime > 100) {
        rafId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      // Handle time-based triggers instead of frame-based
      lightningTimer += deltaTime;
      flareTimer += deltaTime;

      if (flareTimer >= 50) { // roughly 3 frame equivalents at 60Hz
        shouldDrawFlare = !shouldDrawFlare;
        flareTimer = 0;
      }

      particles.forEach((p) => {
        // Scale movement by deltaTime so speed is uniform across 60Hz - 240Hz+
        const speedModifier = deltaTime * 0.06;
        p.x += p.vx * speedModifier;
        p.y += p.vy * speedModifier;
        p.pulse += 0.02 * speedModifier;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const flicker = 0.7 + Math.sin(p.pulse) * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * flicker;
        ctx.fill();

        // Holographic cross flare
        if (p.size > 1.2 && shouldDrawFlare) {
          ctx.globalAlpha = p.alpha * flicker * 0.3;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x - p.size * 3, p.y);
          ctx.lineTo(p.x + p.size * 3, p.y);
          ctx.moveTo(p.x, p.y - p.size * 3);
          ctx.lineTo(p.x, p.y + p.size * 3);
          ctx.stroke();
        }
      });

      // Rare "lightning" energy arcs every ~2500ms
      if (lightningTimer >= 2500) {
        lightningTimer = 0;
        const lx = Math.random() * w;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx + (Math.random() - 0.5) * 100, h * 0.3);
        ctx.lineTo(lx + (Math.random() - 0.5) * 200, h * 0.6);
        ctx.lineTo(lx + (Math.random() - 0.5) * 100, h);
        ctx.strokeStyle = "#00FF94";
        ctx.globalAlpha = 0.08;
        ctx.lineWidth = 1;
        ctx.shadowColor = "#00FF94";
        ctx.shadowBlur = 10;
        ctx.stroke();
        // Reset shadow blur right away so it doesn't bleed into particles
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(animate);
    };

    // Pass timestamp to the initial loop execution
    rafId = requestAnimationFrame((time) => {
      lastTime = time;
      animate(time);
    });

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;

      // Reset transform matrix entirely before rescaling to prevent compounding states
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
      {/* Layer 1: Deep void base */}
      <div className="absolute inset-0 bg-void" />

      {/* Layer 2: Aurora blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full bg-neon-green/20 blur-[130px] animate-aurora-green" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-neon-purple/20 blur-[120px] animate-aurora-purple" />
      <div className="absolute top-[50%] left-[60%] w-[400px] h-[400px] rounded-full bg-neon-magenta/15 blur-[100px] animate-aurora-green animate-delay-1000" />

      {/* Layer 3: Cyber Sea Grid */}
      <div className="absolute bottom-0 left-0 right-0 h-[70%] perspective-grid overflow-hidden">
        <div className="grid-floor" />
      </div>

      {/* Layer 4: Holographic dust particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-70"
      />

      {/* Layer 5: CRT Scanlines */}
      <div className="absolute inset-0 bg-scanlines" />

      {/* Layer 6: Vignette */}
      <div className="absolute inset-0 bg-vignette" />

      {/* Layer 7: Horizon glow line */}
      <div
        className="absolute bottom-[30%] left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(0,255,148,0.3) 20%, rgba(139,92,246,0.3) 50%, rgba(0,255,148,0.3) 80%, transparent 100%)",
          boxShadow: "0 0 20px rgba(0,255,148,0.2), 0 0 40px rgba(139,92,246,0.1)",
        }}
      />
    </div>
  );
}