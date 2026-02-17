import { useState, useCallback } from "react";
import GitLoader from "@/components/GitLoader";
import CinematicPortfolio from "@/components/CinematicPortfolio";
import type { DeckProject } from "@/components/ProjectDeck";
import appScreen1 from "@/assets/app-screen-1.png";
import appScreen2 from "@/assets/app-screen-2.png";
import webScreen1 from "@/assets/web-screen-1.png";
import webScreen2 from "@/assets/web-screen-2.png";

const projects: DeckProject[] = [
  {
    title: "FitTrack Pro",
    description:
      "A comprehensive fitness tracking app with real-time workout analytics, progress rings, and personalized training plans. Built for performance and simplicity.",
    tech: ["React Native", "TypeScript", "Firebase", "D3.js"],
    type: "mobile",
    screenImage: appScreen1,
    stars: 342,
    forks: 67,
  },
  {
    title: "Anavita Dashboard",
    description:
      "Enterprise-grade analytics dashboard with real-time data visualization, custom reporting, and team collaboration features. Handles millions of data points seamlessly.",
    tech: ["React", "Next.js", "PostgreSQL", "Recharts"],
    type: "web",
    screenImage: webScreen1,
    stars: 891,
    forks: 143,
  },
  {
    title: "ConnectHub",
    description:
      "A modern social networking platform focused on developer communities. Features real-time messaging, content sharing, and collaborative spaces.",
    tech: ["React Native", "GraphQL", "Node.js", "Redis"],
    type: "mobile",
    screenImage: appScreen2,
    stars: 567,
    forks: 89,
  },
  {
    title: "GearShop",
    description:
      "Full-stack e-commerce platform with AI-powered product recommendations, real-time inventory management, and seamless checkout experience.",
    tech: ["React", "Stripe", "Supabase", "Tailwind"],
    type: "web",
    screenImage: webScreen2,
    stars: 723,
    forks: 201,
  },
];

const Index = () => {
  const [loading, setLoading] = useState(true);

  const handleLoaderComplete = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
      {loading && <GitLoader onComplete={handleLoaderComplete} />}
      <div
        className={`bg-background min-h-screen overflow-x-hidden ${
          loading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-500`}
      >
        <CinematicPortfolio projects={projects} />
      </div>
    </>
  );
};

export default Index;
