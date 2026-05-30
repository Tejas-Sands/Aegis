import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CyberShipProps {
  color?: string;
  glowColor?: string;
  accentColor?: string;
  scale?: number;
  [key: string]: any;
}

export function CyberShip({
  color = "#1a0e00",
  glowColor = "#FF6B00",
  accentColor = "#FFD700",
  scale = 1,
  ...props
}: CyberShipProps) {
  const group = useRef<THREE.Group>(null);
  const mastRef = useRef<THREE.Group>(null);
  const sailRef = useRef<THREE.Mesh>(null);
  const sail2Ref = useRef<THREE.Mesh>(null);
  const flagRef = useRef<THREE.Mesh>(null);
  const engineL = useRef<THREE.Mesh>(null);
  const engineR = useRef<THREE.Mesh>(null);
  const engineHaloL = useRef<THREE.Mesh>(null);
  const engineHaloR = useRef<THREE.Mesh>(null);
  const cockpitRef = useRef<THREE.Mesh>(null);
  const lanternRef = useRef<THREE.Mesh>(null);
  const lantern2Ref = useRef<THREE.Mesh>(null);
  const bowspritRef = useRef<THREE.Mesh>(null);

  const glowVec = useMemo(() => new THREE.Color(glowColor), [glowColor]);
  const accentVec = useMemo(() => new THREE.Color(accentColor), [accentColor]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // ── HULL: ocean-swell + side-to-side traversal ──
    if (group.current) {
      const speed = 0.35;
      const amplitude = 1.5;
      // Current X position and velocity (derivative of position)
      const sweep = Math.sin(t * speed) * amplitude;
      const velX = Math.cos(t * speed) * speed * amplitude; // actual dx/dt

      group.current.position.x = sweep;
      group.current.position.y = Math.sin(t * 1.1) * 0.12 + Math.sin(t * 2.3) * 0.04;

      // Smooth yaw: atan2 gives a continuous angle from velocity,
      // no hard flip. velX drives X movement; small Z offset keeps
      // the angle well-defined even when velX ≈ 0 at the extremes.
      const targetYaw = Math.atan2(-velX, 0.001);
      // Lerp current rotation toward target so it eases through turns
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        targetYaw,
        0.08
      );

      // Roll proportional to velocity (heel into the direction of travel)
      group.current.rotation.z = (velX / (speed * amplitude)) * 0.1 + Math.sin(t * 0.8) * 0.03;
      group.current.rotation.x = Math.sin(t * 1.3) * 0.025;
    }

    // ── MAST: sways with a slight lag behind hull roll ──
    if (mastRef.current) {
      mastRef.current.rotation.z = Math.sin(t * 0.8 + 0.4) * 0.04;
    }

    // ── SAILS: billowing with wind gusts ──
    if (sailRef.current) {
      const mat = sailRef.current.material as THREE.MeshStandardMaterial;
      // Subtle scale puff on Z to fake sail belly
      sailRef.current.scale.z = 1 + Math.sin(t * 1.4) * 0.08 + Math.sin(t * 3.1) * 0.03;
      mat.emissiveIntensity = 0.04 + Math.sin(t * 1.7) * 0.03;
    }
    if (sail2Ref.current) {
      sail2Ref.current.scale.z = 1 + Math.sin(t * 1.4 + 0.5) * 0.07 + Math.sin(t * 2.8) * 0.025;
    }

    // ── FLAG: snaps in the wind ──
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(t * 4.0) * 0.3 + Math.sin(t * 7.5) * 0.1;
      flagRef.current.rotation.z = Math.sin(t * 3.5) * 0.08;
    }

    // ── ENGINES: asymmetric thruster pulse ──
    if (engineL.current) {
      const mat = engineL.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + Math.sin(t * 11.0) * 0.45;
    }
    if (engineR.current) {
      const mat = engineR.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 + Math.sin(t * 11.0 + 1.8) * 0.45;
    }
    if (engineHaloL.current) {
      const mat = engineHaloL.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(t * 5.5) * 0.15;
    }
    if (engineHaloR.current) {
      const mat = engineHaloR.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(t * 5.5 + 2.1) * 0.15;
    }

    // ── COCKPIT: breathing glow ──
    if (cockpitRef.current) {
      const mat = cockpitRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.sin(t * 2.1) * 0.12;
    }

    // ── LANTERNS: warm flicker ──
    if (lanternRef.current) {
      const mat = lanternRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.7 + Math.sin(t * 17) * 0.15 + Math.sin(t * 31) * 0.1;
    }
    if (lantern2Ref.current) {
      const mat = lantern2Ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.65 + Math.sin(t * 19 + 1.1) * 0.2 + Math.sin(t * 29) * 0.1;
    }

    // ── BOWSPRIT: slow pitch oscillation (like cresting a wave) ──
    if (bowspritRef.current) {
      bowspritRef.current.rotation.x = Math.sin(t * 1.3 + 0.6) * 0.03;
    }
  });

  // Shared materials defined once
  const hullMat = <meshStandardMaterial color={color} roughness={0.55} metalness={0.7} />;
  const darkWood = <meshStandardMaterial color="#1c0f00" roughness={0.9} metalness={0.1} />;
  const brassAccent = <meshStandardMaterial color={accentColor} roughness={0.2} metalness={1.0}
    emissive={new THREE.Color(accentColor)} emissiveIntensity={0.15} />;

  return (
    <group ref={group} scale={scale} {...props} dispose={null}>

      {/* Dark shadow footprint */}
      <mesh position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 5.2]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>

      {/* ═══════════════════════════════
          HULL — wide, deep-bellied keel
      ═══════════════════════════════ */}
      {/* Main hull body */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[1.6, 0.55, 3.8]} />
        {hullMat}
      </mesh>

      {/* Hull bottom keel taper */}
      <mesh position={[0, -0.42, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1.0, 0.3, 3.6]} />
        {darkWood}
      </mesh>

      {/* Prow (bow) nose wedge */}
      <mesh position={[0, -0.05, -2.15]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.75, 0.9, 4, 1]} />
        {hullMat}
      </mesh>

      {/* Stern (rear) blocky castle */}
      <mesh position={[0, 0.25, 1.7]}>
        <boxGeometry args={[1.5, 0.65, 0.7]} />
        {hullMat}
      </mesh>
      <mesh position={[0, 0.6, 1.7]}>
        <boxGeometry args={[1.3, 0.3, 0.65]} />
        {darkWood}
      </mesh>

      {/* Hull port & starboard upper strakes */}
      <mesh position={[-0.82, 0.12, 0]}>
        <boxGeometry args={[0.06, 0.22, 3.5]} />
        {brassAccent}
      </mesh>
      <mesh position={[0.82, 0.12, 0]}>
        <boxGeometry args={[0.06, 0.22, 3.5]} />
        {brassAccent}
      </mesh>

      {/* Hull planking groove lines (decorative) */}
      {[-0.9, -0.3, 0.3, 0.9].map((z, i) => (
        <mesh key={i} position={[0, -0.09, z]}>
          <boxGeometry args={[1.62, 0.03, 0.04]} />
          <meshStandardMaterial color="#0e0600" roughness={1} metalness={0} />
        </mesh>
      ))}

      {/* ═══════════════════════════════
          DECK
      ═══════════════════════════════ */}
      <mesh position={[0, 0.19, 0.1]}>
        <boxGeometry args={[1.55, 0.06, 3.5]} />
        <meshStandardMaterial color="#2a1500" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Deck planking */}
      {[-2, -1.3, -0.6, 0.1, 0.8, 1.5].map((z, i) => (
        <mesh key={i} position={[0, 0.225, z * 0.5]}>
          <boxGeometry args={[1.5, 0.01, 0.06]} />
          <meshStandardMaterial color="#1a0c00" roughness={1} metalness={0} />
        </mesh>
      ))}

      {/* ═══════════════════════════════
          MAST + SAILS
      ═══════════════════════════════ */}
      <group ref={mastRef} position={[0, 0.22, -0.3]}>
        {/* Main mast pole */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.045, 0.07, 3.0, 8]} />
          <meshStandardMaterial color="#180d00" roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Crow's nest platform */}
        <mesh position={[0, 2.75, 0]}>
          <cylinderGeometry args={[0.28, 0.22, 0.12, 10]} />
          {darkWood}
        </mesh>
        <mesh position={[0, 2.82, 0]}>
          <torusGeometry args={[0.28, 0.035, 6, 14]} />
          {brassAccent}
        </mesh>

        {/* Main yard (horizontal spar) */}
        <mesh position={[0, 2.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.028, 0.028, 1.9, 8]} />
          <meshStandardMaterial color="#180d00" roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Main sail — billows on Z */}
        <mesh ref={sailRef} position={[0, 1.55, 0.08]}>
          <planeGeometry args={[1.6, 1.3, 6, 6]} />
          <meshStandardMaterial
            color="#c8a96e"
            roughness={0.9}
            metalness={0}
            side={THREE.DoubleSide}
            emissive={new THREE.Color("#ff6b00")}
            emissiveIntensity={0.04}
            transparent
            opacity={0.92}
          />
        </mesh>

        {/* Skull & crossbones emblem on sail */}
        <mesh position={[0, 1.55, 0.09]}>
          <planeGeometry args={[0.4, 0.4]} />
          <meshBasicMaterial color="#111111" side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>

        {/* Top sail — smaller, above main yard */}
        <mesh position={[0, 2.58, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 1.2, 8]} />
          <meshStandardMaterial color="#180d00" roughness={0.8} metalness={0.2} />
        </mesh>
        <mesh ref={sail2Ref} position={[0, 2.36, 0.06]}>
          <planeGeometry args={[1.0, 0.55, 4, 4]} />
          <meshStandardMaterial
            color="#b89450"
            roughness={0.9}
            metalness={0}
            side={THREE.DoubleSide}
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* Pirate flag at masthead */}
        <mesh ref={flagRef} position={[0.28, 3.08, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.55, 0.35]} />
          <meshBasicMaterial color="#0a0a0a" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ═══════════════════════════════
          BOWSPRIT (diagonal front spar)
      ═══════════════════════════════ */}
      <group ref={bowspritRef} position={[0, 0.28, -2.1]} rotation={[-0.22, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.035, 0.055, 1.5, 8]} />
          <meshStandardMaterial color="#180d00" roughness={0.8} metalness={0.2} />
        </mesh>
        {/* Bowsprit sail (jib) */}
        <mesh position={[0, -0.25, 0.3]} rotation={[0.8, 0, 0]}>
          <planeGeometry args={[0.6, 0.9, 4, 4]} />
          <meshStandardMaterial
            color="#c0984a"
            roughness={0.9}
            metalness={0}
            side={THREE.DoubleSide}
            transparent
            opacity={0.82}
          />
        </mesh>
      </group>

      {/* ═══════════════════════════════
          CANNON PORTS (3 per side)
      ═══════════════════════════════ */}
      {[-0.9, 0, 0.9].map((z, i) => (
        <React.Fragment key={i}>
          {/* Port (left) cannon */}
          <mesh position={[-0.82, -0.08, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.09, 0.5, 10]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.9} />
          </mesh>
          <mesh position={[-1.05, -0.08, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.07, 0.1, 10]} />
            <meshStandardMaterial color={accentColor} roughness={0.2} metalness={1.0}
              emissive={new THREE.Color(accentColor)} emissiveIntensity={0.3} />
          </mesh>
          {/* Starboard (right) cannon */}
          <mesh position={[0.82, -0.08, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.07, 0.09, 0.5, 10]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.9} />
          </mesh>
          <mesh position={[1.05, -0.08, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.07, 0.1, 10]} />
            <meshStandardMaterial color={accentColor} roughness={0.2} metalness={1.0}
              emissive={new THREE.Color(accentColor)} emissiveIntensity={0.3} />
          </mesh>
        </React.Fragment>
      ))}

      {/* ═══════════════════════════════
          STERN LANTERNS (flickering)
      ═══════════════════════════════ */}
      {/* Port stern lantern */}
      <mesh position={[-0.62, 0.72, 1.88]}>
        <boxGeometry args={[0.12, 0.18, 0.12]} />
        <meshStandardMaterial color={accentColor} roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh ref={lanternRef} position={[-0.62, 0.72, 1.88]}>
        <boxGeometry args={[0.08, 0.13, 0.08]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.8} toneMapped={false} />
      </mesh>

      {/* Starboard stern lantern */}
      <mesh position={[0.62, 0.72, 1.88]}>
        <boxGeometry args={[0.12, 0.18, 0.12]} />
        <meshStandardMaterial color={accentColor} roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh ref={lantern2Ref} position={[0.62, 0.72, 1.88]}>
        <boxGeometry args={[0.08, 0.13, 0.08]} />
        <meshBasicMaterial color="#ffaa00" transparent opacity={0.75} toneMapped={false} />
      </mesh>

      {/* ═══════════════════════════════
          CYBER COCKPIT / BRIDGE DOME
      ═══════════════════════════════ */}
      <mesh position={[0, 0.52, 0.6]}>
        <boxGeometry args={[0.55, 0.28, 0.55]} />
        <meshStandardMaterial color="#06060a" roughness={0.05} metalness={1.0} />
      </mesh>
      <mesh ref={cockpitRef} position={[0, 0.55, 0.6]}>
        <boxGeometry args={[0.38, 0.18, 0.4]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.22} toneMapped={false} />
      </mesh>

      {/* Cockpit frame trim */}
      <mesh position={[0, 0.52, 0.6]}>
        <boxGeometry args={[0.58, 0.04, 0.58]} />
        {brassAccent}
      </mesh>

      {/* ═══════════════════════════════
          CYBER ENGINES (twin rear thrusters)
      ═══════════════════════════════ */}
      {/* Engine pods */}
      <mesh position={[-0.52, -0.15, 2.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.55, 12]} />
        <meshStandardMaterial color="#0a0a10" roughness={0.4} metalness={1.0} />
      </mesh>
      <mesh position={[0.52, -0.15, 2.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.55, 12]} />
        <meshStandardMaterial color="#0a0a10" roughness={0.4} metalness={1.0} />
      </mesh>

      {/* Engine glows — inner hot core */}
      <mesh ref={engineL} position={[-0.52, -0.15, 2.4]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.17, 0.45, 12]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <mesh ref={engineR} position={[0.52, -0.15, 2.4]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.17, 0.45, 12]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.9} toneMapped={false} />
      </mesh>

      {/* Engine halos — outer soft bloom */}
      <mesh ref={engineHaloL} position={[-0.52, -0.15, 2.42]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.32, 0.65, 12]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.18} toneMapped={false} side={THREE.BackSide} />
      </mesh>
      <mesh ref={engineHaloR} position={[0.52, -0.15, 2.42]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.32, 0.65, 12]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.18} toneMapped={false} side={THREE.BackSide} />
      </mesh>

      {/* Engine inner emissive rings */}
      <mesh position={[-0.52, -0.15, 2.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.58, 12, 1, true]} />
        <meshStandardMaterial color="#000" roughness={0.1} metalness={1.0}
          side={THREE.BackSide}
          emissive={new THREE.Color(glowColor)} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.52, -0.15, 2.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.58, 12, 1, true]} />
        <meshStandardMaterial color="#000" roughness={0.1} metalness={1.0}
          side={THREE.BackSide}
          emissive={new THREE.Color(glowColor)} emissiveIntensity={0.5} />
      </mesh>

      {/* ═══════════════════════════════
          CYBER HULL ACCENT STRIPS
      ═══════════════════════════════ */}
      {/* Port glowing rail */}
      <mesh position={[-0.82, 0.22, 0]} >
        <boxGeometry args={[0.02, 0.04, 3.2]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.6} toneMapped={false} />
      </mesh>
      {/* Starboard glowing rail */}
      <mesh position={[0.82, 0.22, 0]}>
        <boxGeometry args={[0.02, 0.04, 3.2]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.6} toneMapped={false} />
      </mesh>

      {/* Stern accent bar */}
      <mesh position={[0, 0.22, 2.05]}>
        <boxGeometry args={[1.55, 0.04, 0.03]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.8} toneMapped={false} />
      </mesh>

    </group>
  );
}