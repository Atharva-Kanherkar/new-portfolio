# Cinematic Cosmos Portfolio — Build Skill

## Overview

This skill guides the creation of **Atharva's portfolio website** — an immersive 3D cosmos experience where visitors fly through a particle universe via scroll, encountering glowing celestial project nodes along a cinematic camera path. It is NOT a traditional webpage with sections. It is a **spatial experience** rendered in WebGL with HTML overlays synced to camera position.

The definitive reference artifact is `cinematic-cosmos.jsx`. All work should extend, refine, or port that file. Never regress from its visual quality.

---

## Identity & Content

### Who
- **Name:** Atharva
- **Role:** Fullstack Developer at **Rimo** (transcription & summary services)
- **Side Project:** **Ritam** (ऋतम्) — LLM observability & cost management platform (open-source + commercial)
- **Speaking:** KubeCon Mumbai, June 2025 — LLM cost management at scale
- **Passions:** Hindu philosophy & mythology (especially Ramayana), LLMs, system design, creative interfaces
- **Stack:** TypeScript, Go, React, Node.js, Kubernetes, Three.js, Postgres, gRPC, RAG systems

### Projects (4 celestial nodes)

| # | Title | Sanskrit/Glyph | Subtitle | Color | Description |
|---|-------|---------------|----------|-------|-------------|
| 1 | Ritam | ऋतम् | LLM Observability | `#FF6B35` (orange) | Budget enforcement, cost tracking & prompt optimization for AI APIs |
| 2 | Mnemosyne | μνήμη | Cognitive Prosthesis | `#00E5A0` (emerald) | Memory system modeling human decay curves with biological forgetting |
| 3 | DocuMind | ज्ञान | RAG from Scratch | `#4ECDC4` (teal) | Production-grade retrieval for K8s docs, custom chunking & hybrid search |
| 4 | Ramayana Atlas | रामायण | Epic Cartography | `#FFD93D` (gold) | Geographic exploration of the Ramayana with AI-powered narrative |

### Sections (in scroll order)
1. **ORIGIN** — Hero: name, tagline, "scroll to fly"
2. **ABOUT** — Philosophy + bio + skills
3. **RITAM** — Project 1 node
4. **MNEMOSYNE** — Project 2 node
5. **DOCUMIND** — Project 3 node
6. **ATLAS** — Project 4 node
7. **SIGNAL** — Contact / CTA

### Cultural Thread
- The Sanskrit glyph ऋतम् appears subtly in the footer — represents cosmic order
- Each project shows its glyph faintly behind the title (decorative, not explanatory)
- The connection to Indian philosophy is **visual, not textual** — through sacred geometry in orbital elements, warm color grading, and the overall cosmos-as-consciousness metaphor
- Potential sacred geometry orbitals (optional enhancement): Sri Yantra triangles for Ritam, Lotus petals for Mnemosyne, Mandala rings for DocuMind, Chakra wheel for Ramayana Atlas

---

## Aesthetic Direction

### Tone
**Cinematic space documentary meets luxury editorial.** Think Interstellar's cinematography + Pentagram's typography. Dark, vast, atmospheric — but never cold. There's warmth in the star colors, the orange accent, the serif typography.

### Color Palette
```
Background:       #000004 (near-black with blue undertone)
Primary Accent:    #FF6B35 (warm orange — used for UI lines, hover states)
Project Colors:    #FF6B35, #00E5A0, #4ECDC4, #FFD93D
Text Primary:      rgba(255,255,255,0.72)
Text Secondary:    rgba(255,255,255,0.3–0.42)
Text Muted:        rgba(255,255,255,0.08–0.15)
```

### Typography
```
Display/Hero:    'Bodoni Moda' (serif, weight 900) — dramatic, high-contrast
Body/Prose:      'Cormorant Garamond' (serif, weight 300–500) — elegant, readable
Mono/UI:         'DM Mono' (monospace, weight 300–500) — technical labels, tags
```
- Hero name: `min(13vw, 130px)`, weight 900, slight text-shadow glow
- Section labels: 10px, `letter-spacing: 0.22em`, uppercase, mono
- Project titles: `min(6vw, 46px)`, weight 700, serif
- Body text: 16–24px, serif, line-height 1.65–1.75
- Tech tags: 10px, mono, pill-shaped with colored borders

