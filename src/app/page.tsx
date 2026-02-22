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
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className="loader-static-link" href="/classic">
          Prefer the fast lane? View static site &#8594;
        </a>
        <style>{`
          @keyframes cosmosLoaderSpin {
            to { transform: rotate(360deg); }
          }
          .loader-static-link {
            margin-top: 24px;
            font-family: monospace;
            font-size: 11px;
            color: rgba(255,255,255,0.3) !important;
            text-decoration: underline !important;
            cursor: pointer;
            pointer-events: auto;
            z-index: 10;
            position: relative;
          }
          .loader-static-link:hover {
            color: #FF6B35 !important;
          }
        `}</style>
      </div>
    ),
  }
);

export default function Home() {
  return <CinematicCosmos />;
}
