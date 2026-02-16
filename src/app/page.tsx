"use client";

import dynamic from "next/dynamic";

const CinematicCosmos = dynamic(
  () => import("@/components/CinematicCosmos"),
  { ssr: false }
);

export default function Home() {
  return <CinematicCosmos />;
}
