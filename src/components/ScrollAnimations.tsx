import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { GitCommit } from "lucide-react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
  delay?: number;
}

export const ScrollReveal = ({ children, className = "", direction = "up", delay = 0 }: ScrollRevealProps) => {
  const initial = {
    opacity: 0,
    y: direction === "up" ? 60 : 0,
    x: direction === "left" ? -60 : direction === "right" ? 60 : 0,
    rotateX: direction === "up" ? 15 : 0,
    scale: 0.95,
  };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
      style={{ perspective: "1000px" }}
    >
      {children}
    </motion.div>
  );
};

export const ParallaxSection = ({ children, speed = 0.3, className = "" }: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
};

export const GitTimeline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className="hidden md:flex absolute left-1/2 top-0 bottom-0 flex-col items-center z-10">
      <motion.div
        className="w-px bg-primary origin-top"
        style={{ scaleY, height: "100%" }}
      />
      {[0.15, 0.4, 0.65, 0.9].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: `${pos * 100}%` }}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center glow-green">
            <GitCommit className="w-4 h-4 text-primary" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