### Layout Philosophy
- **No traditional nav, no grids, no scroll containers.** Content floats as overlays on the 3D canvas
- Text appears left-aligned during project sections, centered for hero/about/contact
- Overlays fade in/out based on camera progress along the spline
- Fixed UI: logo top-left, progress bar right-center, section label bottom-left, section dots bottom-center, ऋतम् bottom-right

### Motion Principles
- All transitions are smooth and cinematic — `cubic-bezier(0.16, 1, 0.3, 1)` for enters
- Camera movement is interpolated with a 0.04 lerp factor (buttery smooth, never jerky)
- Mouse parallax on camera: 1.8x horizontal, 1.0x vertical, smoothed at 0.03 factor
- Subtle camera roll: `sm.x * 0.02 + sin(t * 0.15) * 0.005`
- Overlay transitions: opacity + translateY/translateX with 0.03s–0.035s fade durations based on scroll progress

---

## Technical Architecture

### Stack
```
Framework:       Next.js (App Router) or Vite + React
3D Engine:       Three.js (r128 compatible, no post-processing npm packages)
Styling:         CSS-in-JS (inline styles) or Tailwind — no CSS modules
Fonts:           Google Fonts (loaded via <link>)
Deployment:      Vercel / Cloudflare Pages
```

### Why Custom Shaders (NOT EffectComposer)
The bloom pipeline is hand-rolled because:
1. Three.js r128 (available in artifact env) doesn't bundle postprocessing
2. Custom shaders give precise control over the cinematic look
3. No dependency on `three/examples/jsm/postprocessing/*`
4. The pipeline is actually simple: 6 render passes, 4 shader materials

### Render Pipeline (6 passes)

```
Pass 1: Render scene → mainRT (HalfFloatType for HDR)
Pass 2: Threshold extract bright pixels → brightRT (half res)
Pass 3: Horizontal Gaussian blur → pingRT
Pass 4: Vertical Gaussian blur → pongRT (sharp bloom)
Pass 5: Wide blur at quarter res → pong2RT (soft bloom)
Pass 6: Composite (scene + 2 bloom layers + chromatic aberration + vignette + grain + tonemap) → screen
```

### Key Render Targets
```javascript
mainRT:    full resolution, HalfFloatType (HDR scene)
brightRT:  half resolution (threshold output)
pingRT:    half resolution (blur intermediate)
pongRT:    half resolution (final sharp bloom)
ping2RT:   quarter resolution (blur intermediate)
pong2RT:   quarter resolution (final wide bloom)
```

### GLSL Shaders

#### Star Vertex Shader
- Attributes: `brightness` (power-law distribution), `temperature` (0–1), `phase` (random)
- Twinkle: `0.7 + 0.3 * sin(uTime * (1 + phase * 3) + phase * 6.28)`
- Point size: `brightness * twinkle * (350.0 / -mv.z)`, clamped 0.5–45.0

#### Star Fragment Shader
- Airy disk approximation: `core = exp(-d*d*60)`, `inner = exp(-d*d*12)*0.5`, `outer = exp(-d*d*3)*0.12`
- 4-point diffraction spikes: `exp(-abs(uv.y)*18) * exp(-abs(uv.x)*4) * 0.3`
- Color temperature mapping: hot (blue-white) → mid (white) → warm (orange) → cool (red)
- Bright core always blended toward white: `mix(col, vec3(1), core * 0.7)`

#### Composite Fragment Shader
- Chromatic aberration: `0.0015 * dist` from center, offset R and B channels
- Vignette: `1.0 - dist² * 1.2`, smoothstepped
- Warm color grade: `R *= 1.02, B *= 0.97`
- Film grain: procedural via `fract(sin(dot(...)))`
- Tonemap: Reinhard `c / (c + 0.85)` then `smoothstep` contrast boost

