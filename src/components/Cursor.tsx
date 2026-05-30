import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const trailRefs = useRef<{ x: number; y: number }[]>(
    Array(4).fill({ x: 0, y: 0 })
  );

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[data-cursor-hover]")
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => setIsHovering(false);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleLeave = () => setIsVisible(false);
    const handleEnter = () => setIsVisible(true);

    document.documentElement.style.cursor = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
      document.documentElement.style.cursor = "";
    };
  }, [isVisible]);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  // Calculate trail positions lazily on render (static lerp approximation)
  const trailPositions = trailRefs.current.map((trail, i) => {
    const factor = 0.15 + i * 0.05;
    const prev = i === 0 ? position : trailRefs.current[i - 1];
    const next = {
      x: trail.x + (prev.x - trail.x) * factor,
      y: trail.y + (prev.y - trail.y) * factor,
    };
    trailRefs.current[i] = next;
    return next;
  });

  return (
    <>
      {/* Trail dots — alternating purple/magenta phosphor */}
      {trailPositions.map((trail, i) => (
        <div
          key={i}
          className="fixed top-0 left-0 pointer-events-none rounded-full mix-blend-screen"
          style={{
            zIndex: 9998,
            transform: `translate(${trail.x - 3}px, ${trail.y - 3}px)`,
            width: 6,
            height: 6,
            backgroundColor: i % 2 === 0 ? "#8B5CF6" : "#A855F7",
            opacity: isVisible ? (0.4 - i * 0.08) : 0,
            boxShadow: `0 0 ${8 - i * 2}px ${i % 2 === 0 ? "rgba(139,92,246,0.6)" : "rgba(168,85,247,0.6)"}`,
            transition: "transform 0.05s linear, opacity 0.3s ease",
          }}
        />
      ))}

      {/* Main cursor dot — neon green with glow */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none mix-blend-screen"
        animate={{
          x: position.x - (isHovering ? 20 : 6),
          y: position.y - (isHovering ? 20 : 6),
          width: isHovering ? 40 : 12,
          height: isHovering ? 40 : 12,
          opacity: isVisible ? (isClicking ? 0.6 : 1) : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
        style={{
          zIndex: 9999,
          backgroundColor: isHovering ? "transparent" : "#00FF94",
          border: isHovering ? "2px solid #00FF94" : "none",
          borderRadius: "50%",
          boxShadow: isHovering
            ? "0 0 20px rgba(0,255,148,0.4), inset 0 0 10px rgba(0,255,148,0.1)"
            : "0 0 10px rgba(0,255,148,0.8), 0 0 20px rgba(0,255,148,0.4)",
        }}
      />
    </>
  );
}
