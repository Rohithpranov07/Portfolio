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
    <section id={id} className="relative h-[110vh]">
      <div className="sticky top-0 h-screen flex items-center">
        <div className="w-full">{children}</div>
      </div>
    </section>
  );
}

const socialLinks = [
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Mail, label: "Email", href: "mailto:hello@example.com" },
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
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-secondary/40 backdrop-blur-md border-glow font-mono text-xs text-muted-foreground">
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
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-glow bg-secondary/40 backdrop-blur mb-8 font-mono text-sm text-muted-foreground">
                    <Terminal className="w-4 h-4 text-primary" />
                    <span className="text-primary">$</span>
                    <span>git show</span>
                    <span className="text-primary">HEAD</span>
                    <span className="text-muted-foreground/70">--stat</span>
                  </div>

                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.02]">
                    <span className="text-foreground">Cinematic </span>
                    <span className="text-gradient-green">3D Portfolio</span>
                    <span className="text-foreground">.</span>
                  </h1>

                  <p className="mt-6 text-muted-foreground text-lg md:text-xl max-w-2xl">
                    An immersive git-themed experience: scroll through commits, branches, and merges — every section staged in 3D space.
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
                  <div className="rounded-2xl bg-card/35 border-glow backdrop-blur-md p-6 glow-green-strong">
                    <div className="flex items-center justify-between pb-3 border-b border-border/60">
                      <span className="font-mono text-xs text-muted-foreground">git status</span>
                      <span className="font-mono text-xs text-primary">clean</span>
                    </div>
                    <div className="mt-4 font-mono text-sm leading-relaxed text-muted-foreground">
                      <div>
                        <span className="text-primary">On branch</span> main
                      </div>
                      <div>Your branch is up to date with <span className="text-primary">'origin/main'</span>.</div>
                      <div className="mt-3 text-muted-foreground/70">
                        Scroll to navigate the repo.
                      </div>
                      <div className="mt-6 rounded-xl bg-secondary/40 border border-border/60 p-4">
                        <div className="text-xs text-muted-foreground/70">Tip</div>
                        <div className="mt-1 text-foreground">
                          This page uses a fixed 3D scene + scroll-driven camera for a “cinematic commit walkthrough”.
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
                  <div className="rounded-2xl bg-card/35 border-glow backdrop-blur-md p-7">
                    <div className="font-mono text-xs text-muted-foreground mb-3">
                      <span className="text-primary">$</span> git diff --staged
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold">
                      About <span className="text-gradient-green">the work</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground text-lg">
                      I build fast, polished apps with strong UI systems, careful motion, and “developer-storytelling” details.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3 font-mono text-sm">
                      {[
                        "+ UI Systems / Design Tokens",
                        "+ 3D + Motion Direction",
                        "+ Performance-first Frontend",
                        "+ Full-stack Delivery",
                        "+ DX: tooling, CI, quality",
                        "+ Clean architecture",
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
                  <div className="rounded-2xl bg-card/30 border-glow backdrop-blur-md p-7">
                    <div className="font-mono text-xs text-muted-foreground mb-4">
                      <span className="text-primary">$</span> git log --oneline --graph
                    </div>
                    <div className="space-y-3 font-mono text-sm">
                      {[
                        ["feat", "cinematic scroll + 3D scenes"],
                        ["chore", "polish design system + tokens"],
                        ["perf", "optimize render + animation budget"],
                        ["fix", "edge cases + responsive layouts"],
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
                      The 3D background is not “just decoration” — it’s mapped to scroll to create chapters (intro → branches → merge → connect).
                    </div>
                  </div>
                </div>
              </div>
            </Chapter>

            <Chapter id="stack">
              <TechStackPanel />
            </Chapter>

            <Chapter id="projects">
              <div className="rounded-2xl bg-card/25 border-glow backdrop-blur-md p-7">
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
                  <div className="rounded-2xl bg-card/35 border-glow backdrop-blur-md p-7">
                    <div className="font-mono text-xs text-muted-foreground mb-3">
                      <span className="text-primary">$</span> git merge feature/cinematic-scroll
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold">
                      Branches <span className="text-gradient-green">→</span> Merge
                    </h2>
                    <p className="mt-4 text-muted-foreground text-lg">
                      I love building in chapters: explore ideas in branches, validate with real users, then merge with confidence.
                    </p>
                    <div className="mt-6 rounded-xl bg-secondary/40 border border-border/60 p-4 font-mono text-sm">
                      <div className="text-muted-foreground/70">Checks</div>
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        {[
                          "✓ lint",
                          "✓ typecheck",
                          "✓ tests",
                          "✓ perf budget",
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
                  <div className="rounded-2xl bg-card/30 border-glow backdrop-blur-md p-7">
                    <div className="font-mono text-xs text-muted-foreground mb-3">
                      <span className="text-primary">$</span> git log --decorate --graph --all
                    </div>
                    <div className="font-mono text-sm text-muted-foreground leading-relaxed">
                      <div className="text-foreground">*   merge: cinematic scroll story</div>
                      <div>* | feat: 3D camera path + repo tunnel</div>
                      <div>* | feat: tabbed project deck</div>
                      <div>* | perf: smooth scroll + motion budget</div>
                      <div className="text-foreground">|/</div>
                      <div className="text-muted-foreground/70">
                        Keep scrolling — the 3D scene behind you is now converging into a single timeline.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Chapter>

            <Chapter id="contact">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                  <div className="rounded-2xl bg-card/35 border-glow backdrop-blur-md p-7">
                    <div className="font-mono text-xs text-muted-foreground mb-3">
                      <span className="text-primary">$</span> echo "let’s ship"
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold">
                      Let’s <span className="text-gradient-green">Connect</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground text-lg">
                      Want a portfolio like this, a product UI system, or a full app shipped end-to-end? Ping me.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                      {socialLinks.map(({ icon: Icon, label, href }) => (
                        <a
                          key={label}
                          href={href}
                          className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-secondary/45 border-glow hover:bg-secondary transition-all"
                        >
                          <Icon className="w-5 h-5 text-primary" />
                          <span className="font-mono text-sm text-foreground">{label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="rounded-2xl bg-card/30 border-glow backdrop-blur-md p-7">
                    <div className="font-mono text-xs text-muted-foreground mb-3">
                      <span className="text-primary">$</span> git remote -v
                    </div>
                    <div className="font-mono text-sm text-muted-foreground leading-relaxed">
                      <div>
                        origin <span className="text-primary">github.com/you/portfolio</span> (fetch)
                      </div>
                      <div>
                        origin <span className="text-primary">github.com/you/portfolio</span> (push)
                      </div>
                      <div className="mt-6 text-muted-foreground/70">
                        Replace the placeholder links with your real handles.
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

