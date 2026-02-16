"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import ChatPanel from "./ChatPanel";

/* ═══════════════════════════════════════
   DATA
   ═══════════════════════════════════════ */
type PlanetKey = "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune";

interface Project {
  title: string;
  glyph: string;
  sub: string;
  desc: string;
  tech: string[];
  color: string;
  preferredPlanet?: PlanetKey;
}

interface PlanetProfile {
  key: PlanetKey;
  label: string;
  glyph: string;
  sanskrit: string;
  philosophy: string;
  naturalColor: string;
  size: number;
  hasRing?: boolean;
}

interface SolarProjectSlot {
  planet: PlanetProfile;
  project: Project;
  color: string;
  isPlaceholder: boolean;
}

interface Experience {
  company: string;
  role: string;
  timeframe: string;
  summary: string;
  color: string;
  ongoing: boolean;
}

interface SkillNode {
  label: string;
  x: number;
  y: number;
  glow?: number;
}

interface SkillConstellation {
  key: string;
  title: string;
  sanskrit: string;
  philosophy: string;
  summary: string;
  color: string;
  nodes: SkillNode[];
  links: Array<[number, number]>;
}

const PROJECTS: Project[] = [
  { title: "Ritam", glyph: "ऋतम्", sub: "LLM Observability", desc: "Budget enforcement, cost tracking & prompt optimization for AI APIs. Bringing cosmic order to LLM chaos.", tech: ["Go", "React", "Postgres"], color: "#4EA2FF", preferredPlanet: "earth" },
  { title: "Mnemosyne", glyph: "μνήμη", sub: "Cognitive Prosthesis", desc: "Memory system modeling human decay curves with biological forgetting models and contextual recall.", tech: ["TypeScript", "RAG", "Vector DB"], color: "#B6A89A", preferredPlanet: "mercury" },
  { title: "DocuMind", glyph: "ज्ञान", sub: "RAG from Scratch", desc: "Production-grade retrieval for K8s docs with custom chunking strategies & hybrid search pipelines.", tech: ["Python", "FAISS", "LangChain"], color: "#D7AA6B", preferredPlanet: "jupiter" },
  { title: "Ramayana Atlas", glyph: "रामायण", sub: "Epic Cartography", desc: "Geographic exploration of the Ramayana with AI-powered narrative discovery.", tech: ["Three.js", "Claude API", "Mapbox"], color: "#D76C4B", preferredPlanet: "mars" },
];
const SOLAR_SYSTEM: PlanetProfile[] = [
  { key: "mercury", label: "Mercury", glyph: "☿", sanskrit: "बुध", philosophy: "Buddhi · clarity of mind", naturalColor: "#B7A89A", size: 0.72 },
  { key: "venus", label: "Venus", glyph: "♀", sanskrit: "शुक्र", philosophy: "Rasa · beauty and value", naturalColor: "#D8BA92", size: 0.92 },
  { key: "earth", label: "Earth", glyph: "⊕", sanskrit: "पृथ्वी", philosophy: "Rta · living order", naturalColor: "#4F9DFF", size: 1.02 },
  { key: "mars", label: "Mars", glyph: "♂", sanskrit: "मंगल", philosophy: "Virya · courageous action", naturalColor: "#D86A4D", size: 0.82 },
  { key: "jupiter", label: "Jupiter", glyph: "♃", sanskrit: "बृहस्पति", philosophy: "Jnana · wisdom and guidance", naturalColor: "#D8A76E", size: 1.45 },
  { key: "saturn", label: "Saturn", glyph: "♄", sanskrit: "शनि", philosophy: "Tapas · discipline through time", naturalColor: "#CFBF88", size: 1.28, hasRing: true },
  { key: "uranus", label: "Uranus", glyph: "♅", sanskrit: "अरुण", philosophy: "Viveka · expanded perspective", naturalColor: "#7ED9E2", size: 1.12 },
  { key: "neptune", label: "Neptune", glyph: "♆", sanskrit: "वरुण", philosophy: "Moksha · depth and transcendence", naturalColor: "#5478E8", size: 1.08 },
];
const SKILL_CONSTELLATIONS: SkillConstellation[] = [
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
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [5, 3], [5, 6], [6, 4]],
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
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [5, 6], [6, 4], [2, 5]],
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
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 4], [3, 6], [4, 6]],
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
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 6], [6, 5], [5, 4], [2, 5]],
  },
];
const EXPERIENCES: Experience[] = [
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

interface Education {
  institution: string;
  path: string;
  timeframe: string;
  desc: string;
  color: string;
  starType: "primary" | "companion";
  sanskrit: string;
  highlights: string[];
}

const EDUCATION: Education[] = [
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

const SKILLS = Array.from(new Set(SKILL_CONSTELLATIONS.flatMap((constellation) => constellation.nodes.map((node) => node.label))));

function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, v)); }
function mixHex(a: string, b: string, t: number): string {
  const mixed = new THREE.Color(a).lerp(new THREE.Color(b), clamp(t, 0, 1));
  return `#${mixed.getHexString().toUpperCase()}`;
}
function toRgba(color: THREE.Color, alpha: number): string {
  return `rgba(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)},${alpha})`;
}

function makePlaceholderProject(planet: PlanetProfile): Project {
  return {
    title: `${planet.label} Placeholder`,
    glyph: planet.glyph,
    sub: "Future Project Orbit",
    desc: `Reserved for a project aligned with ${planet.philosophy}.`,
    tech: ["Coming Soon"],
    color: planet.naturalColor,
    preferredPlanet: planet.key,
  };
}

function buildSolarProjects(projects: Project[]): SolarProjectSlot[] {
  const slots = new Array<Project | null>(SOLAR_SYSTEM.length).fill(null);
  const planetIdx = new Map<PlanetKey, number>();
  SOLAR_SYSTEM.forEach((planet, idx) => planetIdx.set(planet.key, idx));

  const unassigned: Project[] = [];
  projects.forEach((project) => {
    if (!project.preferredPlanet) {
      unassigned.push(project);
      return;
    }
    const idx = planetIdx.get(project.preferredPlanet);
    if (idx === undefined || slots[idx]) {
      unassigned.push(project);
      return;
    }
    slots[idx] = project;
  });

  for (const project of unassigned) {
    const nextIdx = slots.findIndex((slot) => slot === null);
    if (nextIdx === -1) break;
    slots[nextIdx] = project;
  }

  return SOLAR_SYSTEM.map((planet, idx) => {
    const project = slots[idx] ?? makePlaceholderProject(planet);
    const isPlaceholder = slots[idx] === null;
    const color = isPlaceholder
      ? planet.naturalColor
      : mixHex(planet.naturalColor, project.color, 0.55);
    return { planet, project, color, isPlaceholder };
  });
}

const SOLAR_PROJECTS = buildSolarProjects(PROJECTS);
const SECTIONS = ["ORIGIN", "ABOUT", "PATHWAYS", "STACK", "VOYAGE", ...SOLAR_PROJECTS.map((slot) => slot.planet.label.toUpperCase()), "SIGNAL"];
const SECTION_COLORS = ["#FF6B35", "#FF6B35", "#B0A0FF", "#00E5A0", "#B88CFF", ...SOLAR_PROJECTS.map((slot) => slot.color), "#FF6B35"];
const EDUCATION_START = 0.18;
const SKILLS_START = 0.24;
const EXPERIENCE_START = 0.38;
const PROJECTS_START = 0.52;
const PROJECTS_END = 0.88;
const CONTACT_START = 0.88;
const SKILLS_LAYOUT_MODE: "atlas" | "classic" = "atlas";

const CINEMATIC_WAYPOINTS: { t: number; duration: number }[] = [
  { t: 0.03, duration: 5 },
  { t: 0.155, duration: 7 },
  ...EDUCATION.map((_, i) => ({
    t: EDUCATION_START + ((i + 0.5) / EDUCATION.length) * (SKILLS_START - EDUCATION_START),
    duration: 6,
  })),
  ...SKILL_CONSTELLATIONS.map((_, i) => ({
    t: SKILLS_START + ((i + 0.5) / SKILL_CONSTELLATIONS.length) * (EXPERIENCE_START - SKILLS_START),
    duration: 5,
  })),
  ...EXPERIENCES.map((e, i) => ({
    t: EXPERIENCE_START + ((i + 0.5) / EXPERIENCES.length) * (PROJECTS_START - EXPERIENCE_START),
    duration: 6,
  })),
  ...SOLAR_PROJECTS.map((slot, i) => ({
    t: PROJECTS_START + ((i + 0.5) / SOLAR_PROJECTS.length) * (PROJECTS_END - PROJECTS_START),
    duration: slot.isPlaceholder ? 3 : 6,
  })),
  { t: 0.94, duration: 7 },
];

/* ═══════════════════════════════════════
   GLSL SHADERS
   ═══════════════════════════════════════ */

const starVertSrc = `
  attribute float brightness;
  attribute float temperature;
  attribute float phase;
  uniform float uTime;
  uniform float uMobileBoost;
  varying float vBright;
  varying float vTemp;
  void main() {
    float twinkle = 0.7 + 0.3 * sin(uTime * (1.0 + phase * 3.0) + phase * 6.2831853);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float depthScale = 350.0 / max(1.0, -mv.z);
    float size = brightness * twinkle * depthScale * uMobileBoost;
    gl_PointSize = clamp(size, 0.8, 55.0);
    vBright = brightness * twinkle;
    vTemp = temperature;
    gl_Position = projectionMatrix * mv;
  }
`;

const starFragSrc = `
  varying float vBright;
  varying float vTemp;
  void main() {
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r = length(uv);
    float core = exp(-r * r * 60.0);
    float inner = exp(-r * r * 12.0) * 0.5;
    float outer = exp(-r * r * 3.0) * 0.12;
    float spikeA = exp(-abs(uv.y) * 18.0) * exp(-abs(uv.x) * 4.0) * 0.3;
    float spikeB = exp(-abs(uv.x) * 18.0) * exp(-abs(uv.y) * 4.0) * 0.3;
    float edge = smoothstep(1.08, 0.05, r);
    float airy = (core + inner + outer + spikeA + spikeB) * edge * vBright;

    vec3 hot = vec3(0.68, 0.79, 1.0);
    vec3 mid = vec3(1.0, 0.98, 0.93);
    vec3 warm = vec3(1.0, 0.82, 0.6);
    vec3 cool = vec3(1.0, 0.58, 0.45);
    vec3 col = mix(hot, mid, smoothstep(0.0, 0.32, vTemp));
    col = mix(col, warm, smoothstep(0.32, 0.72, vTemp));
    col = mix(col, cool, smoothstep(0.72, 1.0, vTemp));
    col = mix(col, vec3(1.0), core * 0.7);

    gl_FragColor = vec4(col * airy, airy);
  }
`;

const threshVertSrc = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
const threshFragSrc = `
  uniform sampler2D tDiffuse;
  uniform float threshold;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(tDiffuse, vUv);
    float b = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    gl_FragColor = c * smoothstep(threshold, threshold + 0.3, b);
  }
`;

const blurFragSrc = `
  uniform sampler2D tDiffuse;
  uniform vec2 direction;
  uniform vec2 resolution;
  varying vec2 vUv;
  void main() {
    vec4 sum = vec4(0.0);
    vec2 step = direction / resolution;
    sum += texture2D(tDiffuse, vUv) * 0.227027;
    sum += texture2D(tDiffuse, vUv + step * 1.0) * 0.1945946;
    sum += texture2D(tDiffuse, vUv - step * 1.0) * 0.1945946;
    sum += texture2D(tDiffuse, vUv + step * 2.0) * 0.1216216;
    sum += texture2D(tDiffuse, vUv - step * 2.0) * 0.1216216;
    sum += texture2D(tDiffuse, vUv + step * 3.0) * 0.054054;
    sum += texture2D(tDiffuse, vUv - step * 3.0) * 0.054054;
    sum += texture2D(tDiffuse, vUv + step * 4.0) * 0.016216;
    sum += texture2D(tDiffuse, vUv - step * 4.0) * 0.016216;
    gl_FragColor = sum;
  }
`;

const compositeFragSrc = `
  uniform sampler2D tScene;
  uniform sampler2D tBloom;
  uniform sampler2D tBloom2;
  uniform float uTime;
  uniform float uBloomStrength;
  varying vec2 vUv;
  void main() {
    vec2 center = vUv - 0.5;
    float dist = length(center);
    float ca = 0.00075 * dist;
    vec2 caDir = normalize(center + 0.001) * ca;
    float r = texture2D(tScene, vUv + caDir).r;
    float g = texture2D(tScene, vUv).g;
    float b = texture2D(tScene, vUv - caDir).b;
    vec3 scene = vec3(r, g, b);
    vec3 bloom1 = texture2D(tBloom, vUv).rgb;
    vec3 bloom2 = texture2D(tBloom2, vUv).rgb;
    vec3 bloom = bloom1 * 0.55 + bloom2 * 0.35;
    vec3 color = scene + bloom * uBloomStrength;
    float vign = 1.0 - smoothstep(0.52, 1.05, dist);
    color *= vign;
    color.r *= 1.01;
    color.b *= 0.995;
    float grain = fract(sin(dot(vUv * (uTime * 0.5 + 1.0), vec2(12.9898, 78.233))) * 43758.5453);
    grain = (grain - 0.5) * 0.012;
    color += grain;
    color = color / (color + 1.05);
    color = smoothstep(0.0, 1.0, color);
    gl_FragColor = vec4(color, 1.0);
  }
`;


const cometTailVertSrc = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vUv = uv;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

// Ion tail (Type I): straight, narrow, blue-shifted. Ionized gas pushed by solar wind.
const ionTailFragSrc = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uFocus;
  uniform float uOngoing;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float taper = smoothstep(0.0, 0.06, vUv.x) * mix(smoothstep(1.0, 0.55, vUv.x), smoothstep(1.0, 0.92, vUv.x), step(0.5, uOngoing));
    // Ion streamers: fast-moving plasma filaments
    float stream1 = 0.6 + 0.4 * sin(vUv.x * 32.0 - uTime * 6.0 + vUv.y * 8.0);
    float stream2 = 0.7 + 0.3 * sin(vUv.x * 55.0 - uTime * 8.5);
    float kink = 1.0 + 0.15 * sin(vUv.x * 12.0 - uTime * 2.2);
    float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 2.2);
    float core = exp(-pow(abs(vUv.y - 0.5) * 4.0, 2.0));
    float alpha = (0.03 + uFocus * 0.28) * taper * stream1 * stream2 * kink * core + fres * 0.06 * taper;
    // Blue-shift: ion tails are blue/cyan from CO+ and H2O+ emissions
    vec3 ionColor = mix(uColor, vec3(0.55, 0.75, 1.0), 0.55);
    ionColor = mix(ionColor, vec3(1.0), fres * 0.35 + core * 0.15);
    gl_FragColor = vec4(ionColor, alpha);
  }
`;

// Dust tail (Type II): curved, wider, warm yellow-white. Heavier particles lag behind.
const dustTailFragSrc = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uFocus;
  uniform float uOngoing;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float taper = smoothstep(0.0, 0.1, vUv.x) * mix(smoothstep(1.0, 0.45, vUv.x), smoothstep(1.0, 0.88, vUv.x), step(0.5, uOngoing));
    // Dust is slower, more diffuse, no sharp streamers
    float drift = 0.65 + 0.35 * sin(vUv.x * 8.0 - uTime * 1.4 + vUv.y * 3.0);
    float grain = 0.8 + 0.2 * sin(vUv.x * 80.0 - uTime * 3.0 + sin(vUv.y * 20.0) * 2.0);
    float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 1.8);
    // Wider profile than ion tail
    float spread = exp(-pow(abs(vUv.y - 0.5) * 2.5, 2.0));
    float alpha = (0.02 + uFocus * 0.18) * taper * drift * grain * spread + fres * 0.03 * taper;
    // Warm color: sunlight reflecting off silicate dust grains
    vec3 dustColor = mix(uColor, vec3(1.0, 0.92, 0.78), 0.45);
    dustColor = mix(dustColor, vec3(1.0, 0.98, 0.94), spread * 0.25);
    gl_FragColor = vec4(dustColor, alpha);
  }
`;

// Anti-tail: thin spike toward the sun (large dust grains in orbital plane seen edge-on)
const antiTailFragSrc = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uFocus;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float taper = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.3, vUv.x);
    float core = exp(-pow(abs(vUv.y - 0.5) * 6.0, 2.0));
    float shimmer = 0.7 + 0.3 * sin(vUv.x * 20.0 - uTime * 1.5);
    float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 2.0);
    float alpha = (0.008 + uFocus * 0.04) * taper * core * shimmer + fres * 0.01 * taper;
    vec3 antiColor = mix(uColor, vec3(1.0, 0.95, 0.85), 0.5);
    gl_FragColor = vec4(antiColor, alpha);
  }
`;

// 3D flight-path ribbon for the cosmic map
const mapPathFragSrc = `
  uniform vec3 uColor;
  uniform vec3 uColor2;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    // Energy pulses flowing along the path
    float flow1 = pow(fract(vUv.x * 4.0 - uTime * 0.35), 6.0) * 1.8;
    float flow2 = pow(fract(vUv.x * 7.0 - uTime * 0.55 + 0.33), 8.0) * 0.8;
    float flow3 = pow(fract(vUv.x * 2.0 - uTime * 0.18), 3.0) * 0.5;
    float ambient = 0.08 + 0.04 * sin(vUv.x * 12.0 + uTime * 0.8);
    float edge = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.75, vUv.y);
    float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 2.5);
    float alpha = (ambient + flow1 + flow2 + flow3 + fres * 0.25) * edge * uOpacity;
    // Gradient color along path
    vec3 col = mix(uColor, uColor2, vUv.x);
    col = mix(col, vec3(1.0), (flow1 + flow2) * 0.3 + fres * 0.2);
    gl_FragColor = vec4(col, alpha);
  }
`;

// Accretion disk: spiral heating pattern on a flat plane, dual-color gradient
const accretionDiskFragSrc = `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uFocus;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float r = length(c);
    float angle = atan(c.y, c.x);
    // Disk annulus: visible between inner and outer radii
    float inner = smoothstep(0.08, 0.14, r);
    float outer = smoothstep(0.48, 0.38, r);
    float ring = inner * outer;
    // Spiral heating arms
    float spiral = 0.5 + 0.5 * sin(angle * 3.0 - r * 18.0 + uTime * 2.2);
    float spiral2 = 0.5 + 0.5 * sin(angle * 5.0 + r * 12.0 - uTime * 1.7);
    float heat = spiral * 0.6 + spiral2 * 0.4;
    // Color: gradient from inner hot (colorA) to outer cooler (colorB)
    float radialT = smoothstep(0.08, 0.42, r);
    vec3 col = mix(uColorA, uColorB, radialT);
    col = mix(col, vec3(1.0), heat * 0.15 * (1.0 - radialT));
    float alpha = ring * (0.03 + uFocus * 0.18) * (0.6 + heat * 0.4);
    gl_FragColor = vec4(col, alpha);
  }
`;

// Mass transfer stream: luminous flowing tube between stars (Roche lobe overflow)
const massTransferFragSrc = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uFocus;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float taper = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
    // Flowing plasma blobs
    float flow1 = 0.5 + 0.5 * sin(vUv.x * 20.0 - uTime * 4.5);
    float flow2 = 0.6 + 0.4 * sin(vUv.x * 35.0 - uTime * 6.0 + 1.0);
    float core = exp(-pow(abs(vUv.y - 0.5) * 5.0, 2.0));
    float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 2.0);
    float alpha = (0.02 + uFocus * 0.2) * taper * core * flow1 * flow2 + fres * 0.04 * taper;
    vec3 col = mix(uColor, vec3(1.0), core * 0.3 + fres * 0.2);
    gl_FragColor = vec4(col, alpha);
  }
`;

