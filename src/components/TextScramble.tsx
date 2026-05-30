import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TextScrambleProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}|:<>?~";

export const TextScramble: React.FC<TextScrambleProps> = ({ text, speed = 50, delay = 0, className = "" }) => {
  const [displayText, setDisplayText] = useState("");
  const [isScrambling, setIsScrambling] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    const startScramble = () => {
      setIsScrambling(true);
      let iteration = 0;
      
      interval = setInterval(() => {
        setDisplayText(() =>
          text
            .split("")
            .map((_, index) => {
              if (index < iteration) {
                return text[index];
              }
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join("")
        );

        if (iteration >= text.length) {
          clearInterval(interval);
          setIsScrambling(false);
          setDisplayText(text);
        }

        iteration += 1 / 3; // Controls how fast the real text resolves
      }, speed);
    };

    timeout = setTimeout(startScramble, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, speed, delay]);

  return (
    <motion.span
      className={`inline-block ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: delay / 1000 }}
    >
      {isScrambling ? (
        <span className="font-mono">{displayText}</span>
      ) : (
        text
      )}
    </motion.span>
  );
};