### Camera System
- **Path:** CatmullRom spline, 14 waypoints, spanning Z: 80 to -185
- **Scroll:** Wheel events (NOT page scroll), `deltaY * 0.00012` per tick
- **Touch:** Touch delta `* 0.0004`
- **Smooth interpolation:** `progress += (target - progress) * 0.04` per frame
- **Look-ahead:** Camera looks at `path.getPointAt(p + 0.015)` for smooth forward direction

### Scene Objects

#### Stars (4000 points, ShaderMaterial)
- Position: spread ±175x, ±100y, -400 to +110 z
- Brightness: `pow(random, 2.5) * 3 + 0.3` (power-law: few bright, many dim)
- 30 "hero" stars with brightness 3–6
- No textures — entirely shader-computed

#### Dust (1500 points, PointsMaterial)
- Colored in project accent colors at low intensity (0.12–0.27 brightness)
- Soft dot texture (canvas-generated radial gradient, fully transparent edges)
- Size 2.0, additive blending

#### Nebula Clouds (20+ sprites)
- Canvas-generated: 5 overlapping radial gradients with random offsets for organic shape
- Colors: project accents + purple + pink
- Opacity: 0.06–0.11, additive blending
- Gently float on Y axis: `baseY + sin(t * speed + offset) * 2`

#### Project Nodes (4 groups)
Each node contains:
- **Core sphere:** SphereGeometry(0.7), MeshBasicMaterial, project color
- **Inner glow:** Sprite with canvas radial glow texture, scale 7, opacity pulses 0.35–0.65
- **Outer halo:** Sprite, scale 14–18, opacity 0.10–0.14
- **Torus ring:** TorusGeometry(2.8, 0.035), opacity 0.18, rotating on Z
- **Second ring:** TorusGeometry(3.8, 0.02), tilted differently, opacity 0.06
- **Orbiting motes:** 60 Points around the node, size 0.15, additive blend
- **Position:** Nodes are placed at alternating X positions along the Z path, matching camera waypoints
- Nodes float: `baseY + sin(bt * 0.4) * 0.6`
- Core pulses: `scale = 1 + sin(bt * 0.9) * 0.08`

#### Connection Curves
- Sinusoidal lines between adjacent nodes
- `opacity: 0.015–0.02`, additive blending
- 60 segments with `sin(t * PI * 4) * 2` horizontal and `cos(t * PI * 3) * 1.5` vertical offset

### Section Visibility Logic
Overlays appear/disappear based on scroll progress (0–1):
```
Hero:        visible 0.00–0.12, fade out 0.06–0.12
About:       visible 0.13–0.24, fade in 0.13–0.16, fade out 0.21–0.24
Project i:   base = 0.25 + i * 0.155
             fade in: base to base+0.03
             visible: base+0.03 to base+0.12
             fade out: base+0.12 to base+0.155
Contact:     fade in 0.87–0.93, visible until 1.0
```

---

## File Structure (Production)

```
/
├── public/
│   ├── fonts/          # Self-host Google Fonts for performance
│   └── og-image.png    # Social preview
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx    # Mount the cosmos
│   ├── components/
│   │   ├── cosmos/
│   │   │   ├── CinematicCosmos.tsx      # Main Three.js component
│   │   │   ├── shaders/
│   │   │   │   ├── stars.vert.glsl
│   │   │   │   ├── stars.frag.glsl
│   │   │   │   ├── threshold.frag.glsl
│   │   │   │   ├── blur.frag.glsl
│   │   │   │   ├── composite.frag.glsl
│   │   │   │   └── quad.vert.glsl
│   │   │   ├── objects/
│   │   │   │   ├── createStars.ts
│   │   │   │   ├── createDust.ts
│   │   │   │   ├── createNebulae.ts
│   │   │   │   ├── createProjectNode.ts
│   │   │   │   └── createConnections.ts
│   │   │   ├── pipeline/
│   │   │   │   └── BloomPipeline.ts     # Render target + pass management
│   │   │   ├── textures/
│   │   │   │   ├── softDot.ts
│   │   │   │   ├── glowSprite.ts
│   │   │   │   └── nebulaSprite.ts
│   │   │   └── cameraPath.ts            # Spline waypoints
│   │   └── overlays/
│   │       ├── HeroOverlay.tsx
│   │       ├── AboutOverlay.tsx
│   │       ├── ProjectOverlay.tsx
│   │       ├── ContactOverlay.tsx
│   │       ├── ProgressBar.tsx
│   │       └── FixedUI.tsx
│   ├── data/
│   │   └── projects.ts                   # Project data array
│   ├── hooks/
│   │   ├── useScrollProgress.ts          # Wheel/touch → progress
│   │   └── useMouseParallax.ts           # Mouse → smoothed offset
│   └── styles/
│       └── globals.css
├── SKILL.md
└── package.json
```

