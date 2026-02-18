import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, GitBranch, GitFork, Star } from "lucide-react";
import IPhoneMockup from "@/components/IPhoneMockup";
import MacBookMockup from "@/components/MacBookMockup";

export type DeckProject = {
  title: string;
  description: string;
  tech: string[];
  type: "mobile" | "web";
  screenImage: string;
  stars: number;
  forks: number;
  repoUrl?: string;
  actionLabel?: string;
};

export default function ProjectDeck({ projects }: { projects: DeckProject[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.clientWidth;
      const index = Math.round(scrollLeft / width);
      setActiveIndex(index);
    }
  };

  const scrollToProject = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full">
      {/* Top Swipe Indicator */}
      <div className="flex justify-end pr-2 mb-2 md:hidden">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 font-mono animate-pulse bg-secondary/50 px-3 py-1 rounded-full border border-white/5">
          <span>Swipe for more</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>

      {/* Scroll indicator overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: activeIndex === projects.length - 1 ? 0 : 1, x: [0, 10, 0] }}
        transition={{ opacity: { duration: 0.3 }, x: { repeat: Infinity, duration: 1.5 } }}
        className="absolute top-1/2 -right-2 md:-right-8 z-20 -translate-y-1/2 hidden md:flex flex-col items-center gap-1 pointer-events-none"
      >
        <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-primary to-transparent" />
        <span className="text-[10px] font-mono tracking-widest text-primary rotate-90 text-shadow-green">MORE</span>
        <ArrowRight className="w-4 h-4 text-primary mt-2 rotate-90" />
      </motion.div>

      {/* Main Snap Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 gap-6 px-1"
        style={{ scrollBehavior: "smooth" }}
      >
        {projects.map((p, i) => (
          <div
            key={p.title}
            className="w-full min-w-full snap-center flex-shrink-0"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 items-center bg-black/40 backdrop-blur-xl border-glow rounded-3xl p-6 md:p-10 shadow-2xl">
              <div className="order-2 lg:order-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary/80 border-glow font-mono text-xs text-muted-foreground">
                  <GitBranch className="w-3.5 h-3.5 text-primary" />
                  <span>{p.type === "mobile" ? "mobile-app" : "web-app"}</span>
                  <span className="w-1 h-3 border-r border-muted-foreground/30 mx-1" />
                  <span className="text-primary font-bold">0{i + 1}</span>
                </div>

                <h3 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
                  {p.title}
                </h3>

                <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
                  {p.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {p.tech.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 rounded-full bg-secondary/50 border border-white/5 text-sm font-mono text-foreground/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-primary" />
                      {p.stars}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <GitFork className="w-4 h-4" />
                      {p.forks}
                    </span>
                  </div>

                  <motion.a
                    href={p.repoUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: 4 }}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:brightness-125 transition-all ml-auto"
                  >
                    {p.actionLabel || "View Repository"}
                    <ExternalLink className="w-4 h-4" />
                  </motion.a>
                </div>
              </div>

              <div className="order-1 lg:order-2 flex justify-center items-center">
                <div className="relative group perspective-1000 w-full max-w-md lg:max-w-full">
                  {p.type === "mobile" ? (
                    <div className="scale-90 lg:scale-100 transition-transform duration-500">
                       <IPhoneMockup screenImage={p.screenImage} alt={p.title} />
                    </div>
                  ) : (
                    <div className="scale-90 lg:scale-100 transition-transform duration-500">
                       <MacBookMockup screenImage={p.screenImage} alt={p.title} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Dots */}
      <div className="flex flex-col items-center gap-2 mt-1">
        <div className="flex justify-center gap-3">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToProject(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === i 
                  ? "w-8 bg-primary shadow-[0_0_10px_rgba(34,197,94,0.6)]" 
                  : "w-2 bg-secondary hover:bg-white/20"
              }`}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground/60 font-mono animate-pulse">
           <span>Swipe to explore</span>
           <ArrowRight className="w-3 h-3" />
        </div>
      </div>

      <div className="text-center mt-3">
        <span className="text-[10px] font-mono text-muted-foreground/50 tracking-widest uppercase">
          {activeIndex + 1} / {projects.length}
        </span>
      </div>
    </div>
  );
}