/* ═══════════════════════════════════════
   TEXTURE HELPERS
   ═══════════════════════════════════════ */
const _glowCache = new Map<string, THREE.CanvasTexture>();
function makeGlow(color: string, sz: number): THREE.CanvasTexture {
  const key = `${color}|${sz}`;
  const cached = _glowCache.get(key);
  if (cached) return cached;
  const c = document.createElement("canvas"); c.width = sz; c.height = sz;
  const x = c.getContext("2d")!, h = sz / 2;
  const g = x.createRadialGradient(h, h, 0, h, h, h);
  g.addColorStop(0, color); g.addColorStop(0.15, color + "AA");
  g.addColorStop(0.4, color + "33"); g.addColorStop(0.7, color + "0D"); g.addColorStop(1, "transparent");
  x.fillStyle = g; x.fillRect(0, 0, sz, sz);
  const tex = new THREE.CanvasTexture(c);
  _glowCache.set(key, tex);
  return tex;
}

function makeStarCore(sz: number): THREE.CanvasTexture {
  const c = document.createElement("canvas"); c.width = sz; c.height = sz;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(sz, sz);
  const h = sz / 2;
  const sigma = sz * 0.06;
  const sigma2 = 2 * sigma * sigma;
  for (let y = 0; y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      const dx = x - h, dy = y - h;
      const intensity = Math.exp(-(dx * dx + dy * dy) / sigma2);
      const idx = (y * sz + x) * 4;
      img.data[idx] = img.data[idx + 1] = img.data[idx + 2] = 255;
      img.data[idx + 3] = Math.round(intensity * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

const _glintCache = new Map<string, THREE.CanvasTexture>();
function makeStarGlint(color: string, sz: number): THREE.CanvasTexture {
  const key = `${color}|${sz}`;
  const cached = _glintCache.get(key);
  if (cached) return cached;
  const c = document.createElement("canvas"); c.width = sz; c.height = sz;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(sz, sz);
  const h = sz / 2;
  const col = new THREE.Color(color);
  const cr = Math.round(col.r * 255), cg = Math.round(col.g * 255), cb = Math.round(col.b * 255);
  const cSigma = sz * 0.03, cSigma2 = 2 * cSigma * cSigma;
  const spikeDecay = sz * 0.22, diagDecay = sz * 0.12;
  for (let y = 0; y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      const dx = x - h, dy = y - h;
      const r2 = dx * dx + dy * dy;
      const center = Math.exp(-r2 / cSigma2) * 0.6;
      const hS = Math.abs(dy) < 1.5 ? Math.exp(-Math.abs(dx) / spikeDecay) * 0.7 : 0;
      const vS = Math.abs(dx) < 1.5 ? Math.exp(-Math.abs(dy) / spikeDecay) * 0.7 : 0;
      const d1 = Math.abs(dx - dy) / 1.414, d1l = Math.abs(dx + dy) / 1.414;
      const diag1 = d1 < 1.5 ? Math.exp(-d1l / diagDecay) * 0.25 : 0;
      const d2 = Math.abs(dx + dy) / 1.414, d2l = Math.abs(dx - dy) / 1.414;
      const diag2 = d2 < 1.5 ? Math.exp(-d2l / diagDecay) * 0.25 : 0;
      const intensity = Math.min(1, center + hS + vS + diag1 + diag2);
      const t = Math.min(1, Math.sqrt(r2) / (sz * 0.3));
      const idx = (y * sz + x) * 4;
      img.data[idx]     = Math.round(255 + (cr - 255) * t);
      img.data[idx + 1] = Math.round(255 + (cg - 255) * t);
      img.data[idx + 2] = Math.round(255 + (cb - 255) * t);
      img.data[idx + 3] = Math.round(intensity * 255);
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  _glintCache.set(key, tex);
  return tex;
}

function makeNebula(color: string, sz: number): THREE.CanvasTexture {
  const c = document.createElement("canvas"); c.width = sz; c.height = sz;
  const x = c.getContext("2d")!, h = sz / 2;
  for (let i = 0; i < 5; i++) {
    const ox = h + (Math.random() - 0.5) * sz * 0.4;
    const oy = h + (Math.random() - 0.5) * sz * 0.4;
    const r = sz * (0.2 + Math.random() * 0.3);
    const g = x.createRadialGradient(ox, oy, 0, ox, oy, r);
    g.addColorStop(0, color + "20");
    g.addColorStop(0.5, color + "0A");
    g.addColorStop(1, "transparent");
    x.fillStyle = g; x.fillRect(0, 0, sz, sz);
  }
  return new THREE.CanvasTexture(c);
}

function makeSoftDot(sz: number): THREE.CanvasTexture {
  const c = document.createElement("canvas"); c.width = sz; c.height = sz;
  const x = c.getContext("2d")!, h = sz / 2;
  const g = x.createRadialGradient(h, h, 0, h, h, h);
  g.addColorStop(0, "rgba(255,255,255,0.6)");
  g.addColorStop(0.3, "rgba(255,255,255,0.15)");
  g.addColorStop(0.6, "rgba(255,255,255,0.02)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.fillRect(0, 0, sz, sz);
  return new THREE.CanvasTexture(c);
}

function makePlanetTexture(baseColor: string, sz: number): THREE.CanvasTexture {
  const c = document.createElement("canvas"); c.width = sz; c.height = sz;
  const x = c.getContext("2d")!;
  const base = new THREE.Color(baseColor);
  const vivid = base.clone();
  vivid.offsetHSL(0, 0.28, 0.08);
  const dark = vivid.clone().lerp(new THREE.Color("#090B14"), 0.42);
  const mid = vivid.clone().lerp(new THREE.Color("#D7E1FF"), 0.12);
  const light = vivid.clone().lerp(new THREE.Color("#FFFFFF"), 0.46);

  const baseGrad = x.createRadialGradient(sz * 0.34, sz * 0.3, sz * 0.08, sz * 0.52, sz * 0.55, sz * 0.58);
  baseGrad.addColorStop(0, toRgba(light, 1));
  baseGrad.addColorStop(0.5, toRgba(mid, 1));
  baseGrad.addColorStop(1, toRgba(dark, 1));
  x.fillStyle = baseGrad;
  x.fillRect(0, 0, sz, sz);

  const bands = 26;
  for (let i = 0; i < bands; i++) {
    const y = (i / bands) * sz + (Math.random() - 0.5) * sz * 0.045;
    const thickness = sz * (0.018 + Math.random() * 0.032);
    const band = vivid.clone();
    band.offsetHSL((Math.random() - 0.5) * 0.04, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2);
    x.fillStyle = toRgba(band, 0.14 + Math.random() * 0.2);
    x.fillRect(0, y, sz, thickness);
  }

  for (let i = 0; i < 38; i++) {
    const cx = sz * (0.1 + Math.random() * 0.8);
    const cy = sz * (0.12 + Math.random() * 0.76);
    const r = sz * (0.016 + Math.random() * 0.055);
    const cloud = vivid.clone().lerp(new THREE.Color("#FFFFFF"), 0.5 + Math.random() * 0.22);
    const puff = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    puff.addColorStop(0, toRgba(cloud, 0.24 + Math.random() * 0.2));
    puff.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = puff;
    x.fillRect(cx - r, cy - r, r * 2, r * 2);
  }

  const tintGlow = x.createRadialGradient(sz * 0.45, sz * 0.38, sz * 0.08, sz * 0.52, sz * 0.54, sz * 0.62);
  tintGlow.addColorStop(0, toRgba(vivid, 0.22));
  tintGlow.addColorStop(0.68, "rgba(0,0,0,0)");
  x.fillStyle = tintGlow;
  x.fillRect(0, 0, sz, sz);

  const limb = x.createRadialGradient(sz * 0.54, sz * 0.54, sz * 0.2, sz * 0.54, sz * 0.54, sz * 0.58);
  limb.addColorStop(0.72, "rgba(0,0,0,0)");
  limb.addColorStop(1, "rgba(0,0,0,0.4)");
  x.fillStyle = limb;
  x.fillRect(0, 0, sz, sz);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════ */
interface UiState {
  section: number;
  progress: number;
  loaded: boolean;
}

interface ScrollState {
  progress: number;
  target: number;
  mouse: { x: number; y: number };
  sm: { x: number; y: number };
  speed: number;
}

interface NodeRef {
  grp: THREE.Group;
  core: THREE.Mesh;
  ring: THREE.Mesh | null;
  atmosphere: THREE.Sprite;
  haze: THREE.Sprite;
  haloBase: number;
  motes: THREE.Points;
  bp: THREE.Vector3;
  spin: number;
}

interface SkillStarRef {
  anchor: THREE.Object3D;
  core: THREE.Sprite;
  glint: THREE.Sprite;
  halo: THREE.Sprite;
  base: THREE.Vector3;
  twinkle: number;
  jitter: number;
  brightness: number;
}

interface SkillLinkRef {
  line: THREE.Line;
  mat: THREE.LineBasicMaterial;
}

interface SkillClusterRef {
  grp: THREE.Group;
  stars: SkillStarRef[];
  links: SkillLinkRef[];
  light: THREE.PointLight;
  aura: THREE.Sprite;
  dust: THREE.Points;
  spread: number;
  bp: THREE.Vector3;
  auraBase: number;
}

interface CometRef {
  grp: THREE.Group;
  nucleus: THREE.Sprite;
  coma: THREE.Sprite;
  comaOuter: THREE.Sprite;
  ionTail: THREE.Mesh;
  ionTailMat: THREE.ShaderMaterial;
  dustTail: THREE.Mesh;
  dustTailMat: THREE.ShaderMaterial;
  jets: THREE.Points;
  jetPositions: Float32Array;
  jetVelocities: Float32Array;
  dustParticles: THREE.Points;
  dustPositions: Float32Array;
  dustVelocities: Float32Array;
  nucleusGlint: THREE.Sprite;
  sunwardComa: THREE.Sprite;
  bowShock: THREE.Sprite;
  ionStreamers: THREE.Points;
  ionStreamerPositions: Float32Array;
  ionStreamerVelocities: Float32Array;
  antiTail: THREE.Mesh;
  antiTailMat: THREE.ShaderMaterial;
  light: THREE.PointLight;
  bp: THREE.Vector3;
  color: THREE.Color;
  ongoing: boolean;
  sunDir: THREE.Vector3;
}

interface BinaryStarRef {
  grp: THREE.Group;
  starA: THREE.Sprite;
  starAGlint: THREE.Sprite;
  starAHalo: THREE.Sprite;
  starB: THREE.Sprite;
  starBGlint: THREE.Sprite;
  starBHalo: THREE.Sprite;
  accretionDisk: THREE.Mesh;
  accretionMat: THREE.ShaderMaterial;
  massStream: THREE.Mesh;
  massStreamMat: THREE.ShaderMaterial;
  lagrangeGlow: THREE.Sprite;
  orbitDust: THREE.Points;
  light: THREE.PointLight;
  bp: THREE.Vector3;
  orbitRadius: number;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768 || "ontouchstart" in window);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

export default function CinematicCosmos() {
  const isMobile = useIsMobile();
  const mountRef = useRef<HTMLDivElement>(null);
  const st = useRef<ScrollState>({ progress: 0, target: 0, mouse: { x: 0, y: 0 }, sm: { x: 0, y: 0 }, speed: 0 });
  const [ui, setUi] = useState<UiState>({ section: 0, progress: 0, loaded: false });
  const [chatOpen, setChatOpen] = useState(false);
  const chatOpenRef = useRef(false);
  useEffect(() => { chatOpenRef.current = chatOpen; }, [chatOpen]);
  const [orbHovered, setOrbHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loaderReady, setLoaderReady] = useState(false);
  const [mapShown, setMapShown] = useState(false);
  const [mapDismissed, setMapDismissed] = useState(false);
  const [miniMapOpen, setMiniMapOpen] = useState(false);
  const [clockTime, setClockTime] = useState("");
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorTrailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cursorPos = useRef({ x: -100, y: -100 });
  const cursorTrails = useRef<{ x: number; y: number }[]>(Array.from({ length: 5 }, () => ({ x: -100, y: -100 })));
  const [cinematicActive, setCinematicActive] = useState(false);
  const cinematicRef = useRef({ active: false, idx: 0, phase: "traveling" as "traveling" | "dwelling", dwell: 0, lastT: 0 });
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<{ ctx: AudioContext; master: GainNode; started: boolean } | null>(null);
  const mapActiveRef = useRef(false);
  const mapFadeRef = useRef(0);
  const mapScrollRef = useRef({ progress: 0, target: 0, smooth: 0 });
  const mapLabelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mapDotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ct = mountRef.current;
    if (!ct) return;
    const W = ct.clientWidth, H = ct.clientHeight;
    const mob = W < 768 || "ontouchstart" in window;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: mob ? "default" : "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x02040b);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.autoClear = false;
    ct.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(mob ? 72 : 65, W / H, 0.1, 800);
    scene.fog = new THREE.FogExp2(0x02040b, 0.0065);

    const ambientLight = new THREE.AmbientLight(0x324268, 0.34);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.05);
    keyLight.position.set(18, 12, 22);
    const rimLight = new THREE.DirectionalLight(0x80a6ff, 0.45);
    rimLight.position.set(-20, -8, -26);
    scene.add(ambientLight, keyLight, rimLight);

    /* ── Camera path ── */
    const camPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 80),
      new THREE.Vector3(1.5, 0.8, 52),
      new THREE.Vector3(0, 1.5, 32),
      new THREE.Vector3(-3, 2.5, 14),
      new THREE.Vector3(10, 1.5, -8),
      new THREE.Vector3(5, 3.5, -28),
      new THREE.Vector3(-8, 4.5, -48),
      new THREE.Vector3(-3, 2.5, -68),
      new THREE.Vector3(12, 1, -88),
      new THREE.Vector3(7, 3.5, -108),
      new THREE.Vector3(-10, 2.5, -128),
      new THREE.Vector3(-5, 1.5, -148),
      new THREE.Vector3(0, 0, -172),
      new THREE.Vector3(0, 0, -185),
    ], false, "catmullrom", 0.3);

    /* ════════════════════════════════════
       BLOOM PIPELINE
       ════════════════════════════════════ */
    const mainTarget = new THREE.WebGLRenderTarget(W, H, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, type: THREE.HalfFloatType });
    const bloomRes = { w: Math.floor(W / 2), h: Math.floor(H / 2) };
    const bloomRes2 = { w: Math.floor(W / 4), h: Math.floor(H / 4) };
    const brightTarget = new THREE.WebGLRenderTarget(bloomRes.w, bloomRes.h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType });
    const pingTarget = new THREE.WebGLRenderTarget(bloomRes.w, bloomRes.h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType });
    const pongTarget = new THREE.WebGLRenderTarget(bloomRes.w, bloomRes.h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType });
    const ping2 = new THREE.WebGLRenderTarget(bloomRes2.w, bloomRes2.h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType });
    const pong2 = new THREE.WebGLRenderTarget(bloomRes2.w, bloomRes2.h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, type: THREE.HalfFloatType });

    const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadGeo = new THREE.PlaneGeometry(2, 2);

    const threshMat = new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, threshold: { value: 0.11 } },
      vertexShader: threshVertSrc, fragmentShader: threshFragSrc,
    });
    const threshQuad = new THREE.Mesh(quadGeo, threshMat);
    const threshScene = new THREE.Scene(); threshScene.add(threshQuad);

    const makeBlurMat = (res: { w: number; h: number }) => new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null }, direction: { value: new THREE.Vector2(1, 0) }, resolution: { value: new THREE.Vector2(res.w, res.h) } },
      vertexShader: threshVertSrc, fragmentShader: blurFragSrc,
    });
    const blurMatH = makeBlurMat(bloomRes);
    const blurMatV = makeBlurMat(bloomRes);
    const blurMat2H = makeBlurMat(bloomRes2);
    const blurMat2V = makeBlurMat(bloomRes2);
    blurMatV.uniforms.direction.value.set(0, 1);
    blurMat2V.uniforms.direction.value.set(0, 1);
    const blurQuad = new THREE.Mesh(quadGeo, blurMatH);
    const blurScene = new THREE.Scene(); blurScene.add(blurQuad);

    const compMat = new THREE.ShaderMaterial({
      uniforms: {
        tScene: { value: null }, tBloom: { value: null }, tBloom2: { value: null },
        uTime: { value: 0 }, uBloomStrength: { value: 1.48 },
      },
      vertexShader: threshVertSrc, fragmentShader: compositeFragSrc,
    });
    const compQuad = new THREE.Mesh(quadGeo, compMat);
    const compScene = new THREE.Scene(); compScene.add(compQuad);

    /* ════════════════════════════════════
       SCENE OBJECTS
       ════════════════════════════════════ */

    /* ── Shader-based stars ── */
    const STAR_N = mob ? 3200 : 5200;
    const sPos = new Float32Array(STAR_N * 3);
    const sBright = new Float32Array(STAR_N);
    const sTemp = new Float32Array(STAR_N);
    const sPhase = new Float32Array(STAR_N);
    for (let i = 0; i < STAR_N; i++) {
      const inBand = Math.random() < 0.65;
      sPos[i * 3] = (Math.random() - 0.5) * 360;
      sPos[i * 3 + 1] = inBand
        ? (Math.random() - 0.5) * 72 + (Math.random() - 0.5) * 20
        : (Math.random() - 0.5) * 220;
      sPos[i * 3 + 2] = -30 - Math.random() * 430;
      sBright[i] = Math.pow(Math.random(), 2.5) * 3.0 + 0.3;
      sTemp[i] = Math.pow(Math.random(), 0.85);
      sPhase[i] = Math.random();
    }
    for (let i = 0; i < 30; i++) {
      const idx = Math.floor(Math.random() * STAR_N);
      sBright[idx] = 3.0 + Math.random() * 3.0;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    starGeo.setAttribute("brightness", new THREE.BufferAttribute(sBright, 1));
    starGeo.setAttribute("temperature", new THREE.BufferAttribute(sTemp, 1));
    starGeo.setAttribute("phase", new THREE.BufferAttribute(sPhase, 1));
    const starMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uMobileBoost: { value: mob ? 1.8 : 1.0 } },
      vertexShader: starVertSrc, fragmentShader: starFragSrc,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ── Background dim dust ── */
    const dotTex = makeSoftDot(32);
    const DUST_N = mob ? 1200 : 2000;
    const dPos = new Float32Array(DUST_N * 3);
    const dCol = new Float32Array(DUST_N * 3);
    const dp = [[0.4, 0.17, 0.08], [0, 0.36, 0.25], [0.12, 0.32, 0.31], [0.4, 0.34, 0.1]];
    for (let i = 0; i < DUST_N; i++) {
      dPos[i * 3] = (Math.random() - 0.5) * 260;
      dPos[i * 3 + 1] = (Math.random() - 0.5) * 140;
      dPos[i * 3 + 2] = Math.random() * -340 + 100;
      const c = dp[Math.floor(Math.random() * dp.length)];
      const v = 0.15 + Math.random() * 0.2;
      dCol[i * 3] = c[0] * v; dCol[i * 3 + 1] = c[1] * v; dCol[i * 3 + 2] = c[2] * v;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
    dustGeo.setAttribute("color", new THREE.BufferAttribute(dCol, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      size: mob ? 2.4 : 1.7, map: dotTex, transparent: true, opacity: mob ? 0.24 : 0.18,
      vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    }));
    scene.add(dust);

    const FAR_STAR_N = mob ? 1000 : 1800;
    const fsPos = new Float32Array(FAR_STAR_N * 3);
    for (let i = 0; i < FAR_STAR_N; i++) {
      fsPos[i * 3] = (Math.random() - 0.5) * 440;
      fsPos[i * 3 + 1] = (Math.random() - 0.5) * 260;
      fsPos[i * 3 + 2] = -120 - Math.random() * 500;
    }
    const farStars = new THREE.Points(
      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(fsPos, 3)),
      new THREE.PointsMaterial({
        size: mob ? 1.8 : 1.2,
        color: new THREE.Color("#A4B3D4"),
        map: dotTex,
        transparent: true,
        opacity: mob ? 0.22 : 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    scene.add(farStars);

    /* ── Nebula clouds ── */
    const nebColors = ["#2C3A58", "#3E4D70", "#18433E", "#5A4A35", "#2C3256"];
    const nebs: { sp: THREE.Sprite; by: number; spd: number; off: number }[] = [];
    const nebCount = mob ? 12 : 25;
    for (let i = 0; i < nebCount; i++) {
      const t = i / nebCount;
      const pt = camPath.getPointAt(Math.min(0.98, t));
      const col = nebColors[Math.floor(Math.random() * nebColors.length)];
      const tex = makeNebula(col, 256);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, transparent: true, opacity: 0.03 + Math.random() * 0.04,
        blending: THREE.NormalBlending, depthWrite: false,
      }));
      sp.position.set(pt.x + (Math.random() - 0.5) * 60, pt.y + (Math.random() - 0.5) * 34, pt.z + (Math.random() - 0.5) * 26);
      const s = 24 + Math.random() * 52;
      sp.scale.set(s, s * (0.5 + Math.random() * 0.5), 1);
      scene.add(sp);
      nebs.push({ sp, by: sp.position.y, spd: 0.06 + Math.random() * 0.16, off: Math.random() * 6.28 });
    }

    /* ── Skills constellations (3D) ── */
    const skillPos = SKILL_CONSTELLATIONS.map((_, idx) => {
      const t = SKILLS_START + ((idx + 0.52) / SKILL_CONSTELLATIONS.length) * (EXPERIENCE_START - SKILLS_START);
      const pt = camPath.getPointAt(Math.min(0.92, t));
      const lateral = Math.sin(idx * 1.45) * 6.4;
      const vertical = Math.cos(idx * 1.11) * 1.7;
      return new THREE.Vector3(pt.x + lateral, pt.y + vertical, pt.z - 5.4);
    });
    const skillClusters: SkillClusterRef[] = [];
    // Shared core glow texture for all skill stars (always white, power-of-2)
    const sharedCoreGlow = makeStarCore(128);
    SKILL_CONSTELLATIONS.forEach((cluster, idx) => {
      const grp = new THREE.Group();
      grp.position.copy(skillPos[idx]);
      const spread = 2.2 + idx * 0.24;
      const accent = new THREE.Color(cluster.color);
      const tint = accent.clone().lerp(new THREE.Color("#FFFFFF"), 0.78);
      const starGlow = makeStarGlint(cluster.color, 256);
      // Shared halo glow per cluster (same color for all stars in this constellation)
      const clusterHaloGlow = makeGlow(cluster.color, 64);

      const stars: SkillStarRef[] = [];
      const starPositions = cluster.nodes.map((node, nodeIdx) => {
        const x = ((node.x - 50) / 50) * spread * 2.05;
        const y = ((50 - node.y) / 50) * spread * 1.25;
        const z = (Math.random() - 0.5) * spread * 1.4 + Math.sin(nodeIdx * 1.37) * 0.28;
        return new THREE.Vector3(x, y, z);
      });

      starPositions.forEach((pos, nodeIdx) => {
        const node = cluster.nodes[nodeIdx];
        const brightness = node?.glow ?? 1;
        const anchor = new THREE.Object3D();
        anchor.position.copy(pos);

        // Layer 1: Tight hot-white core (pure light point)
        const coreSize = 0.04 + brightness * 0.03;
        const core = new THREE.Sprite(new THREE.SpriteMaterial({
          map: sharedCoreGlow,
          color: new THREE.Color("#FFFFFF").lerp(accent.clone(), 0.08),
          transparent: true,
          opacity: 1.0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }));
        core.scale.set(coreSize, coreSize, 1);
        anchor.add(core);

        // Layer 2: Diffraction glint (spikes + colored haze)
        const glintSize = coreSize * 3.5 + brightness * 0.12;
        const glint = new THREE.Sprite(new THREE.SpriteMaterial({
          map: starGlow,
          transparent: true,
          opacity: 0.18,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }));
        glint.scale.set(glintSize, glintSize, 1);
        anchor.add(glint);

        // Layer 3: Wide soft halo (colored atmosphere)
        const haloSize = glintSize * 1.4;
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({
          map: clusterHaloGlow,
          transparent: true,
          opacity: 0.03,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }));
        halo.scale.set(haloSize, haloSize, 1);
        anchor.add(halo);

        grp.add(anchor);
        stars.push({
          anchor,
          core,
          glint,
          halo,
          base: pos.clone(),
          twinkle: Math.random() * Math.PI * 2,
          jitter: 0.04 + Math.random() * 0.1,
          brightness,
        });
      });

      const links: SkillLinkRef[] = [];
      cluster.links.forEach(([fromIdx, toIdx]) => {
        const from = starPositions[fromIdx];
        const to = starPositions[toIdx];
        if (!from || !to) return;
        const lineGeo = new THREE.BufferGeometry().setFromPoints([from, to]);
        const linkMat = new THREE.LineBasicMaterial({
          color: tint.clone().lerp(new THREE.Color("#FFFFFF"), 0.45),
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const line = new THREE.Line(lineGeo, linkMat);
        grp.add(line);
        links.push({ line, mat: linkMat });
      });

      const aura = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeGlow(cluster.color, 256),
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
      const auraBase = spread * 1.8;
      aura.scale.set(auraBase, auraBase, 1);
      grp.add(aura);
      const light = new THREE.PointLight(accent.clone().lerp(new THREE.Color("#FFFFFF"), 0.22), 0, spread * 11.5, 2);
      light.position.set(0, 0, 0);
      grp.add(light);

      const dN = mob ? 30 : 60;
      const dP = new Float32Array(dN * 3);
      for (let j = 0; j < dN; j++) {
        const a = Math.random() * Math.PI * 2;
        const r = spread * (1.75 + Math.random() * 1.12);
        dP[j * 3] = Math.cos(a) * r;
        dP[j * 3 + 1] = (Math.random() - 0.5) * (spread * 0.18);
        dP[j * 3 + 2] = Math.sin(a) * r;
      }
      const dGeo = new THREE.BufferGeometry();
      dGeo.setAttribute("position", new THREE.BufferAttribute(dP, 3));
      const dust = new THREE.Points(
        dGeo,
        new THREE.PointsMaterial({
          size: 0.022,
          map: dotTex,
          color: tint.clone(),
          transparent: true,
          opacity: 0.19,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      grp.add(dust);

      grp.visible = false;
      scene.add(grp);
      skillClusters.push({ grp, stars, links, light, aura, dust, spread, bp: skillPos[idx].clone(), auraBase });
    });

    /* ── Comet trails (experience) ── */
    const cometPositions = EXPERIENCES.map((_, idx) => {
      const t = EXPERIENCE_START + ((idx + 0.5) / EXPERIENCES.length) * (PROJECTS_START - EXPERIENCE_START);
      const pt = camPath.getPointAt(Math.min(0.95, t));
      const lateral = Math.sin(idx * 1.92 + 0.6) * 4.8;
      const vertical = Math.cos(idx * 1.35) * 1.2;
      return new THREE.Vector3(pt.x + lateral, pt.y + vertical, pt.z - 3.8);
    });

    const comets: CometRef[] = [];
    EXPERIENCES.forEach((exp, idx) => {
      const grp = new THREE.Group();
      grp.position.copy(cometPositions[idx]);
      const accent = new THREE.Color(exp.color);

      // Sun direction — each comet has a slightly different "sun" position
      // Both tails point AWAY from the sun (real physics)
      const sunDir = new THREE.Vector3(
        -0.7 + Math.sin(idx * 1.1) * 0.3,
        -0.2 + Math.cos(idx * 0.8) * 0.15,
        -0.6,
      ).normalize();
      const antiSun = sunDir.clone().negate(); // tails point away from sun

      // ── NUCLEUS: tiny, dim solid core (real nuclei are dark, albedo ~0.04) ──
      const nucleusTex = makeGlow("#FFFFFF", 64);
      const nucleus = new THREE.Sprite(new THREE.SpriteMaterial({
        map: nucleusTex,
        color: accent.clone().lerp(new THREE.Color("#FFFFFF"), 0.3),
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
      nucleus.scale.set(0.08, 0.08, 1);
      grp.add(nucleus);

      // ── COMA: sublimated gas envelope (much larger than nucleus) ──
      // Inner coma: bright, concentrated
      const comaTex = makeGlow(exp.color, 256);
      const coma = new THREE.Sprite(new THREE.SpriteMaterial({
        map: comaTex,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
      coma.scale.set(1.1, 1.1, 1);
      grp.add(coma);

      // Outer coma: diffuse hydrogen envelope
      const comaOuter = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeGlow(exp.color, 256),
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
      comaOuter.scale.set(2.8, 2.8, 1);
      grp.add(comaOuter);

      // ── ION TAIL (Type I): narrow, straight, points directly away from sun ──
      // CO+ and H2O+ ions accelerated by solar wind to ~100 km/s
      const ionLen = exp.ongoing ? 7.0 : 5.0;
      const ionPoints: THREE.Vector3[] = [];
      for (let j = 0; j <= 40; j++) {
        const frac = j / 40;
        // Slight kinks from solar wind turbulence (disconnection events)
        const kink = Math.sin(frac * 6.0 + idx * 2.3) * 0.06 * frac;
        const kinkY = Math.cos(frac * 4.5 + idx * 1.7) * 0.04 * frac;
        ionPoints.push(new THREE.Vector3(
          antiSun.x * frac * ionLen + kink,
          antiSun.y * frac * ionLen + kinkY,
          antiSun.z * frac * ionLen,
        ));
      }
      const ionCurve = new THREE.CatmullRomCurve3(ionPoints, false, "catmullrom", 0.2);
      const ionTailMat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: accent.clone() },
          uTime: { value: 0 },
          uFocus: { value: 0 },
          uOngoing: { value: exp.ongoing ? 1.0 : 0.0 },
        },
        vertexShader: cometTailVertSrc,
        fragmentShader: ionTailFragSrc,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const ionTail = new THREE.Mesh(
        new THREE.TubeGeometry(ionCurve, 56, 0.025, 8, false),
        ionTailMat,
      );
      grp.add(ionTail);

      // ── DUST TAIL (Type II): wider, curved, lags behind orbital path ──
      // Silicate/carbon grains pushed by radiation pressure, curve due to orbital motion
      const dustLen = exp.ongoing ? 5.5 : 4.0;
      const orbitTangent = new THREE.Vector3(
        Math.cos(idx * 1.5 + 0.4),
        0.1,
        Math.sin(idx * 1.5 + 0.4),
      ).normalize().multiplyScalar(0.35);
      const dustPoints: THREE.Vector3[] = [];
      for (let j = 0; j <= 36; j++) {
        const frac = j / 36;
        // Dust curves away from anti-sun direction due to orbital velocity
        const curveFactor = frac * frac * 1.2;
        dustPoints.push(new THREE.Vector3(
          antiSun.x * frac * dustLen + orbitTangent.x * curveFactor,
          antiSun.y * frac * dustLen + orbitTangent.y * curveFactor + Math.sin(frac * 3.0 + idx) * 0.04,
          antiSun.z * frac * dustLen + orbitTangent.z * curveFactor,
        ));
      }
      const dustCurve = new THREE.CatmullRomCurve3(dustPoints, false, "catmullrom", 0.3);
      const dustTailMat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: accent.clone() },
          uTime: { value: 0 },
          uFocus: { value: 0 },
          uOngoing: { value: exp.ongoing ? 1.0 : 0.0 },
        },
        vertexShader: cometTailVertSrc,
        fragmentShader: dustTailFragSrc,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const dustTail = new THREE.Mesh(
        new THREE.TubeGeometry(dustCurve, 48, 0.06, 8, false),
        dustTailMat,
      );
      grp.add(dustTail);

      // ── SUBLIMATION JETS: gas venting from nucleus surface ──
      // When sunlit side heats up, volatiles sublimate in focused jets
      const jetN = mob ? 50 : 80;
      const jetPositions = new Float32Array(jetN * 3);
      const jetVelocities = new Float32Array(jetN * 3);
      for (let j = 0; j < jetN; j++) {
        // Jets emerge from sunward hemisphere, then get pushed anti-sunward
        const theta = (Math.random() - 0.5) * Math.PI * 0.6;
        const phi = Math.random() * Math.PI * 2;
        const speed = 0.003 + Math.random() * 0.005;
        jetPositions[j * 3] = (Math.random() - 0.5) * 0.08;
        jetPositions[j * 3 + 1] = (Math.random() - 0.5) * 0.08;
        jetPositions[j * 3 + 2] = (Math.random() - 0.5) * 0.08;
        // Initial jet direction: away from sun + random cone spread
        jetVelocities[j * 3] = (antiSun.x + Math.sin(phi) * Math.cos(theta) * 0.5) * speed;
        jetVelocities[j * 3 + 1] = (antiSun.y + Math.sin(theta) * 0.5) * speed;
        jetVelocities[j * 3 + 2] = (antiSun.z + Math.cos(phi) * Math.cos(theta) * 0.5) * speed;
      }
      const jetGeo = new THREE.BufferGeometry();
      jetGeo.setAttribute("position", new THREE.BufferAttribute(jetPositions, 3));
      const jets = new THREE.Points(jetGeo, new THREE.PointsMaterial({
        size: 0.04,
        map: dotTex,
        color: accent.clone().lerp(new THREE.Color("#FFFFFF"), 0.6),
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }));
      grp.add(jets);

      // ── DUST TRAIL PARTICLES: larger grains in the dust tail ──
      const dustPN = mob ? 90 : 150;
      const dustPositions = new Float32Array(dustPN * 3);
      const dustVelocities = new Float32Array(dustPN * 3);
      for (let j = 0; j < dustPN; j++) {
        const frac = Math.random();
        const pt = dustCurve.getPointAt(Math.min(0.95, frac));
        dustPositions[j * 3] = pt.x + (Math.random() - 0.5) * 0.35;
        dustPositions[j * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.35;
        dustPositions[j * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.35;
        // Dust grains drift slowly along anti-sun + orbit tangent
        const dSpeed = 0.001 + Math.random() * 0.002;
        dustVelocities[j * 3] = (antiSun.x * 0.6 + orbitTangent.x * 0.4) * dSpeed;
        dustVelocities[j * 3 + 1] = (Math.random() - 0.5) * 0.001;
        dustVelocities[j * 3 + 2] = (antiSun.z * 0.6 + orbitTangent.z * 0.4) * dSpeed;
      }
      const dustPGeo = new THREE.BufferGeometry();
      dustPGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
      const dustParticles = new THREE.Points(dustPGeo, new THREE.PointsMaterial({
        size: 0.07,
        map: dotTex,
        color: new THREE.Color("#FFF5E6"),
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }));
      grp.add(dustParticles);

      // ── NUCLEUS GLINT: diffraction spikes from intense point source ──
      const nucleusGlintTex = makeStarGlint(exp.color, 128);
      const nucleusGlint = new THREE.Sprite(new THREE.SpriteMaterial({
        map: nucleusGlintTex,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
      nucleusGlint.scale.set(0.25, 0.25, 1);
      grp.add(nucleusGlint);

      // ── SUNWARD COMA: asymmetric glow shifted toward sun (direct sublimation) ──
      const sunwardComa = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeGlow(exp.color, 256),
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
      sunwardComa.scale.set(0.9, 0.9, 1);
      sunwardComa.position.set(sunDir.x * 0.25, sunDir.y * 0.25, sunDir.z * 0.25);
      grp.add(sunwardComa);

      // ── BOW SHOCK: faint arc where solar wind meets outgassing ──
      const bowShock = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeGlow("#FFFFFF", 128),
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
      bowShock.scale.set(1.8, 0.6, 1);
      bowShock.position.set(sunDir.x * 0.7, sunDir.y * 0.7, sunDir.z * 0.7);
      grp.add(bowShock);

      // ── ION STREAMER PARTICLES: discrete particles moving along ion tail ──
      const ionStreamerN = mob ? 35 : 60;
      const ionStreamerPositions = new Float32Array(ionStreamerN * 3);
      const ionStreamerVelocities = new Float32Array(ionStreamerN * 3);
      for (let j = 0; j < ionStreamerN; j++) {
        const frac = Math.random();
        const pt = ionCurve.getPointAt(Math.min(0.95, frac));
        ionStreamerPositions[j * 3] = pt.x + (Math.random() - 0.5) * 0.08;
        ionStreamerPositions[j * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.08;
        ionStreamerPositions[j * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.08;
        const iSpeed = 0.005 + Math.random() * 0.008;
        ionStreamerVelocities[j * 3] = antiSun.x * iSpeed;
        ionStreamerVelocities[j * 3 + 1] = antiSun.y * iSpeed + (Math.random() - 0.5) * 0.001;
        ionStreamerVelocities[j * 3 + 2] = antiSun.z * iSpeed;
      }
      const ionStreamerGeo = new THREE.BufferGeometry();
      ionStreamerGeo.setAttribute("position", new THREE.BufferAttribute(ionStreamerPositions, 3));
      const ionStreamers = new THREE.Points(ionStreamerGeo, new THREE.PointsMaterial({
        size: 0.03,
        map: dotTex,
        color: accent.clone().lerp(new THREE.Color("#7AC5FF"), 0.6),
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }));
      grp.add(ionStreamers);

      // ── ANTI-TAIL: thin spike toward the sun (large dust grains seen edge-on near perihelion) ──
      const antiLen = 1.5;
      const antiPoints: THREE.Vector3[] = [];
      for (let j = 0; j <= 16; j++) {
        const frac = j / 16;
        antiPoints.push(new THREE.Vector3(
          sunDir.x * frac * antiLen,
          sunDir.y * frac * antiLen,
          sunDir.z * frac * antiLen,
        ));
      }
      const antiCurve = new THREE.CatmullRomCurve3(antiPoints, false, "catmullrom", 0.2);
      const antiTailMat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: accent.clone() },
          uTime: { value: 0 },
          uFocus: { value: 0 },
        },
        vertexShader: cometTailVertSrc,
        fragmentShader: antiTailFragSrc,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const antiTail = new THREE.Mesh(
        new THREE.TubeGeometry(antiCurve, 16, 0.015, 6, false),
        antiTailMat,
      );
      grp.add(antiTail);

      // Point light — coma illumination
      const light = new THREE.PointLight(accent.clone().lerp(new THREE.Color("#FFFFFF"), 0.3), 0, 14, 2);
      grp.add(light);

      grp.visible = false;
      scene.add(grp);
      comets.push({
        grp, nucleus, coma, comaOuter, ionTail, ionTailMat, dustTail, dustTailMat,
        jets, jetPositions, jetVelocities, dustParticles, dustPositions, dustVelocities,
        nucleusGlint, sunwardComa, bowShock, ionStreamers, ionStreamerPositions, ionStreamerVelocities,
        antiTail, antiTailMat,
        light, bp: cometPositions[idx].clone(), color: accent, ongoing: exp.ongoing, sunDir,
      });
    });

    /* ── Binary star system (education) ── */
    const eduCenter = camPath.getPointAt((EDUCATION_START + SKILLS_START) / 2);
    const eduPos = new THREE.Vector3(eduCenter.x + 5.5, eduCenter.y + 1.0, eduCenter.z - 4.5);
    const bsGrp = new THREE.Group();
    bsGrp.position.copy(eduPos);
    const bsOrbitRadius = 1.8;

    // Primary star — blue-white (IIITDM formal education)
    const starAGlow = makeGlow("#7AC5FF", 256);
    const starA = new THREE.Sprite(new THREE.SpriteMaterial({
      map: starAGlow, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    starA.scale.set(1.4, 1.4, 1);
    bsGrp.add(starA);
    const starAGlint = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeStarGlint("#7AC5FF", 256), transparent: true, opacity: 0.35,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    starAGlint.scale.set(2.8, 2.8, 1);
    bsGrp.add(starAGlint);
    const starAHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlow("#7AC5FF", 256), transparent: true, opacity: 0.08,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    starAHalo.scale.set(5.0, 5.0, 1);
    bsGrp.add(starAHalo);

    // Companion star — warm orange (self-directed learning)
    const starBGlow = makeGlow("#FFB347", 256);
    const starB = new THREE.Sprite(new THREE.SpriteMaterial({
      map: starBGlow, transparent: true, opacity: 0.65,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    starB.scale.set(1.0, 1.0, 1);
    bsGrp.add(starB);
    const starBGlint = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeStarGlint("#FFB347", 256), transparent: true, opacity: 0.3,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    starBGlint.scale.set(2.2, 2.2, 1);
    bsGrp.add(starBGlint);
    const starBHalo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlow("#FFB347", 256), transparent: true, opacity: 0.06,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    starBHalo.scale.set(4.0, 4.0, 1);
    bsGrp.add(starBHalo);

    // Accretion disk — tilted plane with custom shader
    const accretionMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color("#7AC5FF") },
        uColorB: { value: new THREE.Color("#FFB347") },
        uFocus: { value: 0 },
      },
      vertexShader: threshVertSrc,
      fragmentShader: accretionDiskFragSrc,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const accretionDisk = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), accretionMat);
    accretionDisk.rotation.x = -Math.PI * 0.42;
    accretionDisk.rotation.z = 0.15;
    bsGrp.add(accretionDisk);

    // Mass transfer stream — tube connecting the two stars
    const streamCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-bsOrbitRadius * 0.4, 0, 0),
      new THREE.Vector3(-bsOrbitRadius * 0.15, 0.2, 0.1),
      new THREE.Vector3(bsOrbitRadius * 0.15, -0.15, -0.05),
      new THREE.Vector3(bsOrbitRadius * 0.6, 0, 0),
    ], false, "catmullrom", 0.3);
    const massStreamMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color("#C0A0FF") },
        uTime: { value: 0 },
        uFocus: { value: 0 },
      },
      vertexShader: cometTailVertSrc,
      fragmentShader: massTransferFragSrc,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const massStream = new THREE.Mesh(
      new THREE.TubeGeometry(streamCurve, 32, 0.05, 8, false),
      massStreamMat,
    );
    bsGrp.add(massStream);

    // L1 Lagrange glow — purple sprite at midpoint
    const lagrangeGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeGlow("#B0A0FF", 128),
      transparent: true, opacity: 0.12,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    lagrangeGlow.scale.set(1.2, 1.2, 1);
    bsGrp.add(lagrangeGlow);

    // 120 orbital dust particles
    const bsDustN = mob ? 80 : 120;
    const bsDustPos = new Float32Array(bsDustN * 3);
    for (let j = 0; j < bsDustN; j++) {
      const a = Math.random() * Math.PI * 2;
      const r = bsOrbitRadius * (0.6 + Math.random() * 1.4);
      bsDustPos[j * 3] = Math.cos(a) * r;
      bsDustPos[j * 3 + 1] = (Math.random() - 0.5) * 0.5;
      bsDustPos[j * 3 + 2] = Math.sin(a) * r;
    }
    const bsDustGeo = new THREE.BufferGeometry();
    bsDustGeo.setAttribute("position", new THREE.BufferAttribute(bsDustPos, 3));
    const orbitDust = new THREE.Points(bsDustGeo, new THREE.PointsMaterial({
      size: 0.04, map: dotTex,
      color: new THREE.Color("#C0B0FF"),
      transparent: true, opacity: 0.15,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    }));
    bsGrp.add(orbitDust);

    // Point light
    const bsLight = new THREE.PointLight(new THREE.Color("#7AC5FF").lerp(new THREE.Color("#FFB347"), 0.4), 0, 18, 2);
    bsGrp.add(bsLight);

    bsGrp.visible = false;
    scene.add(bsGrp);
    const binaryStar: BinaryStarRef = {
      grp: bsGrp, starA, starAGlint, starAHalo, starB, starBGlint, starBHalo,
      accretionDisk, accretionMat, massStream, massStreamMat,
      lagrangeGlow, orbitDust, light: bsLight, bp: eduPos.clone(), orbitRadius: bsOrbitRadius,
    };

    /* ── Project celestial nodes ── */
    const nPos = SOLAR_PROJECTS.map((_, idx) => {
      const slotSpan = (PROJECTS_END - PROJECTS_START) / SOLAR_PROJECTS.length;
      const t = PROJECTS_START + (idx + 0.58) * slotSpan;
      const pt = camPath.getPointAt(Math.min(0.93, t));
      const lateral = Math.sin(idx * 1.17) * 2.8;
      const vertical = Math.cos(idx * 0.91) * 0.85;
      return new THREE.Vector3(pt.x + lateral, pt.y + vertical, pt.z - 2.4);
    });
    const nodes: NodeRef[] = [];
    // Shared unit sphere geometry for all planets (scaled per-mesh)
    const sharedPlanetGeo = new THREE.SphereGeometry(1, 48, 48);
    SOLAR_PROJECTS.forEach((slot, idx) => {
      const grp = new THREE.Group();
      grp.position.copy(nPos[idx]);
      const radius = 0.85 * slot.planet.size;
      const tex = makePlanetTexture(slot.color, mob ? 256 : 512);
      const core = new THREE.Mesh(
        sharedPlanetGeo,
        new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.72,
          metalness: 0.02,
          emissive: new THREE.Color(slot.color).multiplyScalar(slot.isPlaceholder ? 0.14 : 0.23),
          emissiveIntensity: 1.42,
        })
      );
      core.scale.setScalar(radius);
      core.rotation.z = (Math.random() - 0.5) * 0.35;
      grp.add(core);
      let ring: THREE.Mesh | null = null;
      if (slot.planet.hasRing) {
        ring = new THREE.Mesh(
          new THREE.RingGeometry(radius * 1.45, radius * 2.25, 96),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(slot.color).lerp(new THREE.Color("#FFFFFF"), 0.12),
            transparent: true,
            opacity: 0.26,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        );
        ring.rotation.x = Math.PI * 0.36;
        ring.rotation.y = Math.PI * 0.2;
        grp.add(ring);
      }
      const atmosphere = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeGlow(slot.color, 256), transparent: true, opacity: slot.isPlaceholder ? 0.3 : 0.42, blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      const haloBase = radius * 4.9;
      atmosphere.scale.set(haloBase, haloBase, 1); grp.add(atmosphere);
      const haze = new THREE.Sprite(new THREE.SpriteMaterial({
        map: makeGlow(slot.color, 256), transparent: true, opacity: slot.isPlaceholder ? 0.11 : 0.16, blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      haze.scale.set(radius * 9.2, radius * 9.2, 1); grp.add(haze);
      const mN = mob ? 30 : 45; const mP = new Float32Array(mN * 3);
      for (let j = 0; j < mN; j++) {
        const a = (j / mN) * Math.PI * 2 + Math.random() * 0.4;
        const r = radius * 2.2 + Math.random() * (radius * 1.7);
        mP[j * 3] = Math.cos(a) * r; mP[j * 3 + 1] = (Math.random() - 0.5) * 2; mP[j * 3 + 2] = Math.sin(a) * r;
      }
      const mGeo = new THREE.BufferGeometry(); mGeo.setAttribute("position", new THREE.BufferAttribute(mP, 3));
      const motes = new THREE.Points(mGeo, new THREE.PointsMaterial({
        size: 0.11,
        map: dotTex,
        color: new THREE.Color(slot.color),
        transparent: true,
        opacity: slot.isPlaceholder ? 0.26 : 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
      grp.add(motes);
      scene.add(grp);
      nodes.push({ grp, core, ring, atmosphere, haze, haloBase, motes, bp: nPos[idx].clone(), spin: 0.2 + Math.random() * 0.3 });
    });

    // Connection curves
    const connLines: THREE.Line[] = [];
    for (let i = 0; i < nPos.length - 1; i++) {
      const pts: THREE.Vector3[] = []; const a = nPos[i], b = nPos[i + 1];
      for (let s = 0; s <= 60; s++) { const t = s / 60; pts.push(new THREE.Vector3(lerp(a.x, b.x, t) + Math.sin(t * Math.PI * 4) * 2, lerp(a.y, b.y, t) + Math.cos(t * Math.PI * 3) * 1.5, lerp(a.z, b.z, t))); }
      const ln = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.01, blending: THREE.AdditiveBlending, depthWrite: false }));
      scene.add(ln);
      connLines.push(ln);
    }
    // Objects to hide during map mode (always-visible items only; comets/skills are managed by anim loop)
    const mapHideObjs = [...nodes.map(n => n.grp), ...connLines, binaryStar.grp];

    /* ════════════════════════════════════
       3D FLIGHT MAP
       ════════════════════════════════════ */
    const mapGrp = new THREE.Group();
    const mapPathMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color("#FF6B35") }, uColor2: { value: new THREE.Color("#00E5A0") }, uTime: { value: 0 }, uOpacity: { value: 0 } },
      vertexShader: cometTailVertSrc, fragmentShader: mapPathFragSrc,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    mapGrp.add(new THREE.Mesh(new THREE.TubeGeometry(camPath, 400, 0.5, 12, false), mapPathMat));
    const mapCoreMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color("#FFFFFF") }, uColor2: { value: new THREE.Color("#80D4FF") }, uTime: { value: 0 }, uOpacity: { value: 0 } },
      vertexShader: cometTailVertSrc, fragmentShader: mapPathFragSrc,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    mapGrp.add(new THREE.Mesh(new THREE.TubeGeometry(camPath, 400, 0.12, 8, false), mapCoreMat));

    const mapWaypoints = [
      { label: "Origin", sanskrit: "उत्पत्ति", t: 0.003, color: "#FF6B35" },
      { label: "Pathways", sanskrit: "मार्ग", t: EDUCATION_START, color: "#B0A0FF" },
      { label: "Stack", sanskrit: "विद्या", t: SKILLS_START, color: "#00E5A0" },
      { label: "Voyage", sanskrit: "यात्रा", t: EXPERIENCE_START, color: "#B88CFF" },
      { label: "Worlds", sanskrit: "ग्रह", t: PROJECTS_START, color: "#D7AA6B" },
      { label: "Signal", sanskrit: "संकेत", t: CONTACT_START, color: "#FF6B35" },
    ];
    const mapWpObjs: { sprite: THREE.Sprite; halo: THREE.Sprite; ring: THREE.Mesh; pos: THREE.Vector3 }[] = [];
    mapWaypoints.forEach((wp, idx) => {
      const pos = camPath.getPointAt(Math.min(0.998, wp.t));
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeStarGlint(wp.color, 256), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      sprite.position.copy(pos); sprite.scale.set(6, 6, 1); mapGrp.add(sprite);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeGlow(wp.color, 256), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      halo.position.copy(pos); halo.scale.set(16, 16, 1); mapGrp.add(halo);
      const ring = new THREE.Mesh(new THREE.RingGeometry(4.5, 4.8, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(wp.color), transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
      ring.position.copy(pos); ring.rotation.x = Math.PI * 0.4 + idx * 0.3; ring.rotation.y = idx * 0.7; mapGrp.add(ring);
      mapWpObjs.push({ sprite, halo, ring, pos: pos.clone() });
    });

    const MAP_FLOW_N = mob ? 120 : 350;
    const mapFlowProg = new Float32Array(MAP_FLOW_N);
    const mapFlowPos = new Float32Array(MAP_FLOW_N * 3);
    const mapFlowCol = new Float32Array(MAP_FLOW_N * 3);
    const mapFlowSpd = new Float32Array(MAP_FLOW_N);
    for (let i = 0; i < MAP_FLOW_N; i++) {
      mapFlowProg[i] = Math.random(); mapFlowSpd[i] = 0.0006 + Math.random() * 0.0008;
      const pt = camPath.getPointAt(mapFlowProg[i]);
      mapFlowPos[i*3]=pt.x+(Math.random()-.5)*.6; mapFlowPos[i*3+1]=pt.y+(Math.random()-.5)*.6; mapFlowPos[i*3+2]=pt.z+(Math.random()-.5)*.6;
      const c = new THREE.Color("#FF6B35").lerp(new THREE.Color("#00E5A0"), mapFlowProg[i]);
      mapFlowCol[i*3]=c.r; mapFlowCol[i*3+1]=c.g; mapFlowCol[i*3+2]=c.b;
    }
    const mapFlowGeo = new THREE.BufferGeometry();
    mapFlowGeo.setAttribute("position", new THREE.BufferAttribute(mapFlowPos, 3));
    mapFlowGeo.setAttribute("color", new THREE.BufferAttribute(mapFlowCol, 3));
    const mapFlowPts = new THREE.Points(mapFlowGeo, new THREE.PointsMaterial({ size: 0.6, map: dotTex, vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
    mapGrp.add(mapFlowPts);

    const MAP_DUST_N = mob ? 150 : 500;
    const mdP = new Float32Array(MAP_DUST_N * 3);
    for (let i = 0; i < MAP_DUST_N; i++) { const t=Math.random(); const pt=camPath.getPointAt(t); mdP[i*3]=pt.x+(Math.random()-.5)*18; mdP[i*3+1]=pt.y+(Math.random()-.5)*14; mdP[i*3+2]=pt.z+(Math.random()-.5)*8; }
    const mapDustGeo = new THREE.BufferGeometry();
    mapDustGeo.setAttribute("position", new THREE.BufferAttribute(mdP, 3));
    const mapDustPts = new THREE.Points(mapDustGeo, new THREE.PointsMaterial({ size: 0.08, map: dotTex, color: new THREE.Color("#8090B0"), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
    mapGrp.add(mapDustPts);

    scene.add(mapGrp); mapGrp.visible = false;
    // Map camera: side view that travels alongside the path as user scrolls
    const MAP_CAM_OFFSET = new THREE.Vector3(28, 14, 0); // offset from path point (side + above)

    /* ════════════════════════════════════
       EVENTS
       ════════════════════════════════════ */
    let curW = W, curH = H;
    const resize = () => {
      const w = ct.clientWidth, h = ct.clientHeight;
      curW = w; curH = h;
      const dpr = Math.min(window.devicePixelRatio, 2);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(dpr);
      const pw = Math.floor(w * dpr), ph = Math.floor(h * dpr);
      mainTarget.setSize(pw, ph);
      const bw = Math.floor(pw / 2), bh = Math.floor(ph / 2);
      const bw2 = Math.floor(pw / 4), bh2 = Math.floor(ph / 4);
      brightTarget.setSize(bw, bh);
      pingTarget.setSize(bw, bh);
      pongTarget.setSize(bw, bh);
      ping2.setSize(bw2, bh2);
      pong2.setSize(bw2, bh2);
      blurMatH.uniforms.resolution.value.set(bw, bh);
      blurMatV.uniforms.resolution.value.set(bw, bh);
      blurMat2H.uniforms.resolution.value.set(bw2, bh2);
      blurMat2V.uniforms.resolution.value.set(bw2, bh2);
    };
    window.addEventListener("resize", resize);

    const onWheel = (e: WheelEvent) => { e.preventDefault(); if (chatOpenRef.current) return; if (cinematicRef.current.active) { cinematicRef.current.active = false; setCinematicActive(false); } if (mapActiveRef.current) { mapScrollRef.current.target += e.deltaY * 0.0003; mapScrollRef.current.target = clamp(mapScrollRef.current.target, 0, 1); return; } st.current.target += e.deltaY * 0.00012; st.current.target = clamp(st.current.target, 0, 1); st.current.speed = Math.abs(e.deltaY * 0.001); };
    ct.addEventListener("wheel", onWheel, { passive: false });
    let tY = 0;
    let touchVelocity = 0;
    let lastTouchTime = 0;
    const onTS = (e: TouchEvent) => { tY = e.touches[0].clientY; touchVelocity = 0; lastTouchTime = performance.now(); };
    const onTM = (e: TouchEvent) => {
      e.preventDefault(); if (chatOpenRef.current) return;
      if (cinematicRef.current.active) { cinematicRef.current.active = false; setCinematicActive(false); }
      const dy = tY - e.touches[0].clientY; tY = e.touches[0].clientY;
      const now = performance.now();
      const dt = Math.max(1, now - lastTouchTime);
      lastTouchTime = now;
      touchVelocity = dy / dt; // px per ms
      if (mapActiveRef.current) { mapScrollRef.current.target += dy * 0.0008; mapScrollRef.current.target = clamp(mapScrollRef.current.target, 0, 1); return; }
      st.current.target += dy * (mob ? 0.0007 : 0.0004);
      st.current.target = clamp(st.current.target, 0, 1);
      st.current.speed = Math.abs(dy * 0.002);
      // Feed touch X into parallax (gentle sway based on swipe position)
      if (mob) { st.current.mouse.x = ((e.touches[0].clientX / window.innerWidth) - 0.5) * 1.2; }
    };
    const onTE = () => {
      // Inertia: apply remaining velocity as momentum
      if (mob && Math.abs(touchVelocity) > 0.1) {
        const momentum = touchVelocity * 18; // convert to scroll delta equivalent
        st.current.target += momentum * 0.0007;
        st.current.target = clamp(st.current.target, 0, 1);
        st.current.speed = Math.abs(momentum * 0.002);
      }
    };
    ct.addEventListener("touchstart", onTS, { passive: true });
    ct.addEventListener("touchmove", onTM, { passive: false });
    ct.addEventListener("touchend", onTE, { passive: true });
    const onMM = (e: MouseEvent) => { st.current.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2; st.current.mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2; };
    window.addEventListener("mousemove", onMM);

    // Device orientation for mobile camera parallax (gyroscope)
    let hasGyro = false;
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      hasGyro = true;
      // gamma: left/right tilt (-90 to 90), beta: front/back tilt (-180 to 180)
      st.current.mouse.x = clamp((e.gamma || 0) / 30, -1, 1);
      st.current.mouse.y = clamp(-((e.beta || 0) - 60) / 40, -1, 1); // 60deg = phone held upright
    };
    if (mob) window.addEventListener("deviceorientation", onOrientation, true);

    /* ════════════════════════════════════
       ANIMATION LOOP
       ════════════════════════════════════ */
    const clock = new THREE.Clock();
    let raf: number;
    let prevSec = -1; let prevProgress = -1;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05); // cap to avoid spiral on tab-switch
      const dtN = dt * 60; // normalize: 1.0 at 60fps, 2.0 at 30fps, etc.
      const elapsed = clock.getElapsedTime();
      const s = st.current;

      // Cinematic auto-play
      const cin = cinematicRef.current;
      if (cin.active) {
        const dt = cin.lastT > 0 ? elapsed - cin.lastT : 0.016;
        cin.lastT = elapsed;
        const wp = CINEMATIC_WAYPOINTS[cin.idx];
        if (wp) {
          if (cin.phase === "traveling") {
            s.target = wp.t;
            if (Math.abs(s.progress - wp.t) < 0.003) {
              cin.phase = "dwelling";
              cin.dwell = wp.duration;
            }
          } else {
            cin.dwell -= dt;
            if (cin.dwell <= 0) {
              cin.idx++;
              if (cin.idx >= CINEMATIC_WAYPOINTS.length) {
                cin.active = false;
                setCinematicActive(false);
              } else {
                cin.phase = "traveling";
              }
            }
          }
        }
      }

      s.progress += (s.target - s.progress) * (1 - Math.pow(1 - (cin.active ? 0.09 : (mob ? 0.06 : 0.04)), dtN));
      const p = clamp(s.progress, 0.001, 0.999);
      // On mobile without gyro, add gentle automatic camera sway for immersion
      if (mob && !hasGyro) {
        s.mouse.x = Math.sin(elapsed * 0.15) * 0.25 + Math.sin(elapsed * 0.08) * 0.15;
        s.mouse.y = Math.cos(elapsed * 0.12) * 0.15 + Math.sin(elapsed * 0.06) * 0.1;
      }
      s.sm.x += (s.mouse.x - s.sm.x) * (1 - Math.pow(1 - (mob ? 0.04 : 0.03), dtN));
      s.sm.y += (s.mouse.y - s.sm.y) * (1 - Math.pow(1 - (mob ? 0.04 : 0.03), dtN));
      s.speed *= Math.pow(0.94, dtN);

      const cp = camPath.getPointAt(p);
      const lp = camPath.getPointAt(Math.min(0.999, p + 0.015));

      // 3D map fade & scroll-driven camera
      const mapActive = mapActiveRef.current;
      if (mapActive && mapFadeRef.current < 1) mapFadeRef.current = Math.min(1, mapFadeRef.current + 0.03 * dtN);
      else if (!mapActive && mapFadeRef.current > 0) mapFadeRef.current = Math.max(0, mapFadeRef.current - 0.035 * dtN);
      const mf = mapFadeRef.current;

      // Smooth the map scroll
      const ms = mapScrollRef.current;
      ms.smooth += (ms.target - ms.smooth) * (1 - Math.pow(1 - 0.06, dtN));
      ms.progress = ms.smooth;

      // Camera: path-following vs map side-view
      const pathPos = new THREE.Vector3(cp.x + s.sm.x * 1.8, cp.y + s.sm.y * 1.0, cp.z);
      const pathLook = new THREE.Vector3(lp.x + s.sm.x * 0.4, lp.y + s.sm.y * 0.25, lp.z);

      if (mf > 0.001) {
        // Map camera: travel alongside the path from a side-elevated view
        const mapT = clamp(ms.progress, 0.002, 0.995);
        const mapPt = camPath.getPointAt(mapT);
        const mapLookAhead = camPath.getPointAt(Math.min(0.998, mapT + 0.03));
        // Offset: to the right and above the path
        const mapCamPos = new THREE.Vector3(
          mapPt.x + MAP_CAM_OFFSET.x + Math.sin(elapsed * 0.12) * 1.5,
          mapPt.y + MAP_CAM_OFFSET.y + Math.sin(elapsed * 0.08) * 0.8,
          mapPt.z + Math.sin(elapsed * 0.1) * 1.0
        );
        const mapCamLook = new THREE.Vector3(
          (mapPt.x + mapLookAhead.x) * 0.5,
          (mapPt.y + mapLookAhead.y) * 0.5 - 1,
          (mapPt.z + mapLookAhead.z) * 0.5
        );
        camera.position.lerpVectors(pathPos, mapCamPos, mf);
        const cLook = pathLook.clone().lerp(mapCamLook, mf);
        camera.lookAt(cLook);
      } else {
        camera.position.copy(pathPos);
        camera.lookAt(pathLook);
      }
      camera.rotation.z = (s.sm.x * 0.02 + Math.sin(elapsed * 0.15) * 0.008) * (1 - mf);

      // Animate 3D map objects
      if (mf > 0.001) {
        mapGrp.visible = true;
        // Hide planets & connection lines during map
        mapHideObjs.forEach(o => { o.visible = false; });
        mapPathMat.uniforms.uTime.value = elapsed;
        mapPathMat.uniforms.uOpacity.value = mf * 0.7;
        mapCoreMat.uniforms.uTime.value = elapsed;
        mapCoreMat.uniforms.uOpacity.value = mf * 1.0;
        const mapT = ms.progress;
        mapWpObjs.forEach((wp, i) => {
          const bt = elapsed + i * 1.2;
          // Waypoints near current scroll position are brighter
          const wpT = mapWaypoints[i].t;
          const dist = Math.abs(wpT - mapT);
          const prox = Math.max(0, 1 - dist * 5); // bright when close
          const baseOp = 0.25 + prox * 0.6;
          (wp.sprite.material as THREE.SpriteMaterial).opacity = mf * (baseOp + Math.sin(bt * 1.5) * 0.1);
          const sz = (3.5 + prox * 3.0) + Math.sin(bt * 0.8) * 0.5;
          wp.sprite.scale.set(sz, sz, 1);
          (wp.halo.material as THREE.SpriteMaterial).opacity = mf * (0.05 + prox * 0.2 + Math.sin(bt * 0.6) * 0.03);
          const hs = (8 + prox * 10) + Math.sin(bt * 0.5) * 1.5;
          wp.halo.scale.set(hs, hs, 1);
          (wp.ring.material as THREE.MeshBasicMaterial).opacity = mf * (0.03 + prox * 0.12 + Math.sin(bt * 0.7) * 0.02);
          wp.ring.rotation.z += (0.003 + i * 0.001 + prox * 0.005) * dtN;
          // Project to screen for HTML labels
          const proj = wp.pos.clone().project(camera);
          const el = mapLabelRefs.current[i];
          if (el) {
            // proj.z < 1 means in front of camera (NDC space)
            const inFront = proj.z < 1;
            const sx = (proj.x * 0.5 + 0.5) * curW;
            const sy = (-proj.y * 0.5 + 0.5) * curH;
            const onScreen = inFront && sx > -200 && sx < curW + 200 && sy > -200 && sy < curH + 200;
            el.style.transform = `translate(-50%,-50%) translate(${sx}px,${sy}px)`;
            el.style.opacity = onScreen ? String(mf * (0.3 + prox * 0.7)) : "0";
          }
        });
        // Flow particles
        (mapFlowPts.material as THREE.PointsMaterial).opacity = mf * 0.45;
        const fAttr = mapFlowPts.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < MAP_FLOW_N; i++) {
          mapFlowProg[i] += mapFlowSpd[i] * dtN;
          if (mapFlowProg[i] > 0.998) mapFlowProg[i] = 0.002;
          const pt = camPath.getPointAt(mapFlowProg[i]);
          mapFlowPos[i*3] = pt.x + Math.sin(elapsed * 2 + i) * 0.25;
          mapFlowPos[i*3+1] = pt.y + Math.cos(elapsed * 1.5 + i * 0.7) * 0.25;
          mapFlowPos[i*3+2] = pt.z + Math.sin(elapsed * 1.8 + i * 1.3) * 0.25;
        }
        fAttr.array = mapFlowPos; fAttr.needsUpdate = true;
        (mapDustPts.material as THREE.PointsMaterial).opacity = mf * 0.15;
        mapDustPts.rotation.y = elapsed * 0.008;
        // Update progress dot
        const dotEl = mapDotRef.current;
        if (dotEl) dotEl.style.top = `${ms.progress * 100}%`;
      } else {
        mapGrp.visible = false;
        mapHideObjs.forEach(o => { o.visible = true; });
        mapWpObjs.forEach((_, i) => { const el = mapLabelRefs.current[i]; if (el) el.style.opacity = "0"; });
      }

      starMat.uniforms.uTime.value = elapsed;
      stars.rotation.y = elapsed * 0.0018;
      dust.rotation.y = -elapsed * 0.0014;
      farStars.rotation.y = -elapsed * 0.001;
      farStars.rotation.x = Math.sin(elapsed * 0.03) * 0.02;

      nebs.forEach(n => { n.sp.position.y = n.by + Math.sin(elapsed * n.spd + n.off) * 1.2; });

      nodes.forEach((n, i) => {
        const bt = elapsed + i * 1.5;
        n.grp.position.y = n.bp.y + Math.sin(bt * 0.28) * 0.45;
        n.core.rotation.y += 0.0025 * n.spin * dtN;
        n.core.rotation.x = Math.sin(bt * 0.12) * 0.08;
        if (n.ring) n.ring.rotation.z += (0.0012 + n.spin * 0.0008) * dtN;
        n.motes.rotation.y = bt * 0.12;
        n.motes.rotation.x = Math.sin(bt * 0.09) * 0.08;
        n.core.scale.setScalar(1 + Math.sin(bt * 0.6) * 0.04);
        n.atmosphere.material.opacity = (0.34 + Math.sin(bt * 0.45) * 0.1) * (mob ? 1.3 : 1);
        const gs = n.haloBase * (mob ? 1.15 : 1) + Math.sin(bt * 0.36) * (n.haloBase * 0.12);
        n.atmosphere.scale.set(gs, gs, 1);
        n.haze.material.opacity = (0.13 + Math.sin(bt * 0.35) * 0.03) * (mob ? 1.3 : 1);
      });

      const skillsBandT = clamp((p - SKILLS_START) / Math.max(0.0001, EXPERIENCE_START - SKILLS_START), 0, 1);
      const skillsTravel = skillsBandT * (SKILL_CONSTELLATIONS.length - 1);
      const skillsBand = skillsBandT > 0 && skillsBandT < 1 ? Math.sin(skillsBandT * Math.PI) : 0;

      skillClusters.forEach((cluster, i) => {
        const delta = Math.abs(i - skillsTravel);
        const focus = clamp(1 - delta * 0.85, 0, 1);
        const vis = skillsBand * focus;
        cluster.grp.visible = vis > 0.01;
        if (vis <= 0.01) return;

        const bt = elapsed * (0.7 + i * 0.04);
        cluster.grp.position.x = cluster.bp.x + Math.sin(bt * 0.32 + i) * 0.42;
        cluster.grp.position.y = cluster.bp.y + Math.cos(bt * 0.46 + i * 0.52) * 0.44;
        cluster.grp.position.z = cluster.bp.z + Math.sin(bt * 0.24 + i) * 0.34;
        cluster.grp.rotation.y = Math.sin(bt * 0.18 + i) * 0.2;
        cluster.grp.rotation.x = Math.cos(bt * 0.15 + i * 0.4) * 0.08;

        const auraMat = cluster.aura.material as THREE.SpriteMaterial;
        auraMat.opacity = 0.01 + focus * 0.06 + Math.sin(bt * 0.82) * 0.01;
        const auraScale = cluster.auraBase * (1 + Math.sin(bt * 0.66) * 0.08 + focus * 0.14);
        cluster.aura.scale.set(auraScale, auraScale, 1);
        cluster.light.intensity = 0.02 + focus * 0.3 + Math.sin(bt * 1.1 + i) * 0.02;

        cluster.dust.rotation.y = bt * 0.23;
        cluster.dust.rotation.x = Math.sin(bt * 0.17) * 0.2;
        const dustMat = cluster.dust.material as THREE.PointsMaterial;
        dustMat.opacity = 0.03 + focus * 0.08;

        cluster.links.forEach((link) => {
          link.mat.opacity = focus * 0.12;
        });

        cluster.stars.forEach((star, starIdx) => {
          const wobble = bt * 0.9 + star.twinkle + starIdx * 0.12;
          star.anchor.position.x = star.base.x + Math.sin(wobble * 1.1) * star.jitter * 0.3;
          star.anchor.position.y = star.base.y + Math.cos(wobble * 0.95) * star.jitter * 0.3 * 0.8;
          star.anchor.position.z = star.base.z + Math.sin(wobble * 0.74) * star.jitter * 0.3 * 0.9;

          const sm = mob ? 1.3 : 1; // mobile scale/opacity boost
          const pulse = 0.86 + Math.sin(bt * 0.8 + star.twinkle) * 0.18 + focus * 0.34;

          // Core: tight bright point, pulses intensity
          const coreMat = star.core.material as THREE.SpriteMaterial;
          coreMat.opacity = Math.min(1, (0.5 + focus * 0.5 + Math.sin(bt * 0.9 + star.twinkle) * 0.06) * star.brightness * star.brightness * sm);
          const coreSize = (0.04 + star.brightness * 0.03) * pulse * sm;
          star.core.scale.set(coreSize, coreSize, 1);

          // Glint: diffraction spikes, scale up with focus
          const glintMat = star.glint.material as THREE.SpriteMaterial;
          glintMat.opacity = Math.min(1, (0.05 + focus * 0.14 + Math.sin(bt * 0.6 + star.twinkle) * 0.015) * sm);
          const glintSize = (0.06 + focus * 0.1 + Math.sin(bt * 0.4 + star.twinkle) * 0.01) * cluster.spread * star.brightness * sm;
          star.glint.scale.set(glintSize, glintSize, 1);

          // Halo: wide atmospheric glow
          const haloMat = star.halo.material as THREE.SpriteMaterial;
          haloMat.opacity = (0.008 + focus * 0.025 + Math.sin(bt * 0.3 + star.twinkle) * 0.004) * sm;
          const haloSize = glintSize * 2.2;
          star.halo.scale.set(haloSize, haloSize, 1);
        });
      });

      // Comet trails (experience)
      const expBandT = clamp((p - EXPERIENCE_START) / Math.max(0.0001, PROJECTS_START - EXPERIENCE_START), 0, 1);
      const expTravel = expBandT * (EXPERIENCES.length - 1);
      const expBand = expBandT > 0 && expBandT < 1 ? Math.sin(expBandT * Math.PI) : 0;

      comets.forEach((comet, i) => {
        const delta = Math.abs(i - expTravel);
        const focus = clamp(1 - delta * 0.7, 0, 1);
        const vis = expBand * focus;
        comet.grp.visible = vis > 0.01;
        if (vis <= 0.01) return;

        const bt = elapsed * (0.6 + i * 0.05);
        // Gentle orbital drift
        comet.grp.position.x = comet.bp.x + Math.sin(bt * 0.18 + i * 1.3) * 0.22;
        comet.grp.position.y = comet.bp.y + Math.cos(bt * 0.26 + i * 0.7) * 0.18;

        // Nucleus: tiny, intermittent (real nuclei are km-scale, invisible at distance)
        const ms = mob ? 1.4 : 1; // mobile scale boost
        const nMat = comet.nucleus.material as THREE.SpriteMaterial;
        nMat.opacity = (0.5 + focus * 0.3 + Math.sin(bt * 3.5) * 0.12);
        const nSize = (0.06 + focus * 0.04) * ms;
        comet.nucleus.scale.set(nSize, nSize, 1);

        // Coma: gas envelope, pulses as sublimation rate changes
        const comaMat = comet.coma.material as THREE.SpriteMaterial;
        const comaBreathing = 0.85 + Math.sin(bt * 0.8) * 0.15; // outgassing fluctuation
        comaMat.opacity = (0.15 + focus * (mob ? 0.45 : 0.32)) * comaBreathing;
        const comaSize = (0.8 + focus * 0.5 + Math.sin(bt * 0.6) * 0.12) * ms;
        comet.coma.scale.set(comaSize, comaSize, 1);

        // Outer coma: hydrogen cloud (huge, faint)
        const outerMat = comet.comaOuter.material as THREE.SpriteMaterial;
        outerMat.opacity = (0.03 + focus * 0.08 + Math.sin(bt * 0.35) * 0.01) * (mob ? 1.5 : 1);
        const outerSize = comaSize * 2.6;
        comet.comaOuter.scale.set(outerSize, outerSize, 1);

        // Ion tail: fast plasma, responds to solar wind variations
        comet.ionTailMat.uniforms.uTime.value = elapsed;
        // Ion tail disconnection events: solar wind magnetic field reversals
        const disconnectCycle = Math.sin(elapsed * 0.3 + i * 1.7);
        const disconnectEvent = disconnectCycle > 0.85 ? (1 - (disconnectCycle - 0.85) / 0.15) * 0.6 : 0;
        comet.ionTailMat.uniforms.uFocus.value = focus * (1 - disconnectEvent);

        // Dust tail: slow grain drift
        comet.dustTailMat.uniforms.uTime.value = elapsed;
        comet.dustTailMat.uniforms.uFocus.value = focus;

        // Light — coma glow
        comet.light.intensity = (0.03 + focus * 0.75 + Math.sin(bt * 1.1) * 0.05) * (mob ? 1.4 : 1);

        // Sublimation jets: emerge from nucleus, spiral outward
        const jetAttr = comet.jets.geometry.attributes.position as THREE.BufferAttribute;
        for (let j = 0; j < comet.jetPositions.length / 3; j++) {
          comet.jetPositions[j * 3] += comet.jetVelocities[j * 3] * dtN;
          comet.jetPositions[j * 3 + 1] += comet.jetVelocities[j * 3 + 1] * dtN;
          comet.jetPositions[j * 3 + 2] += comet.jetVelocities[j * 3 + 2] * dtN;
          // Coriolis spiral from nucleus rotation
          const jpx = comet.jetPositions[j * 3], jpz = comet.jetPositions[j * 3 + 2];
          comet.jetVelocities[j * 3] += -jpz * 0.0001 * dtN;
          comet.jetVelocities[j * 3 + 2] += jpx * 0.0001 * dtN;
          // Solar wind acceleration: particles accelerate in anti-sun direction
          comet.jetVelocities[j * 3] += comet.sunDir.x * -0.00003 * dtN;
          comet.jetVelocities[j * 3 + 2] += comet.sunDir.z * -0.00003 * dtN;
          const dx = comet.jetPositions[j * 3], dy = comet.jetPositions[j * 3 + 1], dz = comet.jetPositions[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz > 16) {
            comet.jetPositions[j * 3] = (Math.random() - 0.5) * 0.06;
            comet.jetPositions[j * 3 + 1] = (Math.random() - 0.5) * 0.06;
            comet.jetPositions[j * 3 + 2] = (Math.random() - 0.5) * 0.06;
            const speed = 0.003 + Math.random() * 0.005;
            const phi = Math.random() * Math.PI * 2;
            const theta = (Math.random() - 0.5) * Math.PI * 0.6;
            comet.jetVelocities[j * 3] = (-comet.sunDir.x + Math.sin(phi) * Math.cos(theta) * 0.5) * speed;
            comet.jetVelocities[j * 3 + 1] = (-comet.sunDir.y + Math.sin(theta) * 0.5) * speed;
            comet.jetVelocities[j * 3 + 2] = (-comet.sunDir.z + Math.cos(phi) * Math.cos(theta) * 0.5) * speed;
          }
        }
        jetAttr.array = comet.jetPositions;
        jetAttr.needsUpdate = true;
        (comet.jets.material as THREE.PointsMaterial).opacity = 0.08 + focus * 0.28;

        // Dust trail particles: heavier, slower drift
        const dustAttr = comet.dustParticles.geometry.attributes.position as THREE.BufferAttribute;
        for (let j = 0; j < comet.dustPositions.length / 3; j++) {
          comet.dustPositions[j * 3] += comet.dustVelocities[j * 3] * dtN;
          comet.dustPositions[j * 3 + 1] += comet.dustVelocities[j * 3 + 1] * dtN;
          comet.dustPositions[j * 3 + 2] += comet.dustVelocities[j * 3 + 2] * dtN;
          const dx = comet.dustPositions[j * 3], dy = comet.dustPositions[j * 3 + 1], dz = comet.dustPositions[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz > 25) {
            const frac = Math.random() * 0.5;
            comet.dustPositions[j * 3] = (Math.random() - 0.5) * 0.3;
            comet.dustPositions[j * 3 + 1] = (Math.random() - 0.5) * 0.3;
            comet.dustPositions[j * 3 + 2] = frac * 0.5;
            const dSpeed = 0.001 + Math.random() * 0.002;
            comet.dustVelocities[j * 3] = (-comet.sunDir.x * 0.6) * dSpeed;
            comet.dustVelocities[j * 3 + 1] = (Math.random() - 0.5) * 0.001;
            comet.dustVelocities[j * 3 + 2] = (-comet.sunDir.z * 0.6) * dSpeed;
          }
        }
        dustAttr.array = comet.dustPositions;
        dustAttr.needsUpdate = true;
        (comet.dustParticles.material as THREE.PointsMaterial).opacity = 0.06 + focus * 0.2;

        // Nucleus glint: diffraction spikes pulse
        const glintMat = comet.nucleusGlint.material as THREE.SpriteMaterial;
        glintMat.opacity = (0.08 + focus * 0.18) * (0.7 + Math.sin(bt * 2.2) * 0.3);
        const glintSize = 0.18 + focus * 0.14 + Math.sin(bt * 1.8) * 0.04;
        comet.nucleusGlint.scale.set(glintSize, glintSize, 1);

        // Sunward coma: asymmetric glow, rotates with nucleus jet precession
        const swMat = comet.sunwardComa.material as THREE.SpriteMaterial;
        swMat.opacity = (0.06 + focus * 0.14) * comaBreathing;
        const swSize = 0.7 + focus * 0.35 + Math.sin(bt * 0.5) * 0.08;
        comet.sunwardComa.scale.set(swSize, swSize, 1);
        const precAngle = bt * 0.15 + i * 2.0;
        comet.sunwardComa.position.set(
          comet.sunDir.x * 0.25 + Math.sin(precAngle) * 0.06,
          comet.sunDir.y * 0.25 + Math.cos(precAngle) * 0.06,
          comet.sunDir.z * 0.25,
        );

        // Bow shock: faint arc on sunward side
        const bsMat = comet.bowShock.material as THREE.SpriteMaterial;
        bsMat.opacity = 0.015 + focus * 0.04 + Math.sin(bt * 0.7) * 0.005;

        // Ion streamer particles: fast movement along ion tail
        const ionStrAttr = comet.ionStreamers.geometry.attributes.position as THREE.BufferAttribute;
        for (let j = 0; j < comet.ionStreamerPositions.length / 3; j++) {
          comet.ionStreamerPositions[j * 3] += comet.ionStreamerVelocities[j * 3] * dtN;
          comet.ionStreamerPositions[j * 3 + 1] += comet.ionStreamerVelocities[j * 3 + 1] * dtN;
          comet.ionStreamerPositions[j * 3 + 2] += comet.ionStreamerVelocities[j * 3 + 2] * dtN;
          comet.ionStreamerVelocities[j * 3] += comet.sunDir.x * -0.00005 * dtN;
          comet.ionStreamerVelocities[j * 3 + 2] += comet.sunDir.z * -0.00005 * dtN;
          const isx = comet.ionStreamerPositions[j * 3], isy = comet.ionStreamerPositions[j * 3 + 1], isz = comet.ionStreamerPositions[j * 3 + 2];
          if (isx * isx + isy * isy + isz * isz > 30) {
            comet.ionStreamerPositions[j * 3] = (Math.random() - 0.5) * 0.08;
            comet.ionStreamerPositions[j * 3 + 1] = (Math.random() - 0.5) * 0.08;
            comet.ionStreamerPositions[j * 3 + 2] = (Math.random() - 0.5) * 0.08;
            const iSpeed = 0.005 + Math.random() * 0.008;
            comet.ionStreamerVelocities[j * 3] = -comet.sunDir.x * iSpeed;
            comet.ionStreamerVelocities[j * 3 + 1] = -comet.sunDir.y * iSpeed + (Math.random() - 0.5) * 0.001;
            comet.ionStreamerVelocities[j * 3 + 2] = -comet.sunDir.z * iSpeed;
          }
        }
        ionStrAttr.array = comet.ionStreamerPositions;
        ionStrAttr.needsUpdate = true;
        (comet.ionStreamers.material as THREE.PointsMaterial).opacity = 0.08 + focus * 0.22;

        // Anti-tail: very faint spike toward sun
        comet.antiTailMat.uniforms.uTime.value = elapsed;
        comet.antiTailMat.uniforms.uFocus.value = focus;
      });

      // Binary star system (education)
      const eduBandT = clamp((p - EDUCATION_START) / Math.max(0.0001, SKILLS_START - EDUCATION_START), 0, 1);
      const eduBand = eduBandT > 0 && eduBandT < 1 ? Math.sin(eduBandT * Math.PI) : 0;
      const eduFocus = eduBand;
      binaryStar.grp.visible = eduBand > 0.01;
      if (eduBand > 0.01) {
        const bt = elapsed;
        // Keplerian orbit: stars orbit center of mass
        const orbitPeriod = 8.0;
        const orbitAngle = (bt / orbitPeriod) * Math.PI * 2;
        const rA = binaryStar.orbitRadius * 0.4; // primary closer to center (more massive)
        const rB = binaryStar.orbitRadius * 0.6; // companion farther
        const axA = Math.cos(orbitAngle) * rA;
        const azA = Math.sin(orbitAngle) * rA;
        const axB = -Math.cos(orbitAngle) * rB;
        const azB = -Math.sin(orbitAngle) * rB;

        // Position stars
        binaryStar.starA.position.set(axA, 0, azA);
        binaryStar.starAGlint.position.set(axA, 0, azA);
        binaryStar.starAHalo.position.set(axA, 0, azA);
        binaryStar.starB.position.set(axB, 0, azB);
        binaryStar.starBGlint.position.set(axB, 0, azB);
        binaryStar.starBHalo.position.set(axB, 0, azB);

        // Lagrange point at midpoint
        binaryStar.lagrangeGlow.position.set((axA + axB) * 0.5, 0, (azA + azB) * 0.5);

        // Pulse star opacities
        const bsm = mob ? 1.35 : 1; // mobile opacity boost
        const pulseA = (0.6 + eduFocus * 0.35 + Math.sin(bt * 2.1) * 0.1) * bsm;
        const pulseB = (0.55 + eduFocus * 0.3 + Math.sin(bt * 2.5 + 1.0) * 0.1) * bsm;
        (binaryStar.starA.material as THREE.SpriteMaterial).opacity = Math.min(1, pulseA);
        (binaryStar.starAGlint.material as THREE.SpriteMaterial).opacity = Math.min(1, (0.15 + eduFocus * 0.3 + Math.sin(bt * 1.8) * 0.08) * bsm);
        (binaryStar.starAHalo.material as THREE.SpriteMaterial).opacity = (0.04 + eduFocus * 0.1) * bsm;
        (binaryStar.starB.material as THREE.SpriteMaterial).opacity = Math.min(1, pulseB);
        (binaryStar.starBGlint.material as THREE.SpriteMaterial).opacity = Math.min(1, (0.12 + eduFocus * 0.25 + Math.sin(bt * 2.0 + 0.5) * 0.06) * bsm);
        (binaryStar.starBHalo.material as THREE.SpriteMaterial).opacity = (0.03 + eduFocus * 0.08) * bsm;

        // Lagrange glow
        (binaryStar.lagrangeGlow.material as THREE.SpriteMaterial).opacity = 0.05 + eduFocus * 0.15 + Math.sin(bt * 1.2) * 0.03;

        // Accretion disk: rotate and update uniforms
        binaryStar.accretionDisk.rotation.z += 0.003 * dtN;
        binaryStar.accretionMat.uniforms.uTime.value = elapsed;
        binaryStar.accretionMat.uniforms.uFocus.value = eduFocus;

        // Mass transfer stream
        binaryStar.massStreamMat.uniforms.uTime.value = elapsed;
        binaryStar.massStreamMat.uniforms.uFocus.value = eduFocus;

        // Drift dust particles
        binaryStar.orbitDust.rotation.y = bt * 0.15;

        // Light intensity
        binaryStar.light.intensity = (0.05 + eduFocus * 0.8 + Math.sin(bt * 0.9) * 0.05) * (mob ? 1.4 : 1);

        // Group gentle drift
        binaryStar.grp.position.x = binaryStar.bp.x + Math.sin(bt * 0.2) * 0.3;
        binaryStar.grp.position.y = binaryStar.bp.y + Math.cos(bt * 0.28) * 0.25;
      }

      compMat.uniforms.uBloomStrength.value = (mob ? 1.75 : 1.42) + skillsBand * 0.34 + expBand * 0.2 + eduBand * 0.25;

      /* ── RENDER PIPELINE ── */
      renderer.setRenderTarget(mainTarget);
      renderer.clear();
      renderer.render(scene, camera);

      threshMat.uniforms.tDiffuse.value = mainTarget.texture;
      renderer.setRenderTarget(brightTarget);
      renderer.clear();
      renderer.render(threshScene, orthoCamera);

      blurMatH.uniforms.tDiffuse.value = brightTarget.texture;
      blurMatH.uniforms.direction.value.set(1, 0);
      blurQuad.material = blurMatH;
      renderer.setRenderTarget(pingTarget);
      renderer.clear();
      renderer.render(blurScene, orthoCamera);

      blurMatV.uniforms.tDiffuse.value = pingTarget.texture;
      blurQuad.material = blurMatV;
      renderer.setRenderTarget(pongTarget);
      renderer.clear();
      renderer.render(blurScene, orthoCamera);

      blurMat2H.uniforms.tDiffuse.value = brightTarget.texture;
      blurMat2H.uniforms.direction.value.set(2, 0);
      blurQuad.material = blurMat2H;
      renderer.setRenderTarget(ping2);
      renderer.clear();
      renderer.render(blurScene, orthoCamera);

      blurMat2V.uniforms.tDiffuse.value = ping2.texture;
      blurMat2V.uniforms.direction.value.set(0, 2);
      blurQuad.material = blurMat2V;
      renderer.setRenderTarget(pong2);
      renderer.clear();
      renderer.render(blurScene, orthoCamera);

      compMat.uniforms.tScene.value = mainTarget.texture;
      compMat.uniforms.tBloom.value = pongTarget.texture;
      compMat.uniforms.tBloom2.value = pong2.texture;
      compMat.uniforms.uTime.value = elapsed;
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(compScene, orthoCamera);

      let sec = 0;
      if (p < 0.1) {
        sec = 0;
      } else if (p < EDUCATION_START) {
        sec = 1;
      } else if (p < SKILLS_START) {
        sec = 2;
      } else if (p < EXPERIENCE_START) {
        sec = 3;
      } else if (p < PROJECTS_START) {
        sec = 4;
      } else if (p < PROJECTS_END) {
        const t = (p - PROJECTS_START) / (PROJECTS_END - PROJECTS_START);
        const idx = Math.min(SOLAR_PROJECTS.length - 1, Math.floor(t * SOLAR_PROJECTS.length));
        sec = 5 + idx;
      } else {
        sec = 5 + SOLAR_PROJECTS.length;
      }
      // Only trigger React re-render when section changes or progress shifts meaningfully
      const pRound = Math.round(p * 1000);
      if (sec !== prevSec || pRound !== prevProgress) {
        prevSec = sec; prevProgress = pRound;
        setUi(prev => ({ ...prev, section: sec, progress: p }));
      }
    };

    animate();
    setTimeout(() => { setLoaderReady(true); }, 2200);
    setTimeout(() => {
      setLoading(false);
      setUi(u => ({ ...u, loaded: true }));
      setTimeout(() => { setMapShown(true); }, 200);
    }, 3600);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMM);
      if (mob) window.removeEventListener("deviceorientation", onOrientation, true);
      ct.removeEventListener("wheel", onWheel);
      ct.removeEventListener("touchstart", onTS);
      ct.removeEventListener("touchmove", onTM);
      ct.removeEventListener("touchend", onTE);

      // Dispose all scene objects: geometries, materials, textures
      const disposeMat = (m: THREE.Material) => {
        const mat = m as unknown as Record<string, unknown>;
        ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "emissiveMap",
         "displacementMap", "alphaMap", "envMap", "specularMap"].forEach(k => {
          const tex = mat[k];
          if (tex && tex instanceof THREE.Texture) tex.dispose();
        });
        m.dispose();
      };
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.Line) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(disposeMat);
          else if (obj.material) disposeMat(obj.material);
        } else if (obj instanceof THREE.Sprite) {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
      });
      // Dispose bloom pipeline (separate scenes)
      [threshScene, blurScene, compScene].forEach(s => {
        s.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
            if (obj.material) disposeMat(obj.material);
          }
        });
      });
      quadGeo.dispose();
      dotTex.dispose();
      sharedPlanetGeo.dispose();
      // Dispose cached textures
      _glowCache.forEach(t => t.dispose()); _glowCache.clear();
      _glintCache.forEach(t => t.dispose()); _glintCache.clear();

      renderer.dispose();
      [mainTarget, brightTarget, pingTarget, pongTarget, ping2, pong2].forEach(t => t.dispose());
      if (ct.contains(renderer.domElement)) ct.removeChild(renderer.domElement);
    };
  }, []);

  const dismissMap = useCallback(() => {
    if (!mapDismissed) setMapDismissed(true);
  }, [mapDismissed]);

  const toggleCinematic = useCallback(() => {
    const cin = cinematicRef.current;
    if (cin.active) {
      cin.active = false;
      setCinematicActive(false);
    } else {
      // Dismiss map if shown, start from beginning
      if (!mapDismissed) setMapDismissed(true);
      st.current.target = 0;
      st.current.progress = 0;
      cin.idx = 0;
      cin.phase = "traveling";
      cin.dwell = 0;
      cin.lastT = 0;
      cin.active = true;
      setCinematicActive(true);
    }
  }, [mapDismissed]);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) {
      // Create audio context on first click (browser autoplay policy)
      const ctx = new AudioContext();
      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);

      // Delay/reverb effect
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.42;
      const fb = ctx.createGain();
      fb.gain.value = 0.28;
      const dFilt = ctx.createBiquadFilter();
      dFilt.type = "lowpass";
      dFilt.frequency.value = 1100;
      delay.connect(dFilt);
      dFilt.connect(fb);
      fb.connect(delay);
      delay.connect(master);

      const dry = ctx.createGain();
      dry.gain.value = 0.7;
      dry.connect(master);
      const wet = ctx.createGain();
      wet.gain.value = 0.3;
      wet.connect(delay);

      // Layer 1: Deep drone — two detuned sines
      const d1 = ctx.createOscillator();
      d1.type = "sine";
      d1.frequency.value = 55;
      const d2 = ctx.createOscillator();
      d2.type = "sine";
      d2.frequency.value = 55.4;
      const dG = ctx.createGain();
      dG.gain.value = 0.22;
      d1.connect(dG);
      d2.connect(dG);
      dG.connect(dry);
      dG.connect(wet);

      // Layer 2: Warm pad — filtered triangles at fifth
      const p1 = ctx.createOscillator();
      p1.type = "triangle";
      p1.frequency.value = 110;
      const p2 = ctx.createOscillator();
      p2.type = "triangle";
      p2.frequency.value = 164.81;
      const pFilt = ctx.createBiquadFilter();
      pFilt.type = "lowpass";
      pFilt.frequency.value = 700;
      const pG = ctx.createGain();
      pG.gain.value = 0.07;
      p1.connect(pFilt);
      p2.connect(pFilt);
      pFilt.connect(pG);
      pG.connect(dry);
      pG.connect(wet);

      // Layer 3: High shimmer — sine with slow LFO tremolo
      const sh = ctx.createOscillator();
      sh.type = "sine";
      sh.frequency.value = 440;
      const sh2 = ctx.createOscillator();
      sh2.type = "sine";
      sh2.frequency.value = 659.25;
      const shG = ctx.createGain();
      shG.gain.value = 0.0;
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.07;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 0.035;
      lfo.connect(lfoG);
      lfoG.connect(shG.gain);
      sh.connect(shG);
      sh2.connect(shG);
      shG.connect(dry);
      shG.connect(wet);

      // Layer 4: Sub-bass pulse — very slow, felt not heard
      const sub = ctx.createOscillator();
      sub.type = "sine";
      sub.frequency.value = 32;
      const subG = ctx.createGain();
      subG.gain.value = 0.12;
      const subLfo = ctx.createOscillator();
      subLfo.type = "sine";
      subLfo.frequency.value = 0.04;
      const subLfoG = ctx.createGain();
      subLfoG.gain.value = 0.06;
      subLfo.connect(subLfoG);
      subLfoG.connect(subG.gain);
      sub.connect(subG);
      subG.connect(dry);

      [d1, d2, p1, p2, sh, sh2, lfo, sub, subLfo].forEach(o => o.start());
      master.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 2.5);

      audioRef.current = { ctx, master, started: true };
      setMusicPlaying(true);
    } else {
      const a = audioRef.current;
      if (musicPlaying) {
        a.master.gain.linearRampToValueAtTime(0, a.ctx.currentTime + 1.2);
        setMusicPlaying(false);
      } else {
        if (a.ctx.state === "suspended") a.ctx.resume();
        a.master.gain.linearRampToValueAtTime(0.07, a.ctx.currentTime + 1.5);
        setMusicPlaying(true);
      }
    }
  }, [musicPlaying]);

  useEffect(() => {
    mapActiveRef.current = mapShown && !mapDismissed;
  }, [mapShown, mapDismissed]);

  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      setClockTime(
        String(d.getHours()).padStart(2, "0") + ":" +
        String(d.getMinutes()).padStart(2, "0") + ":" +
        String(d.getSeconds()).padStart(2, "0")
      );
    };
    fmt();
    const iv = setInterval(fmt, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    let raf: number;
    const update = (e: MouseEvent) => {
      cursorPos.current.x = e.clientX;
      cursorPos.current.y = e.clientY;
    };
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const { x, y } = cursorPos.current;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      const trails = cursorTrails.current;
      for (let i = trails.length - 1; i > 0; i--) {
        trails[i].x += (trails[i - 1].x - trails[i].x) * (0.28 - i * 0.035);
        trails[i].y += (trails[i - 1].y - trails[i].y) * (0.28 - i * 0.035);
      }
      trails[0].x += (x - trails[0].x) * 0.35;
      trails[0].y += (y - trails[0].y) * 0.35;
      cursorTrailRefs.current.forEach((el, i) => {
        if (el) el.style.transform = `translate(${trails[i].x}px, ${trails[i].y}px)`;
      });
    };
    window.addEventListener("mousemove", update);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", update); cancelAnimationFrame(raf); };
  }, [isMobile]);

  /* ── OVERLAY OPACITIES ── */
  const p = ui.progress;
  const heroReady = ui.loaded && mapDismissed;
  const heroOp = !mapDismissed ? 0 : (p < 0.06 ? 1 : p < 0.12 ? 1 - (p - 0.06) / 0.06 : 0);
  const aboutOp = p > 0.13 && p < EDUCATION_START ? (p < 0.16 ? (p - 0.13) / 0.03 : p > (EDUCATION_START - 0.02) ? 1 - (p - (EDUCATION_START - 0.02)) / 0.02 : 1) : 0;
  const eduOp = p > EDUCATION_START && p < SKILLS_START ? (p < EDUCATION_START + 0.02 ? (p - EDUCATION_START) / 0.02 : p > SKILLS_START - 0.02 ? 1 - (p - (SKILLS_START - 0.02)) / 0.02 : 1) : 0;
  const eduSubProgress = clamp((p - EDUCATION_START) / Math.max(0.0001, SKILLS_START - EDUCATION_START), 0, 1);
  const activeEduIdx = eduSubProgress < 0.5 ? 0 : 1;
  const activeEdu = EDUCATION[activeEduIdx];
  const skillsOp = p > SKILLS_START && p < EXPERIENCE_START
    ? (p < SKILLS_START + 0.03
      ? (p - SKILLS_START) / 0.03
      : p > EXPERIENCE_START - 0.03
        ? 1 - (p - (EXPERIENCE_START - 0.03)) / 0.03
        : 1)
    : 0;
  const expSpan = (PROJECTS_START - EXPERIENCE_START) / EXPERIENCES.length;
  const expOps = EXPERIENCES.map((_, i) => {
    const base = EXPERIENCE_START + i * expSpan;
    const fi = base + expSpan * 0.18;
    const fo = base + expSpan * 0.78;
    const end = base + expSpan;
    if (p < base || p > end) return 0;
    if (p < fi) return (p - base) / (fi - base);
    if (p > fo) return 1 - (p - fo) / (end - fo);
    return 1;
  });
  const slotSpan = (PROJECTS_END - PROJECTS_START) / SOLAR_PROJECTS.length;
  const projOps = SOLAR_PROJECTS.map((_, i) => {
    const base = PROJECTS_START + i * slotSpan;
    const fi = base + slotSpan * 0.22;
    const fo = base + slotSpan * 0.76;
    const end = base + slotSpan;
    if (p < base || p > end) return 0;
    if (p < fi) return (p - base) / (fi - base);
    if (p > fo) return 1 - (p - fo) / (end - fo);
    return 1;
  });
  const contactOp = p > CONTACT_START ? Math.min(1, (p - CONTACT_START) / 0.06) : 0;
  const activeSolar = ui.section >= 5 && ui.section < 5 + SOLAR_PROJECTS.length
    ? SOLAR_PROJECTS[ui.section - 5]
    : null;
  const activeExp = ui.section === 4
    ? EXPERIENCES[Math.min(EXPERIENCES.length - 1, Math.round(clamp((p - EXPERIENCE_START) / Math.max(0.0001, PROJECTS_START - EXPERIENCE_START), 0, 1) * (EXPERIENCES.length - 1)))]
    : null;
  const skillsRange = Math.max(0.0001, EXPERIENCE_START - SKILLS_START);
  const skillsT = clamp((p - SKILLS_START) / skillsRange, 0, 1);
  const skillsSlide = skillsT * (SKILL_CONSTELLATIONS.length - 1);
  const activeSkillIdx = Math.min(SKILL_CONSTELLATIONS.length - 1, Math.round(skillsSlide));
  const activeSkill = SKILL_CONSTELLATIONS[activeSkillIdx];
  const activeSkillSignal = ui.section === 3 ? activeSkill : null;

  const S = { overlay: { position: "absolute" as const, inset: 0, zIndex: 10, display: "flex", pointerEvents: "none" as const } };

  return (
    <div className="cosmos-root" style={{ width: "100%", height: "100dvh", position: "relative", background: "#02040b", overflow: "hidden", cursor: isMobile ? "auto" : "none" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,700;0,900;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');
        @supports not (height: 100dvh) { .cosmos-root { height: 100vh !important; } }
        @keyframes pulse{0%,100%{opacity:.2}50%{opacity:.6}}
        @keyframes loaderBar{from{width:0%}to{width:100%}}
        @keyframes loaderFadeOut{0%{opacity:1}100%{opacity:0}}
        @keyframes loaderLogoFade{from{opacity:0}to{opacity:0.6}}
        @keyframes cursorRingSpin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
        @keyframes cursorPulse{0%,100%{opacity:.35;transform:translate(-50%,-50%) scale(1)}50%{opacity:.55;transform:translate(-50%,-50%) scale(1.15)}}
      `}</style>

      {/* ═══ COSMIC CURSOR ═══ */}
      {ui.loaded && !isMobile && <>
        {/* Trail ghosts */}
        {cursorTrails.current.map((_, i) => (
          <div
            key={`trail-${i}`}
            ref={el => { cursorTrailRefs.current[i] = el; }}
            style={{
              position: "fixed", top: 0, left: 0, zIndex: 9999,
              width: 4, height: 4, marginLeft: -2, marginTop: -2,
              borderRadius: "50%", pointerEvents: "none",
              background: (SECTION_COLORS[ui.section] || "#FF6B35") + String(Math.round(18 - i * 3).toString(16)).padStart(2, "0").toUpperCase(),
              boxShadow: `0 0 ${4 - i}px ${(SECTION_COLORS[ui.section] || "#FF6B35")}${String(Math.round(25 - i * 4).toString(16)).padStart(2, "0").toUpperCase()}`,
              transition: "background 0.6s ease, box-shadow 0.6s ease",
            }}
          />
        ))}
        {/* Main cursor reticle */}
        <div
          ref={cursorRef}
          style={{
            position: "fixed", top: 0, left: 0, zIndex: 9999,
            pointerEvents: "none", willChange: "transform",
          }}
        >
          {/* Center dot */}
          <div style={{
            position: "absolute", top: -2, left: -2,
            width: 4, height: 4, borderRadius: "50%",
            background: "#FFFFFF",
            boxShadow: `0 0 6px ${SECTION_COLORS[ui.section] || "#FF6B35"}90, 0 0 12px ${SECTION_COLORS[ui.section] || "#FF6B35"}40`,
            transition: "box-shadow 0.5s ease",
          }} />
          {/* Inner ring — dashed, spinning */}
          <div style={{
            position: "absolute", top: 0, left: 0,
            width: 20, height: 20,
            border: `1px dashed ${(SECTION_COLORS[ui.section] || "#FF6B35")}30`,
            borderRadius: "50%",
            animation: "cursorRingSpin 8s linear infinite",
            transition: "border-color 0.5s ease",
          }} />
          {/* Outer ring — pulsing */}
          <div style={{
            position: "absolute", top: 0, left: 0,
            width: 32, height: 32,
            border: `1px solid ${(SECTION_COLORS[ui.section] || "#FF6B35")}12`,
            borderRadius: "50%",
            animation: "cursorPulse 3s ease-in-out infinite",
            transition: "border-color 0.5s ease",
          }} />
          {/* Crosshair lines */}
          <div style={{ position: "absolute", top: -8, left: -0.5, width: 1, height: 5, background: `${(SECTION_COLORS[ui.section] || "#FF6B35")}25`, transition: "background 0.5s ease" }} />
          <div style={{ position: "absolute", bottom: -8, left: -0.5, width: 1, height: 5, background: `${(SECTION_COLORS[ui.section] || "#FF6B35")}25`, transition: "background 0.5s ease" }} />
          <div style={{ position: "absolute", left: -8, top: -0.5, width: 5, height: 1, background: `${(SECTION_COLORS[ui.section] || "#FF6B35")}25`, transition: "background 0.5s ease" }} />
          <div style={{ position: "absolute", right: -8, top: -0.5, width: 5, height: 1, background: `${(SECTION_COLORS[ui.section] || "#FF6B35")}25`, transition: "background 0.5s ease" }} />
        </div>
      </>}

      <div ref={mountRef} style={{ position: "absolute", inset: 0, zIndex: 1 }} />

      {/* ═══ LOADER ═══ */}
      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 30, background: "#02040b",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          animation: "loaderFadeOut 0.8s cubic-bezier(.16,1,.3,1) 2.8s forwards",
        }}>
          <div style={{
            fontFamily: "'Bodoni Moda',serif", fontSize: 32, fontWeight: 900,
            color: "rgba(255,255,255,.6)",
            animation: "loaderLogoFade 0.6s ease forwards",
          }}>A.</div>
          <div style={{
            width: 120, height: 1, background: "rgba(255,255,255,.06)",
            marginTop: 24, borderRadius: 1, overflow: "hidden",
          }}>
            <div style={{
              height: "100%", background: "linear-gradient(90deg,#FF6B35,#00E5A0)",
              animation: "loaderBar 2.5s cubic-bezier(.16,1,.3,1) forwards",
              borderRadius: 1,
            }} />
          </div>
          <div style={{
            fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: ".2em",
            color: "rgba(255,255,255,.12)", marginTop: 14,
            transition: "opacity 0.3s ease",
          }}>{loaderReady ? "ready" : "initializing cosmos..."}</div>
        </div>
      )}

      {/* ═══ 3D MAP LABELS (projected from Three.js scene) ═══ */}
      {mapShown && (
        <div style={{ position: "absolute", inset: 0, zIndex: 12, pointerEvents: "none" }}>
          {[
            { label: "Origin", sanskrit: "उत्पत्ति", color: "#FF6B35", desc: "where it begins", t: 0 },
            { label: "Pathways", sanskrit: "मार्ग", color: "#B0A0FF", desc: "education & learning", t: EDUCATION_START },
            { label: "Stack", sanskrit: "विद्या", color: "#00E5A0", desc: "tools & craft", t: SKILLS_START },
            { label: "Voyage", sanskrit: "यात्रा", color: "#B88CFF", desc: "paths traveled", t: EXPERIENCE_START },
            { label: "Worlds", sanskrit: "ग्रह", color: "#D7AA6B", desc: "worlds built", t: PROJECTS_START },
            { label: "Signal", sanskrit: "संकेत", color: "#FF6B35", desc: "reach out", t: CONTACT_START },
          ].map((wp, idx) => (
            <div
              key={wp.label}
              ref={el => { mapLabelRefs.current[idx] = el; }}
              style={{
                position: "absolute", top: 0, left: 0,
                opacity: 0, transition: "opacity 0.4s ease",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                textShadow: `0 0 24px ${wp.color}, 0 0 48px ${wp.color}80, 0 2px 12px rgba(0,0,0,0.9)`,
                pointerEvents: mapDismissed ? "none" : "auto", cursor: "pointer",
              }}
              onClick={() => { st.current.target = wp.t; dismissMap(); }}
            >
              <span style={{
                fontFamily: "'Cormorant Garamond',serif", fontSize: isMobile ? 16 : 22, fontWeight: 300,
                color: wp.color, opacity: 0.7,
              }}>{wp.sanskrit}</span>
              <span style={{
                fontFamily: "'DM Mono',monospace", fontSize: isMobile ? 10 : 13, letterSpacing: ".22em",
                textTransform: "uppercase", color: "#FFFFFF",
              }}>{wp.label}</span>
              {!isMobile && <span style={{
                fontFamily: "'Cormorant Garamond',serif", fontSize: 12, fontStyle: "italic",
                color: "rgba(255,255,255,.55)",
              }}>{wp.desc}</span>}
            </div>
          ))}

          {!mapDismissed && (<>
            {/* Scroll hint at bottom center */}
            <div style={{
              position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
              opacity: mapShown ? 1 : 0, transition: "opacity 0.8s ease",
              pointerEvents: "auto",
            }}>
              <div style={{
                fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: ".25em",
                textTransform: "uppercase", color: "rgba(255,255,255,.12)",
              }}>{isMobile ? "tap a waypoint or begin" : "scroll to explore the flight path"}</div>
              <button
                onClick={dismissMap}
                style={{
                  background: "none", border: "1px solid rgba(255,107,53,.2)",
                  borderRadius: 24, padding: isMobile ? "14px 36px" : "10px 28px", cursor: "pointer",
                  fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic",
                  fontSize: isMobile ? 16 : 14, color: "rgba(255,255,255,.5)", letterSpacing: ".08em",
                  transition: "all .4s ease", backdropFilter: "blur(4px)",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,107,53,.5)"; e.currentTarget.style.color = "rgba(255,255,255,.8)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,107,53,.2)"; e.currentTarget.style.color = "rgba(255,255,255,.5)"; }}
              >begin voyage</button>
            </div>
            {/* Vertical progress rail on right edge */}
            <div style={{
              position: "absolute", right: 20, top: "15%", height: "70%",
              width: 2, background: "rgba(255,255,255,.04)", borderRadius: 1,
              pointerEvents: "none",
            }}>
              <div ref={mapDotRef} style={{
                position: "absolute", left: "50%", transform: "translateX(-50%)",
                width: 6, height: 6, borderRadius: "50%",
                background: "#FF6B35", boxShadow: "0 0 8px #FF6B3580",
                top: "0%",
              }} />
            </div>
          </>)}
        </div>
      )}

      {/* ═══ HERO ═══ */}
      {heroOp > 0.01 && <div style={{ ...S.overlay, flexDirection: "column", justifyContent: "center", alignItems: "center", opacity: heroOp, padding: isMobile ? "0 16px" : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 14, marginBottom: isMobile ? 16 : 24, opacity: heroReady ? 1 : 0, transition: "opacity .8s ease .3s" }}>
          <div style={{ width: isMobile ? 20 : 36, height: 1, background: "linear-gradient(90deg,transparent,#FF6B35)" }} />
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: isMobile ? 8 : 10, letterSpacing: ".25em", textTransform: "uppercase", color: "rgba(255,255,255,.3)", textAlign: "center" }}>Fullstack Developer · Builder · Seeker</span>
          <div style={{ width: isMobile ? 20 : 36, height: 1, background: "linear-gradient(90deg,#FF6B35,transparent)" }} />
        </div>
        <h1 style={{ fontFamily: "'Bodoni Moda',serif", fontWeight: 900, fontSize: isMobile ? "min(16vw,72px)" : "min(13vw,130px)", lineHeight: .9, letterSpacing: "-.04em", textAlign: "center", color: "#fff", textShadow: "0 0 80px rgba(255,107,53,.15), 0 0 160px rgba(255,107,53,.06)", opacity: heroReady ? 1 : 0, transform: heroReady ? "translateY(0)" : "translateY(50px)", transition: "all 1s cubic-bezier(.16,1,.3,1) .15s" }}>Atharva</h1>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: isMobile ? "min(4.5vw,18px)" : "min(3.5vw,24px)", color: "rgba(255,255,255,.25)", marginTop: isMobile ? 10 : 16, opacity: heroReady ? 1 : 0, transition: "opacity 1s ease .5s" }}>crafting intelligent systems</p>
        <div style={{ position: "absolute", bottom: isMobile ? 60 : 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: heroReady ? 1 : 0, transition: "opacity 1s ease 1s" }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(255,255,255,.13)" }}>{isMobile ? "Swipe to fly" : "Scroll to fly"}</span>
          <div style={{ width: 1, height: 28, background: "linear-gradient(to bottom,rgba(255,107,53,.35),transparent)", animation: "pulse 2s ease-in-out infinite" }} />
        </div>
      </div>}

      {/* ═══ ABOUT ═══ */}
      {aboutOp > 0.01 && <div style={{ ...S.overlay, alignItems: "center", justifyContent: "center", opacity: aboutOp }}>
        <div style={{ maxWidth: 520, padding: isMobile ? "0 20px" : "0 28px", transform: `translateY(${(1 - aboutOp) * 25}px)` }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#FF6B35", marginBottom: 20, opacity: .7 }}>[SYS.ABOUT]</div>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "min(3.2vw,24px)", fontWeight: 400, lineHeight: 1.65, color: "rgba(255,255,255,.72)" }}>
            I build software that carries a philosophy within it. Currently at{" "}
            <span style={{ color: "#FF6B35", borderBottom: "1px solid #FF6B3540" }}>Rimo</span>, building transcription & summary services — and{" "}
            <span style={{ color: "#00E5A0", borderBottom: "1px solid #00E5A040" }}>Ritam</span>, an LLM cost management platform.
          </p>
        </div>
      </div>}

      {/* ═══ EDUCATION ═══ */}
      {eduOp > 0.01 && <div style={{ ...S.overlay, alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", opacity: eduOp, padding: isMobile ? "0 20px" : "0 6%" }}>
        <div style={{ maxWidth: isMobile ? "100%" : 460, transform: isMobile ? `translateY(${(1 - eduOp) * 25}px)` : `translateX(${(1 - eduOp) * -35}px)` }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#B0A0FF", marginBottom: 14, opacity: .7 }}>[SYS.PATHWAYS]</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "min(6vw,42px)", fontWeight: 300, color: activeEdu.color, opacity: .2, lineHeight: 1, marginBottom: 4 }}>
            {activeEdu.sanskrit}
          </div>
          <h2 style={{
            fontFamily: "'Bodoni Moda',serif", fontWeight: 700,
            fontSize: "min(6vw,46px)", color: "#fff", lineHeight: 1.1,
            letterSpacing: "-.02em", marginBottom: 6,
            textShadow: `0 0 40px ${activeEdu.color}28`,
          }}>{activeEdu.institution}</h2>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: ".04em", color: activeEdu.color, opacity: .85, marginBottom: 4 }}>{activeEdu.path}</p>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".08em", color: "rgba(255,255,255,.3)", marginBottom: 14 }}>{activeEdu.timeframe}</p>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,.46)", marginBottom: 14 }}>{activeEdu.desc}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {activeEdu.highlights.map(h => (
              <span key={h} style={{
                padding: "3px 10px", borderRadius: 2,
                border: `1px solid ${activeEdu.color}30`,
                fontFamily: "'DM Mono',monospace", fontSize: 10,
                color: activeEdu.color + "CC",
              }}>{h}</span>
            ))}
          </div>
          <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".08em", color: activeEdu.color, opacity: .72 }}>
            [binary system · {activeEdu.starType} orbit · {activeEduIdx + 1}/{EDUCATION.length}]
          </p>
        </div>
      </div>}

      {/* ═══ SKILLS ═══ */}
      {skillsOp > 0.01 && SKILLS_LAYOUT_MODE === "atlas" && <div style={{ ...S.overlay, alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", opacity: skillsOp, padding: isMobile ? "0 20px" : "0 6%" }}>
          <div style={{ maxWidth: isMobile ? "100%" : 460, transform: isMobile ? `translateY(${(1 - skillsOp) * 25}px)` : `translateX(${(1 - skillsOp) * -35}px)` }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "min(6vw,42px)", fontWeight: 300, color: activeSkill.color, opacity: .2, lineHeight: 1, marginBottom: 4 }}>
              {activeSkill.sanskrit}
            </div>
            <div style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 10,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: activeSkill.color,
              opacity: .7,
              marginBottom: 10,
            }}>
              {activeSkill.sanskrit} · {activeSkill.philosophy}
            </div>
            <h3 style={{
              fontFamily: "'Bodoni Moda',serif",
              fontWeight: 700,
              fontSize: "min(6vw,46px)",
              color: "#fff",
              lineHeight: 1.1,
              letterSpacing: "-.02em",
              marginBottom: 14,
              textShadow: `0 0 40px ${activeSkill.color}28`,
            }}>
              {activeSkill.title}
            </h3>
            <p style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 16,
              lineHeight: 1.75,
              color: "rgba(255,255,255,.46)",
              marginBottom: 14,
            }}>
              {activeSkill.summary}
            </p>
            <p style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 10,
              letterSpacing: ".08em",
              color: activeSkill.color,
              opacity: .72,
              marginBottom: 18,
            }}>
              [{activeSkill.philosophy} · {activeSkillIdx + 1}/{SKILL_CONSTELLATIONS.length}]
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {activeSkill.nodes.map((node) => (
                <span key={`${activeSkill.key}-${node.label}`} style={{
                  padding: "3px 10px",
                  borderRadius: 2,
                  border: `1px solid ${activeSkill.color}30`,
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10,
                  color: activeSkill.color + "CC",
                }}>{node.label}</span>
              ))}
            </div>
          </div>
      </div>}

      {skillsOp > 0.01 && SKILLS_LAYOUT_MODE === "classic" && <div style={{ ...S.overlay, alignItems: "center", justifyContent: "center", opacity: skillsOp }}>
        <div style={{ maxWidth: 780, width: "100%", padding: "0 28px", transform: `translateY(${(1 - skillsOp) * 22}px)` }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "#00E5A0", marginBottom: 18, opacity: .8 }}>[SYS.STACK]</div>
          <h3 style={{ fontFamily: "'Bodoni Moda',serif", fontWeight: 700, fontSize: "min(5vw,40px)", lineHeight: 1.15, letterSpacing: "-.02em", color: "rgba(255,255,255,.94)", marginBottom: 14 }}>
            Skills Constellation
          </h3>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "min(2.7vw,20px)", lineHeight: 1.6, color: "rgba(255,255,255,.55)", marginBottom: 20 }}>
            Core tools I use across product engineering, AI systems, and platform work.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SKILLS.map((s) => (
              <span key={s} style={{
                padding: "6px 12px",
                borderRadius: 3,
                border: "1px solid rgba(0,229,160,.38)",
                background: "linear-gradient(180deg,rgba(0,229,160,.11),rgba(0,229,160,.03))",
                fontFamily: "'DM Mono',monospace",
                fontSize: 11,
                letterSpacing: ".02em",
                color: "rgba(208,255,242,.96)",
              }}>{s}</span>
            ))}
          </div>
        </div>
      </div>}

      {/* ═══ EXPERIENCE ═══ */}
      {EXPERIENCES.map((exp, i) => {
        if (expOps[i] <= 0.01) return null;
        return (
          <div key={`exp-${exp.company}`} style={{ ...S.overlay, alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", opacity: expOps[i], padding: isMobile ? "0 20px" : "0 6%" }}>
            <div style={{ maxWidth: isMobile ? "100%" : 460, transform: isMobile ? `translateY(${(1 - expOps[i]) * 25}px)` : `translateX(${(1 - expOps[i]) * -35}px)` }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: exp.color, opacity: .7, marginBottom: 10 }}>
                {exp.timeframe}{exp.ongoing ? " · in flight" : ""}
              </div>
              <h2 style={{ fontFamily: "'Bodoni Moda',serif", fontWeight: 700, fontSize: "min(6vw,46px)", color: "#fff", lineHeight: 1.1, letterSpacing: "-.02em", marginBottom: 6, textShadow: `0 0 40px ${exp.color}28` }}>{exp.company}</h2>
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: ".04em", color: exp.color, opacity: .85, marginBottom: 14 }}>{exp.role}</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,.46)", marginBottom: 14 }}>{exp.summary}</p>
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".08em", color: exp.color, opacity: .72 }}>
                [{exp.ongoing ? "ongoing trajectory" : "completed orbit"} · {i + 1}/{EXPERIENCES.length}]
              </p>
            </div>
          </div>
        );
      })}

      {/* ═══ PROJECTS ═══ */}
      {SOLAR_PROJECTS.map((slot, i) => {
        if (projOps[i] <= 0.01) return null;
        const proj = slot.project;
        return (
          <div key={`${slot.planet.key}-${proj.title}`} style={{ ...S.overlay, alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", opacity: projOps[i], padding: isMobile ? "0 20px" : "0 6%" }}>
            <div style={{ maxWidth: isMobile ? "100%" : 460, transform: isMobile ? `translateY(${(1 - projOps[i]) * 25}px)` : `translateX(${(1 - projOps[i]) * -35}px)` }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "min(6vw,42px)", fontWeight: 300, color: slot.color, opacity: .2, lineHeight: 1, marginBottom: 4 }}>{proj.glyph}</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: slot.color, opacity: .7, marginBottom: 10 }}>
                {slot.planet.label} · {slot.planet.sanskrit} · {proj.sub}
              </div>
              <h2 style={{ fontFamily: "'Bodoni Moda',serif", fontWeight: 700, fontSize: "min(6vw,46px)", color: "#fff", lineHeight: 1.1, letterSpacing: "-.02em", marginBottom: 12, textShadow: `0 0 40px ${slot.color}28` }}>{proj.title}</h2>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,.46)", marginBottom: 12 }}>{proj.desc}</p>
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".08em", color: slot.color, opacity: .72, marginBottom: 16 }}>
                [{slot.planet.philosophy}{slot.isPlaceholder ? " · placeholder orbit" : ""}]
              </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {proj.tech.map(t => <span key={t} style={{ padding: "3px 10px", borderRadius: 2, border: `1px solid ${slot.color}30`, fontFamily: "'DM Mono',monospace", fontSize: 10, color: slot.color + "CC" }}>{t}</span>)}
            </div>
          </div>
        </div>
        );
      })}

      {/* ═══ CONTACT ═══ */}
      {contactOp > 0.01 && <div style={{ ...S.overlay, flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: contactOp > .5 ? "auto" : "none", opacity: contactOp, padding: isMobile ? "0 20px" : 0 }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: isMobile ? 9 : 10, letterSpacing: ".3em", textTransform: "uppercase", color: "rgba(255,255,255,.18)", marginBottom: 20 }}>[SIGNAL.TRANSMIT]</div>
        <h2 style={{ fontFamily: "'Bodoni Moda',serif", fontWeight: 700, fontSize: isMobile ? "min(8vw,36px)" : "min(6vw,50px)", textAlign: "center", lineHeight: 1.15, marginBottom: 14, background: "linear-gradient(135deg,#FF6B35,#FFD93D,#00E5A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Let&#39;s build something<br />extraordinary</h2>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: isMobile ? 14 : 16, color: "rgba(255,255,255,.22)", marginBottom: 32, textAlign: "center" }}>Open to conversations about AI, infrastructure & ambitious projects</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {["GitHub ↗", "Twitter ↗", "Email →"].map(l => (
            <a key={l} href="#" onClick={e => e.preventDefault()} style={{ padding: "9px 20px", borderRadius: 2, border: "1px solid rgba(255,255,255,.08)", fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(255,255,255,.4)", textDecoration: "none", transition: "all .3s ease" }}
              onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "#FF6B35"; (e.target as HTMLElement).style.color = "#FF6B35"; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,.08)"; (e.target as HTMLElement).style.color = "rgba(255,255,255,.4)"; }}
            >{l}</a>
          ))}
        </div>
      </div>}

      {/* ═══ FIXED UI ═══ */}
      <div style={{ position: "absolute", top: isMobile ? 14 : 20, left: isMobile ? 14 : 22, zIndex: 20, fontFamily: "'Bodoni Moda',serif", fontSize: isMobile ? 15 : 17, fontWeight: 700, color: "rgba(255,255,255,.4)", opacity: ui.loaded ? 1 : 0, transition: "opacity .8s ease .3s" }}>A.</div>

      {/* Mini-map toggle */}
      <div
        onClick={(e) => { e.stopPropagation(); setMiniMapOpen(!miniMapOpen); }}
        style={{
          position: "absolute", top: isMobile ? 10 : 20, left: isMobile ? 40 : 52, zIndex: 20,
          fontFamily: "'DM Mono',monospace", fontSize: 13,
          color: miniMapOpen ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.2)",
          cursor: "pointer", pointerEvents: "auto",
          opacity: ui.loaded ? 1 : 0, transition: "opacity .8s ease .3s, color .3s ease",
          padding: isMobile ? 8 : 0,
        }}
      ><svg width={isMobile ? 18 : 14} height={isMobile ? 18 : 14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 3.5L5 1.5L9 3.5L13 1.5V10.5L9 12.5L5 10.5L1 12.5V3.5Z" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round"/><line x1="5" y1="1.5" x2="5" y2="10.5" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/><line x1="9" y1="3.5" x2="9" y2="12.5" stroke="currentColor" strokeWidth="0.7" opacity="0.4"/></svg></div>

      {/* Cinematic mode toggle */}
      <div
        onClick={(e) => { e.stopPropagation(); toggleCinematic(); }}
        style={{
          position: "absolute", top: isMobile ? 10 : 20, left: isMobile ? 74 : 74, zIndex: 20,
          color: cinematicActive ? "#FF6B35" : "rgba(255,255,255,.2)",
          cursor: "pointer", pointerEvents: "auto",
          opacity: ui.loaded ? 1 : 0, transition: "opacity .8s ease .3s, color .3s ease",
          padding: isMobile ? 8 : 0,
        }}
        title={cinematicActive ? "Stop cinematic" : "Cinematic mode"}
      ><svg width={isMobile ? 18 : 14} height={isMobile ? 18 : 14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">{cinematicActive ? <><rect x="3" y="2" width="3" height="10" rx="0.5" fill="currentColor"/><rect x="8" y="2" width="3" height="10" rx="0.5" fill="currentColor"/></> : <path d="M3 1.5L12 7L3 12.5V1.5Z" fill="currentColor"/>}</svg></div>

      {/* Music toggle */}
      <div
        onClick={(e) => { e.stopPropagation(); toggleMusic(); }}
        style={{
          position: "absolute", top: isMobile ? 10 : 20, left: isMobile ? 108 : 96, zIndex: 20,
          color: musicPlaying ? "#00E5A0" : "rgba(255,255,255,.2)",
          cursor: "pointer", pointerEvents: "auto",
          opacity: ui.loaded ? 1 : 0, transition: "opacity .8s ease .3s, color .3s ease",
          padding: isMobile ? 8 : 0,
        }}
        title={musicPlaying ? "Mute" : "Play ambient music"}
      ><svg width={isMobile ? 18 : 14} height={isMobile ? 18 : 14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">{musicPlaying ? <><path d="M1 5H3L6 2V12L3 9H1V5Z" fill="currentColor"/><path d="M9 4.5C10.2 5.3 10.8 6.5 10.8 7C10.8 7.5 10.2 8.7 9 9.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/><path d="M10.5 2.8C12.3 4 13.2 5.8 13.2 7C13.2 8.2 12.3 10 10.5 11.2" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/></> : <><path d="M1 5H3L6 2V12L3 9H1V5Z" fill="currentColor" opacity="0.5"/><line x1="9" y1="4" x2="13" y2="10" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/><line x1="13" y1="4" x2="9" y2="10" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/></>}</svg></div>

      {/* Cinematic mode overlay bar */}
      {cinematicActive && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 19, height: 2,
          background: "rgba(255,255,255,.03)",
        }}>
          <div style={{
            height: "100%", background: "linear-gradient(90deg, #FF6B35, #00E5A0)",
            width: `${(cinematicRef.current.idx / Math.max(1, CINEMATIC_WAYPOINTS.length - 1)) * 100}%`,
            transition: "width 0.8s ease",
          }} />
        </div>
      )}

      {miniMapOpen && (
        <>
          <div
            onClick={() => setMiniMapOpen(false)}
            style={{ position: "absolute", inset: 0, zIndex: 20 }}
          />
          <div style={{
            position: "absolute", top: isMobile ? 50 : 40, left: isMobile ? 14 : 22, zIndex: 21,
            background: "rgba(2,4,11,.88)", border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 4, padding: isMobile ? "12px 16px" : "10px 14px", maxWidth: 180,
            backdropFilter: "blur(8px)", pointerEvents: "auto",
          }}>
            {[
              { name: "ORIGIN", t: 0, color: "#FF6B35" },
              { name: "ABOUT", t: 0.14, color: "#FF6B35" },
              { name: "PATHWAYS", t: 0.20, color: "#B0A0FF" },
              { name: "STACK", t: 0.26, color: "#00E5A0" },
              { name: "VOYAGE", t: 0.40, color: "#B88CFF" },
              { name: "PROJECTS", t: 0.54, color: "#D7AA6B" },
              { name: "SIGNAL", t: 0.90, color: "#FF6B35" },
            ].map((sec) => {
              const isActive =
                (sec.name === "ORIGIN" && ui.section === 0) ||
                (sec.name === "ABOUT" && ui.section === 1) ||
                (sec.name === "PATHWAYS" && ui.section === 2) ||
                (sec.name === "STACK" && ui.section === 3) ||
                (sec.name === "VOYAGE" && ui.section === 4) ||
                (sec.name === "PROJECTS" && ui.section >= 5 && ui.section < 5 + SOLAR_PROJECTS.length) ||
                (sec.name === "SIGNAL" && ui.section === 5 + SOLAR_PROJECTS.length);
              return (
                <div
                  key={sec.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    st.current.target = sec.t;
                    setMiniMapOpen(false);
                  }}
                  style={{
                    fontFamily: "'DM Mono',monospace", fontSize: isMobile ? 12 : 10, letterSpacing: ".12em",
                    color: isActive ? sec.color : "rgba(255,255,255,.3)",
                    padding: isMobile ? "8px 0" : "5px 0", cursor: "pointer",
                    borderLeft: `2px solid ${isActive ? sec.color : "transparent"}`,
                    paddingLeft: 8,
                    transition: "color .2s ease, border-color .2s ease",
                  }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = sec.color; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.3)"; }}
                >{sec.name}</div>
              );
            })}
          </div>
        </>
      )}

      {/* Progress */}
      <div style={{ position: "absolute", right: isMobile ? 10 : 18, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 2, height: isMobile ? 60 : 90, background: "rgba(255,255,255,.03)", borderRadius: 1, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: `${p * 100}%`, background: "linear-gradient(to bottom,#FF6B35,#00E5A0)", borderRadius: 1 }} />
        </div>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "rgba(255,255,255,.1)", marginTop: 5 }}>{Math.round(p * 100)}%</span>
      </div>

      <div style={{ position: "absolute", bottom: isMobile ? 14 : 18, left: isMobile ? 14 : 22, zIndex: 20, fontFamily: "'DM Mono',monospace", fontSize: isMobile ? 8 : 9, letterSpacing: ".12em", color: "rgba(255,255,255,.08)" }}>[ {SECTIONS[ui.section]} ]</div>

      {ui.loaded && !isMobile && (
        <div style={{ position: "absolute", bottom: 6, left: 22, zIndex: 20, fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: ".1em", display: "flex", gap: 6 }}>
          <span style={{ color: "rgba(255,255,255,.06)" }}>LOCAL.SOL</span>
          <span style={{ color: "rgba(255,255,255,.08)" }}>{clockTime}</span>
        </div>
      )}

      <div style={{ position: "absolute", left: "50%", bottom: isMobile ? 10 : 16, transform: "translateX(-50%)", zIndex: 20, display: "flex", gap: isMobile ? 3 : 5 }}>
        {SECTIONS.map((_, i) => <div key={i} style={{ width: ui.section === i ? (isMobile ? 10 : 14) : (isMobile ? 3 : 4), height: 3, borderRadius: 2, transition: "all .4s cubic-bezier(.16,1,.3,1)", background: ui.section === i ? "linear-gradient(90deg,#FF6B35,#00E5A0)" : "rgba(255,255,255,.05)" }} />)}
      </div>

      <div style={{ position: "absolute", bottom: isMobile ? 14 : 18, right: isMobile ? 14 : 40, zIndex: 20, fontFamily: "'Cormorant Garamond',serif", fontSize: isMobile ? 10 : 13, fontStyle: "italic", color: activeSolar ? `${activeSolar.color}90` : activeExp ? `${activeExp.color}A6` : activeSkillSignal ? `${activeSkillSignal.color}A6` : (ui.section === 2 && activeEdu) ? `${activeEdu.color}A6` : "rgba(255,255,255,.08)", maxWidth: isMobile ? "40%" : "none", textAlign: "right" }}>
        {activeSolar
          ? `${activeSolar.planet.sanskrit} · ${activeSolar.planet.philosophy}`
          : activeExp
            ? `${activeExp.company} · ${activeExp.ongoing ? "in flight" : "orbit complete"}`
            : activeSkillSignal
              ? `${activeSkillSignal.sanskrit} · ${activeSkillSignal.philosophy} · ${activeSkillIdx + 1}/${SKILL_CONSTELLATIONS.length}`
              : (ui.section === 2 && activeEdu)
                ? `${activeEdu.sanskrit} · ${activeEdu.starType} star · ${activeEduIdx + 1}/${EDUCATION.length}`
                : "ऋतम्"}
      </div>

      {/* ═══ CHAT TRIGGER — 3D Cosmic Orb ═══ */}
      {(() => {
        const ac = SECTION_COLORS[ui.section] || "#FF6B35";
        const h = orbHovered;
        return (
          <div
            className="chat-orb-wrap"
            onMouseEnter={() => setOrbHovered(true)}
            onMouseLeave={() => setOrbHovered(false)}
            onClick={() => setChatOpen(true)}
            style={{
              position: "absolute", top: isMobile ? 10 : 18, right: isMobile ? 10 : 22, zIndex: 20,
              display: "flex", alignItems: "center", gap: isMobile ? 6 : 10,
              opacity: ui.loaded ? 1 : 0, transition: "opacity .8s ease .3s",
              cursor: "pointer",
            }}
          >
            <span style={{
              fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: ".15em",
              textTransform: "uppercase",
              color: h ? ac : `${ac}90`,
              textShadow: h ? `0 0 14px ${ac}70, 0 0 30px ${ac}30` : `0 0 10px ${ac}35, 0 0 20px ${ac}15`,
              transition: "color 0.4s ease, text-shadow 0.4s ease",
            }}>ask ai</span>

            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              position: "relative", perspective: "120px",
            }}>
              {/* Wide ambient halo */}
              <span style={{
                position: "absolute", inset: -18, borderRadius: "50%",
                background: `radial-gradient(circle, ${h ? ac + "28" : ac + "15"} 0%, ${h ? ac + "08" : ac + "04"} 50%, transparent 72%)`,
                animation: "orbPulse 4s ease-in-out infinite",
                transition: "background 0.4s ease",
              }} />

              {/* 3D orbit ring 1 */}
              <span style={{
                position: "absolute", inset: -5, borderRadius: "50%",
                border: `1px solid ${h ? ac + "60" : ac + "30"}`,
                borderRightColor: "transparent", borderBottomColor: "transparent",
                transformStyle: "preserve-3d",
                animation: `orbRing1 ${h ? "2.5s" : "6s"} linear infinite`,
                transition: "border-color 0.4s ease",
              }} />

              {/* 3D orbit ring 2 */}
              <span style={{
                position: "absolute", inset: -1, borderRadius: "50%",
                border: `1px solid ${h ? ac + "20" : ac + "0C"}`,
                borderTopColor: "transparent", borderLeftColor: "transparent",
                transformStyle: "preserve-3d",
                animation: `orbRing2 ${h ? "4s" : "9s"} linear infinite`,
                transition: "border-color 0.4s ease",
              }} />

              {/* Glass sphere */}
              <span style={{
                position: "absolute", inset: 3, borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.1) 0%, ${ac}15 35%, rgba(0,0,4,0.25) 100%)`,
                border: `1px solid ${h ? ac + "50" : ac + "18"}`,
                boxShadow: h
                  ? `0 0 30px ${ac}50, 0 0 70px ${ac}20, inset 0 0 22px ${ac}20`
                  : `0 0 20px ${ac}25, 0 0 50px ${ac}0C, inset 0 0 15px ${ac}0C`,
                backdropFilter: "blur(4px)",
                overflow: "hidden",
                transition: "box-shadow 0.4s ease, border-color 0.4s ease, background 0.6s ease",
              }}>
                {/* Surface sheen */}
                <span style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: `linear-gradient(105deg, transparent 15%, ${ac}22 32%, ${ac}18 42%, transparent 55%, transparent 68%, rgba(255,255,255,0.05) 78%, transparent 90%)`,
                  backgroundSize: "250% 100%",
                  animation: "orbSheen 5s ease-in-out infinite",
                }} />
              </span>

              {/* Inner ember — the bright core */}
              <span style={{
                position: "absolute", inset: 8, borderRadius: "50%",
                background: `radial-gradient(circle at 45% 42%, ${h ? ac + "90" : ac + "60"} 0%, ${h ? ac + "25" : ac + "15"} 50%, transparent 100%)`,
                animation: "orbEmber 4s ease-in-out infinite",
                transition: "background 0.4s ease",
              }} />

              {/* Specular highlight */}
              <span style={{
                position: "absolute", top: 6, left: 9, width: 11, height: 6, borderRadius: "50%",
                background: `radial-gradient(ellipse, rgba(255,255,255,${h ? "0.25" : "0.18"}) 0%, transparent 100%)`,
                transform: "rotate(-25deg)", pointerEvents: "none",
                transition: "background 0.4s ease",
              }} />

              {/* Rim light */}
              <span style={{
                position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)",
                width: 18, height: 4, borderRadius: "50%",
                background: `radial-gradient(ellipse, ${h ? ac + "40" : ac + "25"} 0%, transparent 100%)`,
                pointerEvents: "none", transition: "background 0.4s ease",
              }} />
            </div>
          </div>
        );
      })()}

      {/* ═══ CHAT PANEL ═══ */}
      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} onOpen={() => setChatOpen(true)} accentColor={SECTION_COLORS[ui.section] || "#FF6B35"} />
    </div>
  );
}
