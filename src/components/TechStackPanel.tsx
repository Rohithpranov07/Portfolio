import { motion } from "framer-motion";
import { Braces, Boxes, Cpu, Database, GitBranch, Globe, Layers3, Rocket, ShieldCheck, Sparkles, Terminal } from "lucide-react";

const stacks = [
  {
    title: "Frontend",
    icon: Globe,
    items: ["React", "TypeScript", "Tailwind", "Design Systems", "Accessibility"],
  },
  {
    title: "Backend",
    icon: Database,
    items: ["Node.js", "Postgres", "Redis", "REST/GraphQL", "Auth + Security"],
  },
  {
    title: "3D + Motion",
    icon: Layers3,
    items: ["three.js", "react-three-fiber", "Framer Motion", "Scroll-driven scenes", "Perf budgets"],
  },
  {
    title: "Tooling",
    icon: ShieldCheck,
    items: ["Git workflows", "CI checks", "Testing", "Lint/Types", "Release hygiene"],
  },
];

const badges = [
  { icon: GitBranch, label: "branch-first" },
  { icon: Terminal, label: "ship-from-terminal" },
  { icon: Cpu, label: "perf-minded" },
  { icon: Braces, label: "clean-architecture" },
  { icon: Boxes, label: "component-systems" },
  { icon: Rocket, label: "product-focus" },
];

export default function TechStackPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
      <div className="lg:col-span-6">
        <div className="rounded-2xl bg-card/35 border-glow backdrop-blur-md p-7">
          <div className="font-mono text-xs text-muted-foreground mb-3">
            <span className="text-primary">$</span> cat stack.md
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Tech <span className="text-gradient-green">Stack</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Tools are just tools — but great tools with great taste make shipping feel cinematic.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {badges.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10, rotateX: 12 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: 0.05 * i, duration: 0.45 }}
                whileHover={{ y: -4, rotateX: 8, rotateY: -8, scale: 1.03 }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/45 border-glow font-mono text-xs text-foreground"
                style={{ perspective: "800px" }}
              >
                <Icon className="h-4 w-4 text-primary" />
                <span>{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stacks.map(({ title, icon: Icon, items }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16, rotateX: 14 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.08 * i, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -8, rotateY: i % 2 === 0 ? 10 : -10, rotateX: 6, scale: 1.01 }}
              className="rounded-2xl bg-card/30 border-glow backdrop-blur-md p-5"
              style={{ perspective: "1000px" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 font-mono text-sm text-foreground">
                  <Icon className="h-5 w-5 text-primary" />
                  <span>{title}</span>
                </div>
                <Sparkles className="h-4 w-4 text-muted-foreground/70" />
              </div>

              <ul className="space-y-2 text-sm text-muted-foreground">
                {items.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary glow-green" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

