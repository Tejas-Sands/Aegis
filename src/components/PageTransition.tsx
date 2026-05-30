import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function PageTransition({ children }: { children: ReactNode }) {
  const [isAnimating, setIsAnimating] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      onAnimationStart={() => setIsAnimating(true)}
      onAnimationComplete={() => {
        setIsAnimating(false);
        setTimeout(() => ScrollTrigger.refresh(), 50);
      }}
      style={!isAnimating ? { transform: "none", filter: "none", willChange: "auto" } : undefined}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
