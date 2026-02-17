import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const gitLines = [
  { text: "$ git init portfolio", delay: 0 },
  { text: "Initialized empty Git repository in ~/portfolio/.git/", delay: 300, dim: true },
  { text: "", delay: 500 },
  { text: "$ git remote add origin github.com/developer/portfolio", delay: 600 },
  { text: "", delay: 800 },
  { text: "$ git fetch origin main", delay: 900 },
  { text: "remote: Enumerating objects: 247, done.", delay: 1200, dim: true },
  { text: "remote: Counting objects: 100% (247/247), done.", delay: 1400, dim: true },
  { text: "remote: Compressing objects: 100% (189/189), done.", delay: 1600, dim: true },
  { text: "remote: Total 247 (delta 58), reused 247 (delta 58)", delay: 1800, dim: true },
  { text: "", delay: 2000 },
  { text: "$ git checkout main", delay: 2100 },
  { text: "Switched to branch 'main'", delay: 2400, dim: true, green: true },
  { text: "Your branch is up to date with 'origin/main'.", delay: 2600, dim: true },
  { text: "", delay: 2800 },
  { text: "$ npm run build", delay: 2900 },
  { text: "✓ Building portfolio...", delay: 3200, green: true },
  { text: "✓ Compiling components...", delay: 3500, green: true },
  { text: "✓ Optimizing assets...", delay: 3800, green: true },
  { text: "✓ Ready!", delay: 4100, green: true, bold: true },
];

const GitLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    gitLines.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
          setProgress(((i + 1) / gitLines.length) * 100);
        }, line.delay)
      );
    });

    // Start exit after last line
    timers.push(
      setTimeout(() => {
        setExiting(true);
      }, 4600)
    );

    timers.push(
      setTimeout(() => {
        onComplete();
      }, 5200)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Subtle grid */}
          <div className="absolute inset-0 grid-bg opacity-10" />

          <div className="relative w-full max-w-2xl mx-auto px-6">
            {/* Terminal window */}
            <div className="rounded-xl border border-border overflow-hidden bg-card/80 backdrop-blur-sm">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-[hsl(45,80%,50%)]/60" />
                <div className="w-3 h-3 rounded-full bg-primary/60" />
                <span className="ml-3 text-xs font-mono text-muted-foreground">
                  terminal — portfolio
                </span>
              </div>

              {/* Terminal body */}
              <div className="p-4 h-[360px] overflow-hidden font-mono text-sm leading-relaxed">
                {gitLines.slice(0, visibleLines).map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`${
                      line.green
                        ? "text-primary"
                        : line.dim
                        ? "text-muted-foreground/70"
                        : "text-foreground"
                    } ${line.bold ? "font-bold" : ""}`}
                  >
                    {line.text || "\u00A0"}
                  </motion.div>
                ))}
                {/* Blinking cursor */}
                {visibleLines < gitLines.length && (
                  <span className="inline-block w-2 h-4 bg-primary animate-cursor-blink" />
                )}
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-secondary">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GitLoader;
