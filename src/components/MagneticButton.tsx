import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  maxDisplacement?: number;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export default function MagneticButton({
  children,
  className = "",
  maxDisplacement = 20,
  onClick,
  href,
  type = "button",
  disabled = false,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.8 });
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.8 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const maxDist = Math.max(rect.width, rect.height);
    const factor = Math.min(distance / maxDist, 1);
    x.set((deltaX / maxDist) * maxDisplacement * factor * 2);
    y.set((deltaY / maxDist) * maxDisplacement * factor * 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const content = (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`inline-block ${className}`}
    >
      {href ? (
        <a href={href} className="block">
          {children}
        </a>
      ) : (
        <button type={type} onClick={onClick} disabled={disabled} className="block w-full">
          {children}
        </button>
      )}
    </motion.div>
  );

  return content;
}
