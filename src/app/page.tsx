"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function Loader() {
  return (
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
      <Link
        href="/classic"
        style={{
          marginTop: 24,
          fontFamily: "monospace",
          fontSize: 11,
          color: "rgba(255,255,255,0.35)",
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
      >
        Prefer the fast lane? View static site →
      </Link>
      <style>{`
        @keyframes cosmosLoaderSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const [Cosmos, setCosmos] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import("@/components/CinematicCosmos").then((mod) => {
      setCosmos(() => mod.default);
    });
  }, []);

  if (!Cosmos) return <Loader />;
  return <Cosmos />;
}