---

## Enhancement Roadmap

These are optional improvements to layer on, ordered by impact:

### Tier 1 — High Impact
- **Sound design:** Subtle ambient space drone that fades in on first interaction, volume tied to scroll speed. Use Tone.js or Web Audio API. Keep it opt-in (click to enable).
- **Loading sequence:** A brief cinematic intro — stars fade in over 2s, then name resolves from blur, then "scroll to fly" appears. Currently partially implemented.
- **Responsive design:** The overlays need mobile breakpoints. Font sizes use `min()` already. Canvas is full-viewport. Main concern: touch scroll sensitivity and overlay padding.
- **Performance:** Detect low-end GPUs via `renderer.capabilities` and reduce: star count (4000→1500), disable bloom pass 2, reduce nebula count, lower pixel ratio.

### Tier 2 — Medium Impact
- **Sacred geometry orbitals:** Replace torus rings with: Sri Yantra for Ritam, Lotus for Mnemosyne, Mandala for DocuMind, Chakra wheel for Ramayana Atlas. (Code exists in `cosmos-sacred.jsx` — cherry-pick the geometry builders, keep the current planet rendering.)
- **Clickable nodes:** When a project overlay is visible, allow clicking through to a detail page or modal with full case study.
- **Keyboard navigation:** Arrow keys / Page Up/Down to jump between sections.
- **Planet shaders:** Replace MeshBasicMaterial spheres with the custom planet shader (fbm noise surface, Fresnel atmosphere, specular). Code exists in `cosmos-sacred.jsx` — the `planetVert`/`planetFrag` shaders. Use carefully — test that it looks good WITH bloom before shipping.
- **Analytics:** Track which projects get the most "dwell time" based on scroll position.

### Tier 3 — Polish
- **Cursor:** Custom crosshair cursor that subtly reacts to proximity to nodes.
- **Easter egg:** If someone scrolls all the way back to 0% after reaching 100%, reveal a hidden message or animation.
- **Prefers-reduced-motion:** Disable all animations, show static layout with project cards.
- **SEO:** Despite being a WebGL app, ensure the HTML overlays are in the DOM for crawlers. Add structured data, meta tags, OG image.

---

## Critical Rules

1. **Never use EffectComposer or postprocessing imports** — the bloom pipeline is custom and must stay that way for compatibility.
2. **Stars must use ShaderMaterial** — PointsMaterial with canvas textures looks fake. The Airy disk + diffraction spike shader is non-negotiable.
3. **Scroll must use wheel/touch events on the container** — not `window.scrollY` or page scroll. The page has no scrollable height.
4. **All render targets must use HalfFloatType** for the main target to enable HDR bloom.
5. **Additive blending on everything luminous** — stars, dust, nebulae, glows, halos. Never use normal blending for light-emitting objects.
6. **Dispose everything on unmount** — renderer, all render targets, geometries, materials. Three.js leaks memory aggressively.
7. **The cultural thread is visual, not textual** — no "inspired by Hindu philosophy" copy. The Sanskrit glyphs, warm colors, sacred geometry, and cosmos metaphor speak for themselves.
8. **Typography hierarchy is strict** — Bodoni Moda for display, Cormorant Garamond for body, DM Mono for UI. Never mix them.
9. **Bloom strength ~1.5, threshold ~0.1** — these values were tuned. Changing them significantly will either wash out the scene or kill the glow.
10. **Camera lerp factor 0.04, mouse lerp 0.03** — faster feels jerky, slower feels laggy. These are the sweet spot.
