import { useEffect, useRef } from "react";

interface GradientBackgroundProps {
  variant?: "orbit" | "static" | "intense";
  className?: string;
}

export default function GradientBackground({ variant = "orbit", className = "" }: GradientBackgroundProps) {
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const blurAmount = variant === "intense" ? "180px" : "130px";
  const opacityBase = variant === "intense" ? 0.55 : variant === "orbit" ? 0.38 : 0.25;
  const animDuration = variant === "intense" ? "14s" : "22s";

  useEffect(() => {
    if (variant === "static") return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const intensity = variant === "intense" ? 40 : 20;

      if (blob1Ref.current) {
        blob1Ref.current.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`;
      }
      if (blob2Ref.current) {
        blob2Ref.current.style.transform = `translate(${x * -intensity * 0.7}px, ${y * -intensity * 0.7}px)`;
      }
      if (blob3Ref.current) {
        blob3Ref.current.style.transform = `translate(${x * intensity * 0.5}px, ${y * -intensity * 0.5}px)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [variant]);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Blob 1 — Green */}
      <div
        ref={blob1Ref}
        className="absolute"
        style={{
          width: "55%",
          height: "55%",
          background: "rgb(160, 224, 171)",
          borderRadius: "50%",
          filter: `blur(${blurAmount})`,
          opacity: opacityBase,
          top: "10%",
          left: "5%",
          animation: variant !== "static" ? `orbit-blob1 ${animDuration} ease-in-out infinite` : undefined,
          transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
          willChange: "transform",
        }}
      />

      {/* Blob 2 — Orange */}
      <div
        ref={blob2Ref}
        className="absolute"
        style={{
          width: "45%",
          height: "45%",
          background: "rgb(255, 172, 46)",
          borderRadius: "50%",
          filter: `blur(${blurAmount})`,
          opacity: opacityBase * 0.9,
          top: "30%",
          right: "5%",
          animation: variant !== "static" ? `orbit-blob2 ${animDuration} ease-in-out infinite` : undefined,
          transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
          willChange: "transform",
        }}
      />

      {/* Blob 3 — Red */}
      <div
        ref={blob3Ref}
        className="absolute"
        style={{
          width: "40%",
          height: "40%",
          background: "rgb(165, 45, 37)",
          borderRadius: "50%",
          filter: `blur(${blurAmount})`,
          opacity: opacityBase * 0.75,
          bottom: "10%",
          left: "30%",
          animation: variant !== "static" ? `orbit-blob3 ${animDuration} ease-in-out infinite` : undefined,
          transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
          willChange: "transform",
        }}
      />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 noise-overlay" style={{ opacity: 0.035 }} />
    </div>
  );
}
