"use client";

import { Environment, Lightformer } from "@react-three/drei";

// Soft-box product lighting built from planes, so no HDR file has to be downloaded.
export default function Studio() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 2]} scale={[8, 1.5, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2} position={[-4, 1, 1]} scale={[1.2, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={2} position={[4, 1, 1]} scale={[1.2, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" color="#ff8562" intensity={1.5} position={[0, 0, -5]} scale={3} />
      </Environment>
    </>
  );
}
