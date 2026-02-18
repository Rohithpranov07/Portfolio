import { useState, useCallback } from "react";
import GitLoader from "@/components/GitLoader";
import CinematicPortfolio from "@/components/CinematicPortfolio";
import type { DeckProject } from "@/components/ProjectDeck";
import cybershiled from "@/assets/homepage-cybershield.png";
import sentinel from "@/assets/app_py_pg1.png";
import idle from "@/assets/Breathing - Idle.png";
import ben10 from "@/assets/ben10.png";
import home from "@/assets/Home.png";
import clear from "@/assets/clear.png";
import doc from "@/assets/Desktop - 1.png";
import pab from "@/assets/MacBook Air - 2.png";

const projects: DeckProject[] = [
  {
    title: "CyberShield India",
    description:
      "An AI-powered digital forensics platform that detects deepfake and AI-generated media, analyzes digital footprints, and secures evidence using blockchain technology. Built for real-world cybercrime investigation, forensic reporting, and tamper-proof verification.",
    tech: ["Python", "FastAPI", "React", "Next.js", "AI/ML", "Blockchain", "PostgreSQL"],
    type: "web",
    screenImage: cybershiled,
    stars: 124,
    forks: 45,
    repoUrl: "https://github.com/Rohithpranov07/cybershield-india.git"
  },
  {
    title: "SENTINEL — Agentic AI Drift Detection Platform",
    description:
      "A real-time multi-agent AI system that monitors live system behavior against evolving specification documents to detect semantic drift and contract violations using LangGraph, Pathway streaming, and Kafka.",
    tech: ["Python", "LangGraph", "Pathway", "Kafka", "LLM Agents", "Streamlit", "Real-Time Systems"],
    type: "web",
    screenImage: sentinel,
    stars: 89,
    forks: 14,
    repoUrl:"https://github.com/Rohithpranov07/Sentinel.git"
  },
  {
    title: "Ambient — Meditation App",
    description:
      "A calming mobile UX design focused on guided breathing flows using soft gradients, smooth transitions, particle effects, and emotional minimal design. Emphasizes inhale, hold, and release states with immersive visual feedback.",
    tech: ["UI/UX Design", "Figma", "Interaction Design", "Mobile App Design", "Micro-Interactions", "Visual Systems"],
    type: "mobile",
    screenImage: idle,
    stars: 215,
    forks: 34,
    repoUrl: "https://www.figma.com/proto/gKQk5R2RyniAy1y1lb6ihR/Task-1.2-Ambient-Meditation?node-id=1-139&p=f&t=M1dlfNFbKIBWLdVa-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A107", 
    actionLabel: "View Design Case Study"
  },
  {
    title: "Ben 10 Interactive webpage ",
    description:
      "An immersive landing page design inspired by gaming and entertainment platforms, featuring dark-mode visuals, neon green Omnitrix-inspired highlights, interactive card sections, responsive layout systems, and engaging visually-driven user flow.",
    tech: ["UI/UX Design", "Figma", "Prototyping", "Design Systems", "Interaction Design", "Responsive Layouts"],
    type: "web",
    screenImage: ben10,
    stars: 187,
    forks: 22,
    repoUrl: "https://www.figma.com/proto/tJikDaMx1ZE2wJdfAP3XPT/Task-3--Ben-10-Landing-Page?node-id=0-1&t=6ZjOLWijEl2FDsrn-1", 
    actionLabel: "View UX Case Study"
  },
  {
    title: "Boundary App",
    description:
      "Boundary — Personal & Social Boundaries Mobile App. A mobile UX case study helping users manage personal, social, and financial boundaries across relationships. Covers family, friends, work, and money scenarios with emphasis on emotional clarity, usability, and intuitive navigation.",
    tech: ["UI/UX Design", "Figma", "UX Research", "Wireframing", "Prototyping", "Interaction Design", "Mobile App Design"],
    type: "mobile",
    screenImage: home,
    stars: 156,
    forks: 28,
    repoUrl: "https://www.figma.com/proto/o2r1PmSuHbsRzAW2t1vMt4/Task-1--Boundary-App?node-id=2-2&t=snXwS5geqNx7UvHD-1", 
    actionLabel: "View UX Case Study"
  },
  {
    title: "WeatherNow — Ambient Weather Experience",
    description:
      "A modern frontend web app that visualizes real-time weather through immersive UI, dynamic themes, glassmorphism design, animated icons, and ambient sound effects. Features automatic location detection, live API data, and a performance-focused React + Vite architecture.",
    tech: ["React", "Vite", "CSS Animations", "Glassmorphism UI", "OpenWeather API", "Web Audio API", "Responsive Design"],
    type: "web",
    screenImage: clear,
    stars: 94,
    forks: 18,
    repoUrl: "https://ambientweatherapp.netlify.app/", 
    actionLabel: "View Live App"
  },
  {
    title: "Sony Walkman — Time Travel Music",
    description:
      "An interactive UI/UX design concept blending retro Walkman nostalgia with modern digital usability. Features immersive screens for album browsing, audio playback, and guided user flows with smooth transitions and strong visual hierarchy. Emphasizes accessibility, clean layout systems, and emotional UX storytelling.",
    tech: ["UI/UX Design", "Figma", "Wireframing", "Prototyping", "User Flow Design", "Interaction Design", "Visual Design", "Design Systems"],
    type: "web",
    screenImage: doc,
    stars: 142,
    forks: 31,
    repoUrl: "https://www.figma.com/proto/jY0TsRHDDt9GOrn9EebdJh/Task-2.1--Sony-Walkman-Time-Travel-Interface?node-id=44-1466&t=nrhaKXbLWkAH9OFD-1", 
    actionLabel: "View UX Case Study"
  },
  {
    title: "Pablo Picasso Art Portfolio",
    description:
      "A responsive portfolio website experience designed to showcase artworks through gallery-based sections with interactive previews and detailed viewing pages. Emphasizes clean layout structure, strong visual hierarchy, modern typography, and art-centric visual storytelling.",
    tech: ["UI/UX Design", "Figma", "Wireframing", "Prototyping", "Visual Design", "Interaction Design", "Responsive Design", "Layout Systems", "Design Systems"],
    type: "web",
    screenImage: pab,
    stars: 129,
    forks: 19,
    repoUrl: "https://www.figma.com/proto/xLeJZMHjKsOs9JHRADcKhD/Task-2--Pablo-Picasso-Portfolio?node-id=0-1&t=kxpXjc7t0xYW3K7Z-1", 
    actionLabel: "View UX Case Study"
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
