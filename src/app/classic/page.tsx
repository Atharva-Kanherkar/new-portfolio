import { Space_Grotesk, DM_Mono, Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import {
  PROJECTS,
  SKILL_CONSTELLATIONS,
  EXPERIENCES,
  EDUCATION,
} from "@/data/portfolio";
import { getAllPosts } from "@/lib/blog";
import ClassicChat from "./ClassicChat";
import s from "./classic.module.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-grotesk",
});
const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
});
const garamond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-garamond",
});

export default function ClassicPage() {
  const posts = getAllPosts();
  return (
    <div
      className={`${s.page} ${grotesk.variable} ${mono.variable} ${garamond.variable}`}
      style={{ fontFamily: "var(--font-mono), monospace" }}
    >
      {/* ── NAV ── */}
      <nav className={s.nav}>
        <div className={s.navInner} style={{ fontFamily: "var(--font-mono), monospace" }}>
          <Link href="/classic" className={s.logo} style={{ fontFamily: "var(--font-grotesk), sans-serif" }}>
            A.
          </Link>
          <a href="#about" className={s.navLink}>About</a>
          <a href="#projects" className={s.navLink}>Projects</a>
          <a href="#blog" className={s.navLink}>Blog</a>
          <a href="#stack" className={s.navLink}>Stack</a>
          <a href="#experience" className={s.navLink}>Experience</a>
          <Link href="/" className={s.cosmosLink}>[COSMOS &rarr;]</Link>
        </div>
      </nav>

      <div className={s.container}>
        {/* ── HERO ── */}
        <section className={s.hero}>
          <h1
            className={s.heroName}
            style={{ fontFamily: "var(--font-grotesk), sans-serif" }}
          >
            Atharva<br />
            <span className={s.heroAccent}>Kanherkar</span>
          </h1>
          <p className={s.heroTagline}>
            Software engineer building at the intersection of AI infrastructure,
            open-source systems, and interfaces that feel alive.
          </p>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" className={s.section}>
          <div className={s.sectionLabel}>About</div>
          <div className={s.aboutText}>
            <p>
              I&apos;m a final-year CS student at IIITDM Jabalpur with a bias toward
              building things that ship. My work spans LLM observability platforms,
              retrieval-augmented generation pipelines, and open-source contributions
              across the Linux Foundation, Google Summer of Code, and the Typelevel
              ecosystem.
            </p>
            <p>
              I care about correctness, cost-awareness, and the craft of making
              complex systems legible.{" "}
              <span className={s.italicAccent} style={{ fontFamily: "var(--font-garamond), serif" }}>
                Most of my work starts with a question I can&apos;t let go of.
              </span>
            </p>
          </div>
        </section>

        {/* ── PROJECTS ── */}
        <section id="projects" className={s.section}>
          <div className={s.sectionLabel}>Projects</div>
          <div className={s.projectGrid}>
            {PROJECTS.map((p) => (
              <div key={p.title} className={s.projectCard}>
                <div className={s.projectGlyph}>{p.glyph}</div>
                <div className={s.projectTitle} style={{ fontFamily: "var(--font-grotesk), sans-serif" }}>
                  {p.title}
                </div>
                <div className={s.projectSub}>{p.sub}</div>
                <div className={s.projectDesc}>{p.desc}</div>
                <div className={s.projectTech}>
                  {p.tech.map((t) => (
                    <span key={t} className={s.techTag}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BLOG ── */}
        <section id="blog" className={s.section}>
          <div className={s.sectionLabel}>Blog</div>
          <div className={s.blogList}>
            {posts.map((post) => (
              <div key={post.slug} className={s.blogEntry}>
                <div className={s.blogDate}>{post.date}</div>
                <div className={s.blogTitle} style={{ fontFamily: "var(--font-grotesk), sans-serif" }}>
                  {post.title}
                </div>
                <div className={s.blogExcerpt}>{post.excerpt}</div>
                <Link href={`/classic/blog/${post.slug}`} className={s.blogRead}>
                  [READ &rarr;]
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── STACK ── */}
        <section id="stack" className={s.section}>
          <div className={s.sectionLabel}>Tech Stack</div>
          <div className={s.stackGrid}>
            {SKILL_CONSTELLATIONS.map((c) => (
              <div key={c.key} className={s.stackGroup}>
                <div className={s.stackGroupTitle} style={{ fontFamily: "var(--font-grotesk), sans-serif" }}>
                  {c.title}{" "}
                  <span className={s.italicAccent} style={{ fontFamily: "var(--font-garamond), serif", fontWeight: 400 }}>
                    &mdash; {c.philosophy}
                  </span>
                </div>
                <div className={s.stackGroupSummary}>{c.summary}</div>
                <div className={s.stackNodes}>
                  {c.nodes.map((n) => (
                    <span key={n.label} className={s.stackNode}>{n.label}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── EXPERIENCE ── */}
        <section id="experience" className={s.section}>
          <div className={s.sectionLabel}>Experience</div>
          <div className={s.expList}>
            {EXPERIENCES.map((exp) => (
              <div key={exp.company} className={s.expEntry}>
                <div className={s.expTime}>
                  {exp.timeframe}
                  {exp.ongoing && <span className={s.expOngoing} />}
                </div>
                <div className={s.expBody}>
                  <div className={s.expCompany} style={{ fontFamily: "var(--font-grotesk), sans-serif" }}>
                    {exp.company}
                  </div>
                  <div className={s.expRole}>{exp.role}</div>
                  <div className={s.expSummary}>{exp.summary}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── EDUCATION (compact) ── */}
        <section className={s.section}>
          <div className={s.sectionLabel}>Education</div>
          <div className={s.expList}>
            {EDUCATION.map((ed) => (
              <div key={ed.institution} className={s.expEntry}>
                <div className={s.expTime}>{ed.timeframe}</div>
                <div className={s.expBody}>
                  <div className={s.expCompany} style={{ fontFamily: "var(--font-grotesk), sans-serif" }}>
                    {ed.institution}
                  </div>
                  <div className={s.expRole}>{ed.path}</div>
                  <div className={s.expSummary}>{ed.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className={s.footer}>
          <div className={s.footerText}>
            Atharva Kanherkar &middot; 2025 &middot;{" "}
            <Link href="/" style={{ color: "var(--accent)", textDecoration: "none" }}>
              [COSMOS]
            </Link>
          </div>
        </footer>
      </div>

      {/* ── ASK AI ── */}
      <ClassicChat />
    </div>
  );
}
