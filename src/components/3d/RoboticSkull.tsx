import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Palette ────────────────────────────────────────────────────────────────
const STEEL_DARK = "#3a3a42";   // was #1c1c1e — visible base panels
const STEEL_MID = "#5a5a64";   // was #2e2e32 — mid surfaces
const STEEL_LIGHT = "#7a7a88";   // was #3e3e44 — raised highlight panels
const STEEL_CHROME = "#c0c0cc";   // was #6a6a72 — sharp specular edges
const PANEL_EDGE = "#8a8a98";   // was #4a4a52 — seam lines
const EYE_CORE = "#00ffff";
const EYE_MID = "#00e0ff";
const EYE_OUTER = "#0099ff";
const SCAN_COLOR = "#00ffff";
const CIRCUIT = "#00ffee";
const ACCENT_RED = "#ff2244";
const TOOTH_COLOR = "#6a6a74";   // was #3a3a40 — teeth now visible

export function RoboticSkull(props: any) {
  const group = useRef<THREE.Group>(null);
  const jawRef = useRef<THREE.Group>(null);
  const eyeLCoreRef = useRef<THREE.Mesh>(null);
  const eyeRCoreRef = useRef<THREE.Mesh>(null);
  const eyeLRingRef = useRef<THREE.Mesh>(null);
  const eyeRRingRef = useRef<THREE.Mesh>(null);
  const eyeLHaloRef = useRef<THREE.Mesh>(null);
  const eyeRHaloRef = useRef<THREE.Mesh>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);
  const crownGlowRef = useRef<THREE.Mesh>(null);
  const cheekLRef = useRef<THREE.Mesh>(null);
  const cheekRRef = useRef<THREE.Mesh>(null);
  const templeCircLRef = useRef<THREE.Mesh>(null);
  const templeCircRRef = useRef<THREE.Mesh>(null);
  const jawGlowRef = useRef<THREE.Mesh>(null);

  // Scan line travels from top to bottom of the skull
  const scanY = useRef(1.6);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    // ── FLOAT + SLOW DRIFT ──────────────────────────────────────────────────
    if (group.current) {
      group.current.position.y = Math.sin(t * 0.9) * 0.12 + Math.sin(t * 2.1) * 0.025;
      group.current.rotation.y = Math.sin(t * 0.4) * 0.18;
      group.current.rotation.z = Math.sin(t * 0.65) * 0.022;
    }

    // ── JAW: micro-clench ───────────────────────────────────────────────────
    if (jawRef.current) {
      // Sharp, mechanical — occasional twitch down then back
      const clench = Math.max(0, Math.sin(t * 1.8)) * 0.035 + Math.sin(t * 0.7) * 0.012;
      jawRef.current.position.y = -clench;
      jawRef.current.rotation.x = clench * 0.4;
    }

    // ── EYE CORES: fast scan pulse ─────────────────────────────────────────
    const eyePulse = 0.7 + Math.sin(t * 6.0) * 0.3;
    const eyeFlicker = 1.0 + Math.sin(t * 47) * 0.04; // high-freq flicker
    if (eyeLCoreRef.current) {
      (eyeLCoreRef.current.material as THREE.MeshBasicMaterial).opacity = eyePulse * eyeFlicker;
    }
    if (eyeRCoreRef.current) {
      // Slight phase offset — eyes never pulse perfectly in sync
      const rPulse = 0.7 + Math.sin(t * 6.0 + 0.8) * 0.3;
      (eyeRCoreRef.current.material as THREE.MeshBasicMaterial).opacity = rPulse * eyeFlicker;
    }

    // ── EYE RINGS: slower breathing ─────────────────────────────────────────
    const ringOpacity = 0.4 + Math.sin(t * 2.5) * 0.35;
    if (eyeLRingRef.current) (eyeLRingRef.current.material as THREE.MeshBasicMaterial).opacity = ringOpacity;
    if (eyeRRingRef.current) (eyeRRingRef.current.material as THREE.MeshBasicMaterial).opacity = ringOpacity + Math.sin(t * 1.1) * 0.1;

    // ── EYE HALOS: very slow bloom pulse ───────────────────────────────────
    const haloOp = 0.06 + Math.sin(t * 1.4) * 0.05;
    if (eyeLHaloRef.current) (eyeLHaloRef.current.material as THREE.MeshBasicMaterial).opacity = haloOp;
    if (eyeRHaloRef.current) (eyeRHaloRef.current.material as THREE.MeshBasicMaterial).opacity = haloOp;

    // ── SCAN LINE: sweeps top → bottom, resets ─────────────────────────────
    scanY.current -= 0.015;
    if (scanY.current < -1.4) scanY.current = 1.6;
    if (scanLineRef.current) {
      scanLineRef.current.position.y = scanY.current;
      (scanLineRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.38 + Math.sin(t * 3) * 0.12;
    }

    // ── CROWN GLOW: slow energy build ──────────────────────────────────────
    if (crownGlowRef.current) {
      (crownGlowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.18 + Math.sin(t * 1.2) * 0.12;
    }

    // ── CHEEK PANELS: status breathing ─────────────────────────────────────
    if (cheekLRef.current) {
      (cheekLRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.45 + Math.sin(t * 2.2) * 0.3;
    }
    if (cheekRRef.current) {
      (cheekRRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.45 + Math.sin(t * 2.2 + Math.PI) * 0.3;
    }

    // ── TEMPLE DISCS: counter-rotate slowly ────────────────────────────────
    if (templeCircLRef.current) templeCircLRef.current.rotation.z = t * 0.4;
    if (templeCircRRef.current) templeCircRRef.current.rotation.z = -t * 0.4;

    // ── JAW GLOW: pulses with jaw clench ───────────────────────────────────
    if (jawGlowRef.current) {
      (jawGlowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.35 + Math.sin(t * 1.8) * 0.28;
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>

      {/* ════════════════════════════════════════════
          CRANIUM — layered steel panels
      ════════════════════════════════════════════ */}

      {/* Core cranium volume */}
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[2.05, 1.75, 2.1]} />
        <meshStandardMaterial color={STEEL_DARK} roughness={0.12} metalness={0.98}
          emissive={new THREE.Color(STEEL_DARK)} emissiveIntensity={0.55} />
      </mesh>

      {/* Top dome — rounds off the box cranium */}
      <mesh position={[0, 1.22, 0]}>
        <sphereGeometry args={[1.06, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={STEEL_MID} roughness={0.08} metalness={1.0}
          emissive={new THREE.Color(STEEL_MID)} emissiveIntensity={0.4} />
      </mesh>

      {/* Crown accent ring */}
      <mesh position={[0, 1.22, 0]}>
        <torusGeometry args={[1.06, 0.028, 8, 48]} />
        <meshStandardMaterial color={STEEL_CHROME} roughness={0.03} metalness={1}
          emissive={new THREE.Color(STEEL_CHROME)} emissiveIntensity={0.5} />
      </mesh>

      {/* Forehead brow ridge — overhangs eye sockets */}
      <mesh position={[0, 0.62, 1.04]}>
        <boxGeometry args={[1.82, 0.18, 0.18]} />
        <meshStandardMaterial color={STEEL_MID} roughness={0.1} metalness={0.99}
          emissive={new THREE.Color(STEEL_MID)} emissiveIntensity={0.35} />
      </mesh>
      {/* Brow chrome edge */}
      <mesh position={[0, 0.53, 1.09]}>
        <boxGeometry args={[1.84, 0.035, 0.06]} />
        <meshStandardMaterial color={STEEL_CHROME} roughness={0.03} metalness={1}
          emissive={new THREE.Color(STEEL_CHROME)} emissiveIntensity={0.6} />
      </mesh>

      {/* Forehead centre plate */}
      <mesh position={[0, 0.95, 1.04]}>
        <boxGeometry args={[0.72, 0.42, 0.12]} />
        <meshStandardMaterial color={STEEL_LIGHT} roughness={0.1} metalness={0.98}
          emissive={new THREE.Color(STEEL_LIGHT)} emissiveIntensity={0.3} />
      </mesh>

      {/* Forehead panel seam lines */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x, 0.95, 1.1]}>
          <boxGeometry args={[0.03, 0.38, 0.02]} />
          <meshStandardMaterial color={PANEL_EDGE} roughness={0.15} metalness={0.95}
            emissive={new THREE.Color(PANEL_EDGE)} emissiveIntensity={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.78, 1.1]}>
        <boxGeometry args={[0.7, 0.025, 0.02]} />
        <meshStandardMaterial color={PANEL_EDGE} roughness={0.15} metalness={0.95}
          emissive={new THREE.Color(PANEL_EDGE)} emissiveIntensity={0.4} />
      </mesh>

      {/* Side skull plates — left & right */}
      <mesh position={[-1.0, 0.48, 0]}>
        <boxGeometry args={[0.08, 1.4, 1.8]} />
        <meshStandardMaterial color={STEEL_LIGHT} roughness={0.08} metalness={1.0}
          emissive={new THREE.Color(STEEL_LIGHT)} emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[1.0, 0.48, 0]}>
        <boxGeometry args={[0.08, 1.4, 1.8]} />
        <meshStandardMaterial color={STEEL_LIGHT} roughness={0.08} metalness={1.0}
          emissive={new THREE.Color(STEEL_LIGHT)} emissiveIntensity={0.45} />
      </mesh>

      {/* Cheek panel insets — darker recessed area */}
      <mesh position={[-0.78, 0.05, 0.82]}>
        <boxGeometry args={[0.38, 0.52, 0.3]} />
        <meshStandardMaterial color={STEEL_DARK} roughness={0.35} metalness={0.88} />
      </mesh>
      <mesh position={[0.78, 0.05, 0.82]}>
        <boxGeometry args={[0.38, 0.52, 0.3]} />
        <meshStandardMaterial color={STEEL_DARK} roughness={0.35} metalness={0.88} />
      </mesh>

      {/* Cheek circuit glow overlay */}
      <mesh ref={cheekLRef} position={[-0.78, 0.05, 0.98]}>
        <planeGeometry args={[0.3, 0.42]} />
        <meshBasicMaterial color={CIRCUIT} transparent opacity={0.25} toneMapped={false} />
      </mesh>
      <mesh ref={cheekRRef} position={[0.78, 0.05, 0.98]}>
        <planeGeometry args={[0.3, 0.42]} />
        <meshBasicMaterial color={CIRCUIT} transparent opacity={0.25} toneMapped={false} />
      </mesh>

      {/* ════════════════════════════════════════════
          TEMPLE DISCS — mechanical spinning plates
      ════════════════════════════════════════════ */}
      {/* Left temple housing */}
      <mesh position={[-1.06, 0.38, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.1, 24]} />
        <meshStandardMaterial color={STEEL_MID} roughness={0.08} metalness={1.0}
          emissive={new THREE.Color(STEEL_MID)} emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={templeCircLRef} position={[-1.12, 0.38, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.25, 0.04, 6, 18]} />
        <meshStandardMaterial color={STEEL_CHROME} roughness={0.03} metalness={1}
          emissive={new THREE.Color(CIRCUIT)} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[-1.12, 0.38, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 12]} />
        <meshStandardMaterial color={EYE_CORE} roughness={0.03} metalness={0.5}
          emissive={new THREE.Color(EYE_CORE)} emissiveIntensity={2.5} />
      </mesh>

      {/* Right temple housing */}
      <mesh position={[1.06, 0.38, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.1, 24]} />
        <meshStandardMaterial color={STEEL_MID} roughness={0.08} metalness={1.0}
          emissive={new THREE.Color(STEEL_MID)} emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={templeCircRRef} position={[1.12, 0.38, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.25, 0.04, 6, 18]} />
        <meshStandardMaterial color={STEEL_CHROME} roughness={0.03} metalness={1}
          emissive={new THREE.Color(CIRCUIT)} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[1.12, 0.38, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 12]} />
        <meshStandardMaterial color={EYE_CORE} roughness={0.03} metalness={0.5}
          emissive={new THREE.Color(EYE_CORE)} emissiveIntensity={2.5} />
      </mesh>

      {/* ════════════════════════════════════════════
          EYE SOCKETS — deep recessed voids
      ════════════════════════════════════════════ */}
      {/* Left socket housing */}
      <mesh position={[-0.52, 0.18, 1.0]}>
        <boxGeometry args={[0.7, 0.62, 0.22]} />
        <meshStandardMaterial color={STEEL_LIGHT} roughness={0.2} metalness={0.95} />
      </mesh>
      {/* Left socket void */}
      <mesh position={[-0.52, 0.18, 1.08]}>
        <boxGeometry args={[0.58, 0.5, 0.14]} />
        <meshStandardMaterial color="#020206" roughness={1} metalness={0} />
      </mesh>
      {/* Left socket chrome rim */}
      <mesh position={[-0.52, 0.18, 1.09]}>
        <ringGeometry args={[0.26, 0.3, 32]} />
        <meshStandardMaterial color={STEEL_CHROME} roughness={0.04} metalness={1} />
      </mesh>

      {/* Right socket housing */}
      <mesh position={[0.52, 0.18, 1.0]}>
        <boxGeometry args={[0.7, 0.62, 0.22]} />
        <meshStandardMaterial color={STEEL_LIGHT} roughness={0.2} metalness={0.95} />
      </mesh>
      {/* Right socket void */}
      <mesh position={[0.52, 0.18, 1.08]}>
        <boxGeometry args={[0.58, 0.5, 0.14]} />
        <meshStandardMaterial color="#020206" roughness={1} metalness={0} />
      </mesh>
      {/* Right socket chrome rim */}
      <mesh position={[0.52, 0.18, 1.09]}>
        <ringGeometry args={[0.26, 0.3, 32]} />
        <meshStandardMaterial color={STEEL_CHROME} roughness={0.04} metalness={1} />
      </mesh>

      {/* Left eye — outer ring glow */}
      <mesh ref={eyeLRingRef} position={[-0.52, 0.18, 1.1]}>
        <ringGeometry args={[0.18, 0.26, 32]} />
        <meshBasicMaterial color={EYE_MID} transparent opacity={0.4} toneMapped={false} />
      </mesh>
      {/* Left eye — inner iris disc */}
      <mesh position={[-0.52, 0.18, 1.11]}>
        <circleGeometry args={[0.17, 32]} />
        <meshStandardMaterial color={EYE_OUTER} roughness={0.1} metalness={0.3}
          emissive={new THREE.Color(EYE_OUTER)} emissiveIntensity={0.6} />
      </mesh>
      {/* Left eye — bright core */}
      <mesh ref={eyeLCoreRef} position={[-0.52, 0.18, 1.13]}>
        <circleGeometry args={[0.09, 32]} />
        <meshBasicMaterial color={EYE_CORE} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      {/* Left eye — pupil slit */}
      <mesh position={[-0.52, 0.18, 1.135]}>
        <boxGeometry args={[0.03, 0.14, 0.001]} />
        <meshBasicMaterial color="#000010" />
      </mesh>
      {/* Left eye — bloom halo */}
      <mesh ref={eyeLHaloRef} position={[-0.52, 0.18, 1.08]}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color={EYE_CORE} transparent opacity={0.06} toneMapped={false} />
      </mesh>

      {/* Right eye — outer ring glow */}
      <mesh ref={eyeRRingRef} position={[0.52, 0.18, 1.1]}>
        <ringGeometry args={[0.18, 0.26, 32]} />
        <meshBasicMaterial color={EYE_MID} transparent opacity={0.4} toneMapped={false} />
      </mesh>
      {/* Right eye — inner iris disc */}
      <mesh position={[0.52, 0.18, 1.11]}>
        <circleGeometry args={[0.17, 32]} />
        <meshStandardMaterial color={EYE_OUTER} roughness={0.1} metalness={0.3}
          emissive={new THREE.Color(EYE_OUTER)} emissiveIntensity={0.6} />
      </mesh>
      {/* Right eye — bright core */}
      <mesh ref={eyeRCoreRef} position={[0.52, 0.18, 1.13]}>
        <circleGeometry args={[0.09, 32]} />
        <meshBasicMaterial color={EYE_CORE} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      {/* Right eye — pupil slit */}
      <mesh position={[0.52, 0.18, 1.135]}>
        <boxGeometry args={[0.03, 0.14, 0.001]} />
        <meshBasicMaterial color="#000010" />
      </mesh>
      {/* Right eye — bloom halo */}
      <mesh ref={eyeRHaloRef} position={[0.52, 0.18, 1.08]}>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color={EYE_CORE} transparent opacity={0.06} toneMapped={false} />
      </mesh>

      {/* ════════════════════════════════════════════
          NOSE CAVITY — triangular vented recess
      ════════════════════════════════════════════ */}
      <mesh position={[0, -0.22, 1.06]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.14, 0.22, 3, 1]} />
        <meshStandardMaterial color="#030308" roughness={0.9} metalness={0} />
      </mesh>
      {/* Nose bridge plate */}
      <mesh position={[0, 0.04, 1.04]}>
        <boxGeometry args={[0.22, 0.32, 0.1]} />
        <meshStandardMaterial color={STEEL_MID} roughness={0.18} metalness={0.96} />
      </mesh>

      {/* ════════════════════════════════════════════
          SCAN LINE — top-to-bottom sweep
      ════════════════════════════════════════════ */}
      <mesh ref={scanLineRef} position={[0, 1.6, 1.06]}>
        <planeGeometry args={[2.1, 0.04]} />
        <meshBasicMaterial color={SCAN_COLOR} transparent opacity={0.18} toneMapped={false} />
      </mesh>

      {/* Crown energy glow disc */}
      <mesh ref={crownGlowRef} position={[0, 1.25, 0]}>
        <circleGeometry args={[1.0, 48]} />
        <meshBasicMaterial color={EYE_CORE} transparent opacity={0.08} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* ════════════════════════════════════════════
          JAW — articulated mechanical lower face
      ════════════════════════════════════════════ */}
      <group ref={jawRef} position={[0, 0, 0]}>

        {/* Main jaw body */}
        <mesh position={[0, -0.82, 0.05]}>
          <boxGeometry args={[1.88, 0.7, 1.95]} />
          <meshStandardMaterial color={STEEL_DARK} roughness={0.1} metalness={0.99}
            emissive={new THREE.Color(STEEL_DARK)} emissiveIntensity={0.55} />
        </mesh>

        {/* Jaw chin plate — slightly lighter, bevelled feel */}
        <mesh position={[0, -1.14, 0.2]}>
          <boxGeometry args={[1.5, 0.22, 1.55]} />
          <meshStandardMaterial color={STEEL_MID} roughness={0.08} metalness={1.0}
            emissive={new THREE.Color(STEEL_MID)} emissiveIntensity={0.4} />
        </mesh>

        {/* Jaw chrome lower edge */}
        <mesh position={[0, -1.26, 0.2]}>
          <boxGeometry args={[1.5, 0.035, 1.55]} />
          <meshStandardMaterial color={STEEL_CHROME} roughness={0.03} metalness={1}
            emissive={new THREE.Color(STEEL_CHROME)} emissiveIntensity={0.6} />
        </mesh>

        {/* Jaw side cheekbone flanges */}
        <mesh position={[-0.96, -0.72, 0.1]}>
          <boxGeometry args={[0.07, 0.55, 1.7]} />
          <meshStandardMaterial color={STEEL_LIGHT} roughness={0.08} metalness={1.0}
            emissive={new THREE.Color(STEEL_LIGHT)} emissiveIntensity={0.45} />
        </mesh>
        <mesh position={[0.96, -0.72, 0.1]}>
          <boxGeometry args={[0.07, 0.55, 1.7]} />
          <meshStandardMaterial color={STEEL_LIGHT} roughness={0.08} metalness={1.0}
            emissive={new THREE.Color(STEEL_LIGHT)} emissiveIntensity={0.45} />
        </mesh>

        {/* Teeth grill — 7 individual segments */}
        {Array.from({ length: 7 }).map((_, i) => {
          const x = (i - 3) * 0.24;
          const isCanine = i === 0 || i === 6;
          return (
            <React.Fragment key={i}>
              {/* Upper tooth */}
              <mesh position={[x, -0.44, 1.02]}>
                <boxGeometry args={[0.17, isCanine ? 0.32 : 0.24, 0.12]} />
                <meshStandardMaterial color={TOOTH_COLOR} roughness={0.12} metalness={0.98}
                  emissive={new THREE.Color(TOOTH_COLOR)} emissiveIntensity={0.5} />
              </mesh>
              {/* Lower tooth */}
              <mesh position={[x, -0.72, 1.02]}>
                <boxGeometry args={[0.17, isCanine ? 0.3 : 0.22, 0.12]} />
                <meshStandardMaterial color={TOOTH_COLOR} roughness={0.12} metalness={0.98}
                  emissive={new THREE.Color(TOOTH_COLOR)} emissiveIntensity={0.5} />
              </mesh>
              {/* Tooth chrome tip */}
              <mesh position={[x, isCanine ? -0.3 : -0.33, 1.06]}>
                <boxGeometry args={[0.12, 0.04, 0.04]} />
                <meshStandardMaterial color={STEEL_CHROME} roughness={0.03} metalness={1}
                  emissive={new THREE.Color(STEEL_CHROME)} emissiveIntensity={0.7} />
              </mesh>
            </React.Fragment>
          );
        })}

        {/* Tooth gap grill darkness */}
        <mesh position={[0, -0.58, 1.0]}>
          <boxGeometry args={[1.6, 0.14, 0.08]} />
          <meshStandardMaterial color="#010104" roughness={1} metalness={0} />
        </mesh>

        {/* Jaw inner glow — energy conduit */}
        <mesh ref={jawGlowRef} position={[0, -0.58, 0.92]}>
          <boxGeometry args={[1.5, 0.08, 0.04]} />
          <meshBasicMaterial color={EYE_CORE} transparent opacity={0.15} toneMapped={false} />
        </mesh>

        {/* Jaw vent slots — left side */}
        {[0, 0.28, 0.56].map((z, i) => (
          <mesh key={i} position={[-0.7, -0.95, 0.6 - z]}>
            <boxGeometry args={[0.22, 0.055, 0.16]} />
            <meshStandardMaterial color="#040408" roughness={0.9} metalness={0.1} />
          </mesh>
        ))}
        {/* Jaw vent slots — right side */}
        {[0, 0.28, 0.56].map((z, i) => (
          <mesh key={i} position={[0.7, -0.95, 0.6 - z]}>
            <boxGeometry args={[0.22, 0.055, 0.16]} />
            <meshStandardMaterial color="#040408" roughness={0.9} metalness={0.1} />
          </mesh>
        ))}

      </group>

      {/* ════════════════════════════════════════════
          NECK COLUMN — vertebrae stack
      ════════════════════════════════════════════ */}
      {[0, 0.22, 0.44].map((y, i) => (
        <mesh key={i} position={[0, -1.32 - y, -0.3]}>
          <cylinderGeometry args={[0.28 - i * 0.03, 0.3 - i * 0.03, 0.18, 12]} />
          <meshStandardMaterial color={STEEL_MID} roughness={0.08} metalness={1.0}
            emissive={new THREE.Color(STEEL_MID)} emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* Neck emissive ring — top vertebra */}
      <mesh position={[0, -1.32, -0.3]}>
        <torusGeometry args={[0.28, 0.022, 6, 20]} />
        <meshStandardMaterial color={EYE_CORE} roughness={0.03} metalness={0.5}
          emissive={new THREE.Color(EYE_CORE)} emissiveIntensity={2.0} />
      </mesh>

      {/* ════════════════════════════════════════════
          BACK OF SKULL — port & coolant details
      ════════════════════════════════════════════ */}
      {/* Central spine ridge */}
      <mesh position={[0, 0.55, -1.07]}>
        <boxGeometry args={[0.18, 1.1, 0.1]} />
        <meshStandardMaterial color={STEEL_LIGHT} roughness={0.08} metalness={1.0}
          emissive={new THREE.Color(STEEL_LIGHT)} emissiveIntensity={0.5} />
      </mesh>

      {/* Exhaust vents — back */}
      {[-0.55, 0.55].map((x, i) => (
        <React.Fragment key={i}>
          <mesh position={[x, 0.4, -1.07]}>
            <boxGeometry args={[0.3, 0.55, 0.1]} />
            <meshStandardMaterial color={STEEL_MID} roughness={0.1} metalness={0.99}
              emissive={new THREE.Color(STEEL_MID)} emissiveIntensity={0.35} />
          </mesh>
          {[0.14, 0, -0.14].map((dy, j) => (
            <mesh key={j} position={[x, 0.4 + dy, -1.12]}>
              <boxGeometry args={[0.22, 0.055, 0.06]} />
              <meshStandardMaterial color="#020205" roughness={0.9} metalness={0} />
            </mesh>
          ))}
        </React.Fragment>
      ))}

      {/* Data port — back centre */}
      <mesh position={[0, -0.1, -1.07]}>
        <boxGeometry args={[0.45, 0.2, 0.1]} />
        <meshStandardMaterial color={STEEL_MID} roughness={0.08} metalness={1.0}
          emissive={new THREE.Color(STEEL_MID)} emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, -0.1, -1.13]}>
        <boxGeometry args={[0.35, 0.1, 0.04]} />
        <meshBasicMaterial color={EYE_CORE} toneMapped={false} />
      </mesh>

    </group>
  );
}