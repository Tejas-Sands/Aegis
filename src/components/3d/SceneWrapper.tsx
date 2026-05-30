import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";

interface SceneWrapperProps {
  children: React.ReactNode;
  className?: string;
  cameraPosition?: [number, number, number];
}

export function SceneWrapper({
  children,
  className = "",
  cameraPosition = [0, 0, 5],
}: SceneWrapperProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov: 50 }}
        dpr={[1, 2]}
        /**
         * alpha: true  → transparent WebGL framebuffer (no white fill)
         * The <color> primitive below is removed in favour of this.
         */
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
        /**
         * onCreated fires once after the renderer is ready.
         * setClearColor with alpha=0 is the definitive way to kill
         * the default opaque grey/white WebGL background.
         */
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        {/* ── Warm amber-orange key light (lantern feel) ── */}
        <ambientLight intensity={0.3} color="#ffd090" />

        {/* Main key: warm from upper-front */}
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.4}
          color="#ffb347"
          castShadow
        />

        {/* Cool cyber fill from below the hull */}
        <directionalLight
          position={[-5, -4, -3]}
          intensity={0.6}
          color="#00c8ff"
        />

        {/* Glow-engine bounce: sits behind the ship */}
        <pointLight position={[0, -1, 6]} intensity={1.8} color="#ff6b00" distance={8} />

        {/* Lantern warmth: near the stern */}
        <pointLight position={[0, 1, 3]} intensity={1.2} color="#ffaa00" distance={6} />

        {/* Rim light from port side */}
        <pointLight position={[-4, 2, -1]} intensity={0.8} color="#00D9FF" distance={10} />

        <Suspense fallback={null}>
          {children}
          {/* 
            Environment preset="night" gives metal reflections
            background={false} means it ONLY affects reflections,
            never draws a skybox that would obscure transparency.
          */}
          <Environment preset="night" background={false} />

          <ContactShadows
            position={[0, -1.2, 0]}
            opacity={0.8}
            scale={15}
            blur={1.5}
            far={4}
            color="#000000"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}