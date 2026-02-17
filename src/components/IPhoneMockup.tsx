import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface IPhoneMockupProps {
  screenImage: string;
  alt?: string;
}

const IPhoneMockup = ({ screenImage, alt = "App screen" }: IPhoneMockupProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [25, 10, 0, -5, -15]);
  const rotateY = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [-15, -5, 0, 5, 10]);
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.5, 0.6, 1], [0.8, 0.95, 1, 0.98, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, -60]);

  return (
    <div ref={ref} className="flex items-center justify-center" style={{ perspective: "1200px" }}>
      <motion.div
        style={{ rotateX, rotateY, scale, y, transformStyle: "preserve-3d" }}
        className="relative"
      >
        {/* iPhone frame */}
        <div className="relative w-[280px] h-[570px] rounded-[3rem] bg-gradient-to-b from-[hsl(215,19%,22%)] to-[hsl(215,19%,12%)] p-[6px] device-shadow">
          {/* Inner bezel */}
          <div className="w-full h-full rounded-[2.7rem] bg-[hsl(215,28%,5%)] p-[3px] overflow-hidden relative">
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-[hsl(215,28%,5%)] rounded-full z-10" />
            {/* Screen */}
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden">
              <img
                src={screenImage}
                alt={alt}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {/* Side button */}
          <div className="absolute right-[-2px] top-[120px] w-[3px] h-[40px] bg-[hsl(215,19%,25%)] rounded-r-sm" />
          <div className="absolute left-[-2px] top-[100px] w-[3px] h-[28px] bg-[hsl(215,19%,25%)] rounded-l-sm" />
          <div className="absolute left-[-2px] top-[140px] w-[3px] h-[50px] bg-[hsl(215,19%,25%)] rounded-l-sm" />
          <div className="absolute left-[-2px] top-[200px] w-[3px] h-[50px] bg-[hsl(215,19%,25%)] rounded-l-sm" />
        </div>
        {/* Reflection */}
        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
};

export default IPhoneMockup;
