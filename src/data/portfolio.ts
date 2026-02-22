/* ═══════════════════════════════════════
   Shared portfolio data
   Used by CinematicCosmos (/) and Classic (/classic)
   ═══════════════════════════════════════ */

export interface Project {
  title: string;
  glyph: string;
  sub: string;
  desc: string;
  tech: string[];
  color: string;
  preferredPlanet?: string;
}

export interface Experience {
  company: string;
  role: string;
  timeframe: string;
  summary: string;
  color: string;
  ongoing: boolean;
}

export interface SkillNode {
  label: string;
  x: number;
  y: number;
  glow?: number;
}

export interface SkillConstellation {
  key: string;
  title: string;
  sanskrit: string;
  philosophy: string;
  summary: string;
  color: string;
  nodes: SkillNode[];
}

export interface Education {
  institution: string;
  path: string;
  timeframe: string;
  desc: string;
  color: string;
  starType: "primary" | "companion";
  sanskrit: string;
  highlights: string[];
}

export const PROJECTS: Project[] = [
  { title: "Ritam", glyph: "ऋतम्", sub: "LLM Observability", desc: "Budget enforcement, cost tracking & prompt optimization for AI APIs. Bringing cosmic order to LLM chaos.", tech: ["Go", "React", "Postgres"], color: "#4EA2FF", preferredPlanet: "earth" },
  { title: "Mnemosyne", glyph: "μνήμη", sub: "Cognitive Prosthesis", desc: "Memory system modeling human decay curves with biological forgetting models and contextual recall.", tech: ["TypeScript", "RAG", "Vector DB"], color: "#B6A89A", preferredPlanet: "mercury" },
  { title: "DocuMind", glyph: "ज्ञान", sub: "RAG from Scratch", desc: "Production-grade retrieval for K8s docs with custom chunking strategies & hybrid search pipelines.", tech: ["Python", "FAISS", "LangChain"], color: "#D7AA6B", preferredPlanet: "jupiter" },
  { title: "Ramayana Atlas", glyph: "रामायण", sub: "Epic Cartography", desc: "Geographic exploration of the Ramayana with AI-powered narrative discovery.", tech: ["Three.js", "Claude API", "Mapbox"], color: "#D76C4B", preferredPlanet: "mars" },
];

export const SKILL_CONSTELLATIONS: SkillConstellation[] = [
  {
    key: "ritam-grid",
    title: "Ritam Grid",
    sanskrit: "ऋतम्",
    philosophy: "ordered foundations",
    summary: "The architecture beneath everything. Type-safe systems and persistent state, shaped to hold form under pressure — so the products built on top can be fearless.",
    color: "#4EA2FF",
    nodes: [
      { label: "TypeScript", x: 12, y: 66, glow: 1.05 },
      { label: "Go", x: 28, y: 44, glow: 1.15 },
      { label: "Node.js", x: 44, y: 62, glow: 1 },
      { label: "API Design", x: 60, y: 44, glow: 0.9 },
      { label: "Postgres", x: 76, y: 56, glow: 1.05 },
      { label: "System Design", x: 55, y: 24, glow: 1.35 },
      { label: "Testing", x: 86, y: 32, glow: 0.9 },
    ],
  },
  {
    key: "rupa-arc",
    title: "Rupa Arc",
    sanskrit: "रूप",
    philosophy: "expressive interfaces",
    summary: "Where form meets feeling. Interfaces built not just to function but to move — scroll-driven narratives, spatial layouts, and design systems that carry intent in every pixel.",
    color: "#FF7C50",
    nodes: [
      { label: "React", x: 15, y: 58, glow: 1.2 },
      { label: "Next.js", x: 33, y: 38, glow: 1.05 },
      { label: "Three.js", x: 49, y: 64, glow: 1.25 },
      { label: "Motion", x: 64, y: 46, glow: 0.95 },
      { label: "Design Systems", x: 81, y: 58, glow: 1.05 },
      { label: "Accessibility", x: 45, y: 24, glow: 0.95 },
      { label: "Narrative UI", x: 71, y: 27, glow: 0.9 },
    ],
  },
  {
    key: "prajna-field",
    title: "Prajna Field",
    sanskrit: "प्रज्ञा",
    philosophy: "learned intelligence",
    summary: "Intelligence that retrieves, reasons, and knows when to stay silent. From vector search to evaluation pipelines — models shaped by guardrails, not just gradients.",
    color: "#00D6B7",
    nodes: [
      { label: "LLMs", x: 14, y: 63, glow: 1.25 },
      { label: "RAG", x: 29, y: 42, glow: 1.05 },
      { label: "Agents", x: 44, y: 58, glow: 1.05 },
      { label: "PromptOps", x: 60, y: 39, glow: 1.05 },
      { label: "Eval Pipelines", x: 76, y: 50, glow: 1.1 },
      { label: "Vector DB", x: 61, y: 71, glow: 0.95 },
      { label: "Guardrails", x: 86, y: 33, glow: 0.9 },
    ],
  },
  {
    key: "tapas-orbit",
    title: "Tapas Orbit",
    sanskrit: "तपस्",
    philosophy: "disciplined operations",
    summary: "The discipline of keeping things alive. Containers orchestrated, pipelines that self-heal, and observability deep enough to see what the system won't tell you.",
    color: "#FFD56E",
    nodes: [
      { label: "K8s", x: 18, y: 50, glow: 1.2 },
      { label: "Docker", x: 34, y: 64, glow: 0.95 },
      { label: "CI/CD", x: 47, y: 43, glow: 1.05 },
      { label: "Observability", x: 63, y: 57, glow: 1.1 },
      { label: "Cloud Infra", x: 79, y: 41, glow: 1.05 },
      { label: "SRE", x: 70, y: 24, glow: 0.95 },
      { label: "Cost Control", x: 52, y: 23, glow: 0.9 },
    ],
  },
];

