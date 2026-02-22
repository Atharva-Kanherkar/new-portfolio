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
