import { notFound } from "next/navigation";
import Link from "next/link";
import { Space_Grotesk, DM_Mono, Cormorant_Garamond } from "next/font/google";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import ClassicChat from "../../ClassicChat";
import s from "../../classic.module.css";
import b from "./blog.module.css";

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

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

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
          <Link href="/classic#blog" className={s.navLink}>&larr; Blog</Link>
          <Link href="/" className={s.cosmosLink}>[COSMOS &rarr;]</Link>
        </div>
      </nav>

      <div className={s.container}>
        <article className={b.article}>
          <header className={b.header}>
            <div className={b.date}>{post.date}</div>
            <h1 className={b.title} style={{ fontFamily: "var(--font-grotesk), sans-serif" }}>
              {post.title}
            </h1>
            <p className={b.excerpt} style={{ fontFamily: "var(--font-garamond), serif" }}>
              {post.excerpt}
            </p>
          </header>

          <div className={b.prose}>
            <MDXRemote source={post.content} />
          </div>
        </article>

        <footer className={s.footer}>
          <div className={s.footerText}>
            <Link href="/classic#blog" style={{ color: "var(--accent)", textDecoration: "none" }}>
              [&larr; ALL POSTS]
            </Link>
          </div>
        </footer>
      </div>

      <ClassicChat />
    </div>
  );
}