export const EXPERIENCES: Experience[] = [
  {
    company: "Linux Foundation",
    role: "LFX Mentorship · Zowe",
    timeframe: "May – Aug 2024",
    summary: "First passage through open source at scale. Refactored core logic in Zowe, resolved keyring errors, and rebuilt onboarding documentation — learning how large foundations ship software.",
    color: "#7ED9E2",
    ongoing: false,
  },
  {
    company: "Palisadoes Foundation",
    role: "Open Source Maintainer",
    timeframe: "2024 – Present",
    summary: "Stewardship over multiple repositories — reviewing pull requests, mentoring contributors, and keeping long-lived codebases healthy through documentation and discipline.",
    color: "#00E5A0",
    ongoing: true,
  },
  {
    company: "Rimo LLC, Tokyo",
    role: "Software Engineering Intern",
    timeframe: "May – Jul 2025",
    summary: "Backend engineering on the Workflows team. Node.js upgrades, Temporal engine separation, and workflow-wide validation — foundational infrastructure under a production transcription service.",
    color: "#4EA2FF",
    ongoing: false,
  },
  {
    company: "Google Summer of Code",
    role: "Open Source Developer · Workflows4s",
    timeframe: "May – Aug 2025",
    summary: "Building a web UI for workflow introspection in Scala.js and Tapir — state inspection, timeline visualization, and real-time updates for a functional workflow engine.",
    color: "#FFD56E",
    ongoing: false,
  },
  {
    company: "Typelevel",
    role: "Open Source Contributor",
    timeframe: "2025 – Present",
    summary: "Contributing to Cats Effect and the broader Typelevel ecosystem — performance-oriented solutions and community engagement in the functional Scala world.",
    color: "#B88CFF",
    ongoing: true,
  },
];

export const EDUCATION: Education[] = [
  {
    institution: "IIITDM Jabalpur",
    path: "B.Tech · Computer Science",
    timeframe: "2022 – 2026",
    desc: "Formal foundations in algorithms, systems programming, discrete mathematics, and computer architecture — shaping the way I think about correctness and efficiency.",
    color: "#7AC5FF",
    starType: "primary",
    sanskrit: "गुरुकुल",
    highlights: ["Algorithms", "Systems", "Math", "Architecture"],
  },
  {
    institution: "Self-Directed / OSS",
    path: "Open Source · Independent Study",
    timeframe: "2023 – Present",
    desc: "A parallel education through contribution — functional programming, backend architecture, DevOps pipelines, and the discipline of building in public.",
    color: "#FFB347",
    starType: "companion",
    sanskrit: "स्वाध्याय",
    highlights: ["Open Source", "FP", "Backend", "DevOps"],
  },
];

export const SKILLS = Array.from(
  new Set(SKILL_CONSTELLATIONS.flatMap((c) => c.nodes.map((n) => n.label)))
);
