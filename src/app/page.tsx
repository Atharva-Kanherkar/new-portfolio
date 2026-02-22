"use client";

import dynamic from "next/dynamic";

const CinematicCosmos = dynamic(
  () => import("@/components/CinematicCosmos"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "100dvh",
          background: "#02040b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "2px solid rgba(255,255,255,0.06)",
            borderTopColor: "#FF6B35",
            borderRadius: "50%",
            animation: "cosmosLoaderSpin 0.8s linear infinite",
          }}
        />
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            letterSpacing: ".15em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          Loading cosmos
        </span>
        <a
          href="/classic"
          style={{
            marginTop: 24,
            fontFamily: "monospace",
            fontSize: 11,
            color: "rgba(255,255,255,0.18)",
            textDecoration: "none",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            paddingBottom: 1,
            transition: "color .2s, border-color .2s",
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.color = "#FF6B35"; (e.target as HTMLElement).style.borderColor = "#FF6B35"; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.color = "rgba(255,255,255,0.18)"; (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
        >
          Prefer the fast lane? View static site &rarr;
        </a>
        <style>{`
          @keyframes cosmosLoaderSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    ),
  }
);

export default function Home() {
  return <CinematicCosmos />;
}
