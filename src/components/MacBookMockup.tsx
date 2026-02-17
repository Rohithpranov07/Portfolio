import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface MacBookMockupProps {
  screenImage: string;
  alt?: string;
}

const MacBookMockup = ({ screenImage, alt = "Website screen" }: MacBookMockupProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [20, 8, 0, -4, -12]);
  const rotateY = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [10, 4, 0, -3, -8]);
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.5, 0.6, 1], [0.75, 0.92, 1, 0.97, 0.85]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -80]);

  return (
    <div ref={ref} className="flex items-center justify-center" style={{ perspective: "1400px" }}>
      <motion.div
        style={{ rotateX, rotateY, scale, y, transformStyle: "preserve-3d" }}
        className="relative"
      >
        {/* MacBook Screen */}
        <div className="relative w-[600px] max-w-[85vw]">
          {/* Lid */}
          <div className="rounded-t-xl bg-gradient-to-b from-[hsl(215,19%,20%)] to-[hsl(215,19%,14%)] p-[8px] pb-[6px] device-shadow">
            {/* Camera */}
            <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-[hsl(215,19%,30%)] z-10" />
            {/* Screen bezel */}
            <div className="bg-[hsl(215,28%,5%)] rounded-lg overflow-hidden">
              <img
                src={screenImage}
                alt={alt}
                className="w-full aspect-[16/10] object-cover"
              />
            </div>
          </div>
          {/* Bottom hinge */}
          <div className="relative">
            <div className="h-[12px] bg-gradient-to-b from-[hsl(215,19%,18%)] to-[hsl(215,19%,15%)] rounded-b-md mx-[-4px]" />
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80px] h-[4px] bg-[hsl(215,19%,22%)] rounded-b-lg" />
          </div>
          {/* Base */}
          <div className="h-[4px] bg-gradient-to-b from-[hsl(215,19%,13%)] to-[hsl(215,19%,10%)] rounded-b-xl mx-[20px]" />
        </div>
        {/* Reflection */}
        <div className="absolute inset-0 rounded-t-xl bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
};

export default MacBookMockup;
