import { motion } from "framer-motion";
import { ExternalLink, GitBranch, GitFork, Star } from "lucide-react";
import IPhoneMockup from "@/components/IPhoneMockup";
import MacBookMockup from "@/components/MacBookMockup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type DeckProject = {
  title: string;
  description: string;
  tech: string[];
  type: "mobile" | "web";
  screenImage: string;
  stars: number;
  forks: number;
  repoUrl?: string;
};

export default function ProjectDeck({ projects }: { projects: DeckProject[] }) {
  return (
    <Tabs defaultValue="p-0" className="w-full">
      <div className="flex flex-col gap-6">
        <div className="overflow-x-auto">
          <TabsList className="h-auto w-max min-w-full justify-start gap-2 bg-secondary/30 border-glow px-2 py-2 rounded-xl">
            {projects.map((p, i) => (
              <TabsTrigger
                key={p.title}
                value={`p-${i}`}
                className="font-mono text-xs md:text-sm data-[state=active]:bg-secondary data-[state=active]:text-foreground"
              >
                <span className="inline-flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  {p.title}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {projects.map((p, i) => (
          <TabsContent key={p.title} value={`p-${i}`} className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-secondary/60 border-glow font-mono text-xs text-muted-foreground mb-4">
                  <GitBranch className="w-3.5 h-3.5 text-primary" />
                  <span>{p.type === "mobile" ? "mobile-app" : "web-app"}</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {p.title}
                </h3>

                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  {p.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {p.tech.map((t, ti) => (
                    <motion.span
                      key={t}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * ti }}
                      className="px-3 py-1 rounded-full bg-secondary text-sm font-mono text-foreground border-glow cursor-default"
                    >
                      {t}
                    </motion.span>
                  ))}
                </div>

                <div className="flex items-center gap-6 text-muted-foreground text-sm mb-6 font-mono">
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
                  whileHover={{ x: 4 }}
                  className="inline-flex items-center gap-2 text-primary font-medium hover:brightness-125 transition-all"
                >
                  View Repository
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
              </div>

              <div className="order-1 lg:order-2">
                {p.type === "mobile" ? (
                  <IPhoneMockup screenImage={p.screenImage} alt={p.title} />
                ) : (
                  <MacBookMockup screenImage={p.screenImage} alt={p.title} />
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

