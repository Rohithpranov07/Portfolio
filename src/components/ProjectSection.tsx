import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { GitBranch, Star, GitFork, ExternalLink, GitCommit } from "lucide-react";
import IPhoneMockup from "./IPhoneMockup";
import MacBookMockup from "./MacBookMockup";
import { ScrollReveal } from "./ScrollAnimations";

interface Project {
  title: string;
  description: string;
  tech: string[];
  type: "mobile" | "web";
  screenImage: string;
  stars: number;
  forks: number;
}

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8], [0, 1, 1]);
  const textX = useTransform(
    scrollYProgress,
    [0, 0.5],
    [index % 2 === 0 ? -80 : 80, 0]
  );
  const textRotateY = useTransform(
    scrollYProgress,
    [0, 0.5],
    [index % 2 === 0 ? -8 : 8, 0]
  );

  const isReversed = index % 2 !== 0;

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="py-16 md:py-28"
    >
      <div className={`flex flex-col ${isReversed ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12 md:gap-20`}>
        {/* Device mockup */}
        <div className="flex-1 flex justify-center">
          {project.type === "mobile" ? (
            <IPhoneMockup screenImage={project.screenImage} alt={project.title} />
          ) : (
            <MacBookMockup screenImage={project.screenImage} alt={project.title} />
          )}
        </div>

        {/* Info */}
        <motion.div
          style={{ x: textX, rotateY: textRotateY, perspective: "800px" }}
          className="flex-1 max-w-lg"
        >
          {/* Repo badge */}
          <ScrollReveal delay={0.1}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary/60 border-glow font-mono text-xs text-muted-foreground mb-4">
              <GitBranch className="w-3.5 h-3.5 text-primary" />
              <span>{project.type === "mobile" ? "mobile-app" : "web-app"}</span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {project.title}
            </h3>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              {project.description}
            </p>
          </ScrollReveal>

          {/* Tech stack */}
          <ScrollReveal delay={0.25}>
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tech.map((t, ti) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + ti * 0.05 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="px-3 py-1 rounded-full bg-secondary text-sm font-mono text-foreground border-glow cursor-default"
                >
                  {t}
                </motion.span>
              ))}
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal delay={0.3}>
            <div className="flex items-center gap-6 text-muted-foreground text-sm mb-6">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-primary" />
                {project.stars}
              </span>
              <span className="flex items-center gap-1.5">
                <GitFork className="w-4 h-4" />
                {project.forks}
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.35}>
            <motion.a
              href="#"
              whileHover={{ x: 4 }}
              className="inline-flex items-center gap-2 text-primary font-medium hover:brightness-125 transition-all"
            >
              View Repository
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          </ScrollReveal>
        </motion.div>
      </div>
    </motion.div>
  );
};

interface ProjectSectionProps {
  projects: Project[];
}

const ProjectSection = ({ projects }: ProjectSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="projects" ref={containerRef} className="relative max-w-7xl mx-auto px-6">
      {/* Section header */}
      <ScrollReveal>
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Featured <span className="text-gradient-green">Projects</span>
          </h2>
          <p className="text-muted-foreground text-lg font-mono">
            <span className="text-primary">git log</span> --oneline --graph
          </p>
        </div>
      </ScrollReveal>

      {/* Animated vertical timeline */}
      <div className="hidden md:flex absolute left-1/2 top-40 bottom-20 flex-col items-center z-0">
        <motion.div
          className="w-px bg-gradient-to-b from-primary/60 via-primary/30 to-transparent origin-top"
          style={{ scaleY: lineScaleY, height: "100%" }}
        />
        {projects.map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: `${15 + i * 25}%` }}
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          >
            <div className="w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center glow-green">
              <GitCommit className="w-4 h-4 text-primary" />
            </div>
          </motion.div>
        ))}
      </div>

      {projects.map((project, i) => (
        <ProjectCard key={project.title} project={project} index={i} />
      ))}
    </section>
  );
};

export default ProjectSection;
export type { Project };
