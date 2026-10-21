"use client";

import dynamic from "next/dynamic";

const ViewCanvas = dynamic(() => import("./three/ViewCanvas"), { ssr: false });

export default function ViewLayer() {
  return <ViewCanvas />;
}
