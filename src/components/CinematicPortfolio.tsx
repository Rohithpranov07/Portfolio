import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Terminal, Twitter } from "lucide-react";
import { useMemo, useRef } from "react";
import GitWorldBackground from "@/components/GitWorldBackground";
import ProjectDeck, { type DeckProject } from "@/components/ProjectDeck";
import SmoothScroll from "@/components/SmoothScroll";
import TechStackPanel from "@/components/TechStackPanel";

function Chapter({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative min-h-screen lg:h-[110vh] flex items-center py-16 lg:py-0">
      <div className="w-full lg:sticky lg:top-0 lg:h-screen lg:flex lg:items-center">
        <div className="w-full">{children}</div>
      </div>
    </section>
  );
}

const socialLinks = [
  { icon: Github, label: "GitHub", href: "https://github.com/Rohithpranov07" },
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/rohith-pranov" },
  { icon: Mail, label: "Email", href: "mailto:rohithpranov.v2024@vitstudent.ac.in" },
];

export default function CinematicPortfolio({ projects }: { projects: DeckProject[] }) {
  const storyRef = useRef<HTMLDivElement>(null);

  const gitHash = useMemo(() => {
    const chars = "0123456789abcdef";
    return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }, []);

  return (
    <SmoothScroll>
      <div className="bg-background min-h-screen overflow-x-hidden">
        <GitWorldBackground targetRef={storyRef} />

        {/* Cinematic overlays (vignette + subtle grid) */}
        <div className="fixed inset-0 z-[1] pointer-events-none">
          <div className="absolute inset-0 grid-bg opacity-[0.06]" />
          <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_10%,hsla(137,55%,36%,0.18),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_60%,transparent_0%,hsla(215,28%,5%,0.65)_65%,hsla(215,28%,5%,0.92)_100%)]" />
        </div>

        {/* Floating git nav */}
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-[95vw]">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-secondary/40 backdrop-blur-md border-glow font-mono text-xs text-muted-foreground overflow-x-auto scrollbar-none whitespace-nowrap">
            <span className="inline-flex items-center gap-2 text-foreground">
              <span className="h-2 w-2 rounded-full bg-primary glow-green" />
              <span>~/portfolio</span>
              <span className="text-primary">main</span>
            </span>
            <span className="text-muted-foreground/60">·</span>
            <a href="#top" className="hover:text-foreground transition-colors">intro</a>
            <a href="#about" className="hover:text-foreground transition-colors">about</a>
            <a href="#stack" className="hover:text-foreground transition-colors">stack</a>
            <a href="#projects" className="hover:text-foreground transition-colors">projects</a>
            <a href="#merge" className="hover:text-foreground transition-colors">merge</a>
            <a href="#contact" className="hover:text-foreground transition-colors">contact</a>
            <span className="text-muted-foreground/60">·</span>
            <span className="text-primary">{gitHash}</span>
          </div>
        </div>

        <div ref={storyRef} className="relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <Chapter id="top">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <motion.div
                  initial={{ opacity: 0, y: 24, rotateX: 10 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="lg:col-span-7"
                  style={{ perspective: "1200px" }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-glow bg-black/80 backdrop-blur-xl shadow-lg mb-8 font-mono text-sm text-muted-foreground">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span className="text-primary">$</span>
                    <span>git show</span>
                    <span className="text-primary">rohith</span>
                    <span className="text-muted-foreground/70">--profile</span>
                  </div>

                  <h1 className="text-4xl md:text-7xl font-bold tracking-tight leading-[1.02]">
                    <span className="text-foreground">Developer Journey</span>
                    <span className="text-foreground"> in </span>
                    <span className="text-gradient-green">3D</span>
                    <span className="block mt-2 text-green-500 font-bold text-4xl md:text-6xl">Rohith Pranov</span>
                  </h1>

                  <div className="mt-4 font-mono text-sm text-primary/90">
                     Full Stack Developer • 3D Web Creator • AI Explorer
                  </div>

                  <p className="mt-6 text-muted-foreground text-lg md:text-xl max-w-2xl">
                    An immersive developer journey showcasing my projects, skills, and growth across full-stack development, 3D web experiences, and AI-powered applications.
                  </p>

                  <div className="mt-10 flex flex-wrap gap-4">
                    <a
                      href="#projects"
                      className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium transition-all glow-green hover:brightness-110"
                    >
                      View Projects
                    </a>
                    <a
                      href="#contact"
                      className="px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-secondary transition-all"
                    >
                      Get in Touch
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.9 }}
                  className="lg:col-span-5"
                >
                  <div className="rounded-2xl bg-black/80 border-glow backdrop-blur-xl shadow-2xl p-6 glow-green-strong">
                    <div className="flex items-center justify-between pb-3 border-b border-border/60">
                      <span className="font-mono text-xs text-muted-foreground">git status</span>
                      <span className="font-mono text-xs text-primary">clean</span>
                    </div>
                    <div className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">
                      <div>
                        <span className="text-primary">On branch</span> main
                      </div>
                      <div className="mt-2 text-foreground/90">
                        Building immersive full-stack and 3D web experiences
                      </div>
                      <div className="mt-1 text-muted-foreground/80">
                        Focused on AI-powered applications and modern UI engineering
                      </div>
                      <div className="mt-3 text-primary animate-pulse">
                        Scroll to explore my journey
                      </div>
                      <div className="mt-6 rounded-xl bg-secondary/40 border border-border/60 p-4">
                        <div className="text-xs text-muted-foreground/70">Tip</div>
                        <div className="mt-1 text-foreground">
                          This portfolio uses a cinematic 3D environment with scroll-driven motion to present my developer growth like a real Git workflow.
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Chapter>

            <Chapter id="about">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-6">
                  <div className="rounded-2xl bg-black/80 border-glow backdrop-blur-xl shadow-2xl p-7">
                    <div className="font-mono text-xs text-muted-foreground mb-3">
                      <span className="text-primary">$</span> git diff --staged
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold">
                      About <span className="text-gradient-green">My Work</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground text-lg">
                      I design and develop real-world full-stack applications, immersive 3D web experiences, and AI-powered tools that solve problems and deliver smooth, modern user experiences — with a strong focus on performance, scalability, and clean engineering.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3 font-mono text-sm">
                      {[
                        "+ Full-Stack Application Development",
                        "+ Immersive 3D Web Experiences (Three.js)",
                        "+ AI-Powered Tools & Automation",
                        "+ High-Performance Frontend Engineering",
                        "+ Scalable Backend Systems",
                        "+ Modern UI/UX Design",
                      ].map((line) => (
                        <div key={line} className="rounded-lg bg-secondary/35 border border-border/60 px-3 py-2 text-foreground">
                          <span className="text-primary">{line.slice(0, 1)}</span>
                          {line.slice(1)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="rounded-2xl bg-black/80 border-glow backdrop-blur-xl shadow-2xl p-7">
                    <div className="font-mono text-xs text-muted-foreground mb-4">
                      <span className="text-primary">$</span> git log --oneline --graph
                    </div>
                    <div className="space-y-3 font-mono text-sm">
                      {[
                        ["feat", "full-stack platforms with auth & dashboards"],
                        ["feat", "interactive 3D web projects & portfolios"],
                        ["feat", "AI tools for productivity & automation"],
                        ["perf", "optimized apps for speed & scalability"],
                      ].map(([tag, msg], i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-primary">{gitHash}</span>
                          <span className="px-2 py-0.5 rounded-md bg-secondary/40 border border-border/60 text-muted-foreground">
                            {tag}
                          </span>
                          <span className="text-foreground">{msg}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 text-muted-foreground text-sm">
                      My development journey is defined by continuous problem-solving — building robust solutions that grow from initial prototypes into scalable, real-world products.
                    </div>
                  </div>
                </div>
              </div>
            </Chapter>

            <Chapter id="stack">
              <TechStackPanel />
            </Chapter>

            <Chapter id="projects">
              <div className="rounded-2xl bg-black/80 border-glow backdrop-blur-xl shadow-2xl p-7">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground mb-2">
                      <span className="text-primary">$</span> git show --name-only
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold">
                      Featured <span className="text-gradient-green">Projects</span>
                    </h2>
                    <p className="mt-3 text-muted-foreground text-lg">
                      Pick a repo — the UI stays crisp while the 3D scene continues its cinematic motion behind you.
                    </p>
                  </div>
                </div>

                <ProjectDeck projects={projects} />
              </div>
            </Chapter>

            <Chapter id="merge">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-6">
                  <div className="rounded-2xl bg-black/80 border-glow backdrop-blur-xl shadow-2xl p-7">
                    <div className="font-mono text-xs text-muted-foreground mb-3">
                      <span className="text-primary">$</span> git merge feature/production-ready
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold">
                      Ideas <span className="text-gradient-green">→</span> Production
                    </h2>
                    <p className="mt-4 text-muted-foreground text-lg">
                      I develop projects in structured stages — experimenting with new ideas, building features incrementally, testing thoroughly, and refining until they’re production-ready and user-focused.
                    </p>
                    <div className="mt-6 rounded-xl bg-secondary/40 border border-border/60 p-4 font-mono text-sm">
                      <div className="text-muted-foreground/70">Checks</div>
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        {[
                          "✓ Code quality & linting",
                          "✓ Type safety & validation",
                          "✓ Feature testing",
                          "✓ Performance optimization",
                        ].map((t) => (
                          <div key={t} className="text-foreground">
                            <span className="text-primary">{t.slice(0, 1)}</span>
                            {t.slice(1)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="rounded-2xl bg-black/80 border-glow backdrop-blur-xl shadow-2xl p-7">
                    <div className="font-mono text-xs text-muted-foreground mb-3">
                      <span className="text-primary">$</span> git log --decorate --graph --all
                    </div>
                    <div className="font-mono text-sm text-muted-foreground leading-relaxed">
                      <div className="text-foreground">*   merge: production release v1.0</div>
                      <div>* | feat: core platform features & dashboards</div>
                      <div>* | feat: AI integrations & smart automation</div>
                      <div>* | feat: interactive UI & 3D experiences</div>
                      <div>* | perf: performance tuning & scalability</div>
                      <div className="text-foreground">|/</div>
                      <div className="text-muted-foreground/70">
                        My workflow is iterative and quality-focused — transforming concepts into reliable, high-performance applications.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Chapter>

            <Chapter id="contact">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                  <div className="rounded-2xl bg-black/80 border-glow backdrop-blur-xl shadow-2xl p-7">
                    <div className="font-mono text-xs text-muted-foreground mb-3">
                      <span className="text-primary">$</span> echo "let’s ship"
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold">
                      Let’s <span className="text-gradient-green">Connect</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground text-lg">
                      Interested in collaborating, internships, or full-stack development opportunities? Feel free to connect — I’m always open to learning, building, and contributing to impactful projects.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                      {socialLinks.map(({ icon: Icon, label, href }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-secondary/90 border-glow hover:bg-secondary transition-all"
                        >
                          <Icon className="w-5 h-5 text-primary" />
                          <span className="font-mono text-sm text-foreground">{label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="rounded-2xl bg-black/80 border-glow backdrop-blur-xl shadow-2xl p-7">
                    <div className="font-mono text-xs text-muted-foreground mb-3">
                      <span className="text-primary">$</span> git remote -v
                    </div>
                    <div className="font-mono text-sm text-muted-foreground leading-relaxed">
                      <div>
                        origin <span className="text-primary">github.com/Rohithpranov07</span> (fetch)
                      </div>
                      <div>
                        origin <span className="text-primary">linkedin.com/in/rohith-pranov</span> (push)
                      </div>
                      <div className="mt-6 text-muted-foreground/70">
                        Feel free to clone my projects or push a message to my inbox!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Chapter>
          </div>

          <footer className="relative z-10 py-10 text-center font-mono text-xs text-muted-foreground">
            <div>
              <span className="text-primary">$</span> git commit -m "cinematic 3d portfolio"
            </div>
          </footer>
        </div>
      </div>
    </SmoothScroll>
  );
}

