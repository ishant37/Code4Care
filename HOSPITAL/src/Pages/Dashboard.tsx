import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Html,
  Environment,
  MeshTransmissionMaterial,
  Float,
  Sparkles,
} from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface WardStatus {
  id: string;
  name: string;
  isAlert: boolean;
  anomalyScore: number;
  floor?: number;
  infections?: number;
  patients?: number;
}

export interface HospitalMapProps {
  selectedWard: WardStatus | null;
  alerts?: WardStatus[]; // Made optional
  onWardClick: (wardId: string) => void;
  wards?: WardStatus[];
}

interface SceneProps extends HospitalMapProps {
  floorFilter: number | null;
}

// ─── Ward config with 3D positions ───────────────────────────────────────────
const WARD_CONFIG = [
  // Floor 0 — Ground
  { id: "emergency",  name: "Emergency",      pos: [-8, 0, 8],   size: [5, 3, 4],   color: "#ff0040", floor: 0, patients: 12, infections: 3 },
  { id: "reception",  name: "Reception",      pos: [0,  0, 9],   size: [4, 2.5, 3], color: "#00d4ff", floor: 0, patients: 0,  infections: 0 },
  { id: "pharmacy",   name: "Pharmacy",       pos: [7,  0, 8],   size: [3, 2.5, 4], color: "#00ffff", floor: 0, patients: 0,  infections: 0 },
  { id: "radiology",  name: "Radiology",      pos: [-8, 0, 0],   size: [5, 3, 5],   color: "#8800ff", floor: 0, patients: 4,  infections: 1 },
  { id: "lab",        name: "Laboratory",     pos: [0,  0, 0],   size: [4, 3, 5],   color: "#ffaa00", floor: 0, patients: 0,  infections: 0 },
  { id: "surgery_1",  name: "Surgery OT-1",   pos: [7,  0, 0],   size: [4, 3, 5],   color: "#8800ff", floor: 0, patients: 2,  infections: 0 },
  { id: "ward_a",     name: "General Ward A", pos: [-8, 0, -7],  size: [5, 3, 5],   color: "#00ff41", floor: 0, patients: 18, infections: 2 },
  { id: "ward_b",     name: "General Ward B", pos: [0,  0, -7],  size: [4, 3, 5],   color: "#00ff41", floor: 0, patients: 14, infections: 1 },
  { id: "cafeteria",  name: "Cafeteria",      pos: [7,  0, -7],  size: [4, 2.5, 5], color: "#00d4ff", floor: 0, patients: 0,  infections: 0 },

  // Floor 1
  { id: "icu_1",      name: "ICU Ward 1",     pos: [-8, 4, 4],   size: [5, 3.5, 6], color: "#ff0040", floor: 1, patients: 8,  infections: 2 },
  { id: "icu_2",      name: "ICU Ward 2",     pos: [0,  4, 4],   size: [4, 3.5, 6], color: "#ff0040", floor: 1, patients: 6,  infections: 4 },
  { id: "nicu",       name: "NICU",           pos: [7,  4, 4],   size: [4, 3.5, 4], color: "#ff6600", floor: 1, patients: 4,  infections: 1 },
  { id: "surgery_2",  name: "Surgery OT-2",   pos: [-8, 4, -3],  size: [5, 3.5, 5], color: "#8800ff", floor: 1, patients: 1,  infections: 0 },
  { id: "pediatric",  name: "Pediatrics",     pos: [0,  4, -3],  size: [4, 3.5, 5], color: "#ff00ff", floor: 1, patients: 10, infections: 0 },
  { id: "maternity",  name: "Maternity",      pos: [7,  4, -3],  size: [4, 3.5, 5], color: "#ff00ff", floor: 1, patients: 7,  infections: 0 },

  // Floor 2
  { id: "oncology",   name: "Oncology",       pos: [-8, 8, 2],   size: [5, 3.5, 7], color: "#ffaa00", floor: 2, patients: 9,  infections: 1 },
  { id: "cardiology", name: "Cardiology",     pos: [1,  8, 2],   size: [6, 3.5, 7], color: "#ff0040", floor: 2, patients: 11, infections: 2 },
  { id: "neurology",  name: "Neurology",      pos: [7,  8, -4],  size: [4, 3.5, 5], color: "#00ffff", floor: 2, patients: 5,  infections: 0 },
  { id: "isolation",  name: "Isolation",      pos: [-8, 8, -4],  size: [5, 3.5, 5], color: "#ff0040", floor: 2, patients: 3,  infections: 3 },
];

// Corrido/hallway pieces
const CORRIDORS = [
  { pos: [0, 0.05, 8.5],  size: [18, 0.1, 1] },
  { pos: [0, 0.05, 0],    size: [18, 0.1, 1] },
  { pos: [0, 0.05, -7],   size: [18, 0.1, 1] },
  { pos: [-8.5, 0.05, 0], size: [1, 0.1, 18] },
  { pos: [0, 0.05, 0],    size: [1, 0.1, 18] },
  { pos: [7.5, 0.05, 0],  size: [1, 0.1, 18] },
];

// ─── Status helpers ───────────────────────────────────────────────────────────
function statusColor(score: number) {
  if (score >= 0.7) return "#ff0040";
  if (score >= 0.4) return "#ffaa00";
  return "#00ff41";
}

// ─── Animated alert ring ──────────────────────────────────────────────────────
function AlertRing({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.15;
      ref.current.scale.set(s, s, s);
      (ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.5 + Math.sin(clock.elapsedTime * 3) * 0.3;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
      <ringGeometry args={[1.2, 1.6, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Single ward building block ───────────────────────────────────────────────
interface WardBlockProps {
  config: (typeof WARD_CONFIG)[number];
  wardData?: WardStatus;
  isSelected: boolean;
  isAlert: boolean;
  onClick: () => void;
}

function WardBlock({ config, wardData, isSelected, isAlert, onClick }: WardBlockProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const score = wardData?.anomalyScore ?? 0;
  const sColor = statusColor(score);
  const wallColor = isAlert ? "#1a0008" : isSelected ? "#001a2a" : "#050e18";
  const emissiveColor = isAlert ? "#ff0040" : isSelected ? "#00d4ff" : config.color;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    if (isAlert) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.3 + Math.sin(t * 4) * 0.2;
    } else if (isSelected) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.15 + Math.sin(t * 2) * 0.05;
    } else if (hovered) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
    } else {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.04;
    }
  });

  const [w, h, d] = config.size;

  return (
    <group position={config.pos as [number, number, number]}>
      {/* Main building box */}
      <mesh
        ref={meshRef}
        castShadow receiveShadow
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerEnter={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerLeave={() => { setHovered(false); document.body.style.cursor = "default"; }}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={wallColor}
          emissive={emissiveColor}
          emissiveIntensity={0.04}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh>
        <boxGeometry args={[w + 0.02, h + 0.02, d + 0.02]} />
        <meshBasicMaterial
          color={isAlert ? "#ff0040" : isSelected ? "#00d4ff" : hovered ? config.color : "#1a3040"}
          wireframe
          transparent
          opacity={isAlert || isSelected ? 0.6 : 0.2}
        />
      </mesh>

      {/* Floor indicator strip */}
      <mesh position={[0, -h / 2 + 0.05, 0]}>
        <boxGeometry args={[w, 0.08, d]} />
        <meshBasicMaterial color={sColor} transparent opacity={0.7} />
      </mesh>

      {/* Top glow cap */}
      <mesh position={[0, h / 2 + 0.02, 0]}>
        <boxGeometry args={[w, 0.05, d]} />
        <meshBasicMaterial
          color={isAlert ? "#ff0040" : config.color}
          transparent
          opacity={isAlert || isSelected ? 0.8 : 0.15}
        />
      </mesh>

      {/* Alert ring */}
      {isAlert && (
        <group position={[0, -h / 2, 0]}>
          <AlertRing color="#ff0040" />
        </group>
      )}

      {/* Ward label */}
      <Text
        position={[0, h / 2 + 0.4, 0]}
        fontSize={0.28}
        color={isAlert ? "#ff6080" : isSelected ? "#00d4ff" : hovered ? "#e0eeff" : "#445566"}
        anchorX="center"
        anchorY="middle"
        // Uncomment the line below ONLY if you have this font in your public/fonts/ folder
        // font="/fonts/JetBrainsMono-Bold.woff"
        maxWidth={w - 0.4}
      >
        {config.name}
      </Text>

      {/* Score badge */}
      {(isAlert || isSelected || hovered) && wardData && (
        <Html
          position={[0, h / 2 + 0.9, 0]}
          center
          distanceFactor={8}
          style={{ pointerEvents: "none" }}
        >
          <div style={{
            background: "rgba(2,8,18,0.92)",
            border: `1px solid ${sColor}55`,
            borderRadius: 8,
            padding: "6px 10px",
            fontFamily: "monospace",
            fontSize: 10,
            color: sColor,
            whiteSpace: "nowrap",
            boxShadow: `0 0 16px ${sColor}33`,
            backdropFilter: "blur(4px)",
          }}>
            <div style={{ fontWeight: 800, letterSpacing: 1 }}>
              {isAlert ? "⚠ " : ""}{config.name}
            </div>
            <div style={{ color: "#667788", marginTop: 2 }}>
              Score: <span style={{ color: sColor }}>{(score * 100).toFixed(0)}%</span>
              &nbsp;·&nbsp;Pts: <span style={{ color: "#00d4ff" }}>{config.patients}</span>
              {config.infections > 0 && (
                <>&nbsp;·&nbsp;HAI: <span style={{ color: "#ff0040" }}>{config.infections}</span></>
              )}
            </div>
          </div>
        </Html>
      )}

      {/* Window grid effect */}
      {Array.from({ length: Math.floor(w / 1.2) }).map((_, xi) =>
        Array.from({ length: Math.floor(h / 1.2) }).map((_, yi) => (
          <mesh
            key={`${xi}-${yi}`}
            position={[
              -w / 2 + 0.8 + xi * 1.2,
              -h / 2 + 0.8 + yi * 1.2,
              d / 2 + 0.01,
            ]}
          >
            <planeGeometry args={[0.55, 0.55]} />
            <meshBasicMaterial
              color={isAlert && Math.random() > 0.5 ? "#ff2040" : config.color}
              transparent
              opacity={0.12 + Math.random() * 0.08}
            />
          </mesh>
        ))
      )}
    </group>
  );
}

// ─── Floor plate ──────────────────────────────────────────────────────────────
function FloorPlate({ y, label }: { y: number; label: string }) {
  return (
    <group position={[0, y, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[22, 0.2, 22]} />
        <meshStandardMaterial
          color="#030c18"
          metalness={0.8}
          roughness={0.4}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* Grid lines */}
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[22, 0.01, 22]} />
        <meshBasicMaterial color="#0a2030" wireframe />
      </mesh>
      <Text
        position={[-11.5, 0.3, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="#1a3040"
        anchorX="left"
      >
        {label}
      </Text>
    </group>
  );
}

// ─── Central elevator shaft ───────────────────────────────────────────────────
function ElevatorShaft() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (ref.current) {
      (ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.3 + Math.sin(clock.elapsedTime * 1.5) * 0.1;
    }
  });
  return (
    <group position={[-1, 6, 1]}>
      <mesh>
        <boxGeometry args={[1.5, 14, 1.5]} />
        <meshStandardMaterial color="#001824" metalness={0.9} roughness={0.1} transparent opacity={0.7} />
      </mesh>
      <mesh ref={ref}>
        <boxGeometry args={[1.6, 14.1, 1.6]} />
        <meshBasicMaterial color="#00d4ff" wireframe transparent opacity={0.3} />
      </mesh>
      <Text position={[0, 7.5, 0.85]} fontSize={0.2} color="#00d4ff44">LIFT</Text>
    </group>
  );
}

// ─── Particle system for alert areas ─────────────────────────────────────────
function AlertParticles({ positions }: { positions: [number, number, number][] }) {
  return (
    <>
      {positions.map((pos, i) => (
        <Sparkles
          key={i}
          position={pos}
          count={20}
          scale={4}
          size={1.5}
          speed={0.4}
          color="#ff0040"
          opacity={0.6}
        />
      ))}
    </>
  );
}

// ─── Ground plane & grid ──────────────────────────────────────────────────────
function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#010710" metalness={0.1} roughness={0.9} />
      </mesh>
      {/* Grid */}
      <gridHelper args={[60, 60, "#0a1820", "#0a1820"]} position={[0, -0.48, 0]} />
    </group>
  );
}

// ─── Ambient lights ───────────────────────────────────────────────────────────
function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight position={[10, 20, 10]} intensity={1.2} color="#ffffff" castShadow />
      <pointLight position={[0, 20, 0]} intensity={2} color="#00d4ff" distance={40} />
    </>
  );
}

// ─── Camera controller ────────────────────────────────────────────────────────
function CameraRig({ selectedWard }: { selectedWard: WardStatus | null }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!selectedWard) return;
    const config = WARD_CONFIG.find(w => w.id === selectedWard.id);
    if (!config) return;
    const target = new THREE.Vector3(...(config.pos as [number, number, number]));
    // soft camera approach could be added with GSAP; for now just note target
  }, [selectedWard]);

  return null;
}

// ─── Main 3D scene ────────────────────────────────────────────────────────────
function Scene({ selectedWard, alerts = [], onWardClick, wards = [], floorFilter }: SceneProps) {
  const alertIds = useMemo(() => new Set(alerts.map(a => a.id)), [alerts]);
  const wardMap  = useMemo(() => {
    const m: Record<string, WardStatus> = {};
    wards.forEach(w => { m[w.id] = w; });
    return m;
  }, [wards]);

  const alertPositions = useMemo(
    () =>
      WARD_CONFIG.filter(w => alertIds.has(w.id)).map(
        w => [w.pos[0], w.pos[1] + w.size[1] / 2 + 1, w.pos[2]] as [number, number, number]
      ),
    [alertIds]
  );

  return (
    <>
      <Lights />
      <CameraRig selectedWard={selectedWard} />
      <Ground />

      {/* Floor plates - Only show if floorFilter matches or is null */}
      {(floorFilter === null || floorFilter === 0) && <FloorPlate y={-0.1} label="GROUND FLOOR" />}
      {(floorFilter === null || floorFilter === 1) && <FloorPlate y={3.9}  label="FLOOR 1" />}
      {(floorFilter === null || floorFilter === 2) && <FloorPlate y={7.9}  label="FLOOR 2" />}

      {/* Elevator */}
      <ElevatorShaft />

      {/* Alert particles */}
      <AlertParticles positions={alertPositions} />

      {/* All ward blocks - filtered by floorFilter */}
      {WARD_CONFIG
        .filter(config => floorFilter === null || config.floor === floorFilter)
        .map(config => {
        const wd = wardMap[config.id];
        const overrideAlertScore = alerts.find(a => a.id === config.id);
        const effectiveWard: WardStatus = wd ?? {
          id: config.id,
          name: config.name,
          isAlert: alertIds.has(config.id),
          anomalyScore: overrideAlertScore
            ? overrideAlertScore.anomalyScore
            : config.infections > 2
            ? 0.75
            : config.infections > 0
            ? 0.5
            : 0.15,
          patients: config.patients,
          infections: config.infections,
        };

        return (
          <WardBlock
            key={config.id}
            config={config}
            wardData={effectiveWard}
            isSelected={selectedWard?.id === config.id}
            isAlert={alertIds.has(config.id)}
            onClick={() => onWardClick(config.id)}
          />
        );
      })}

      {/* Post processing */}
      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          blendFunction={BlendFunction.SCREEN}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0005, 0.0005] as unknown as THREE.Vector2}
        />
      </EffectComposer>
    </>
  );
}

// ─── Exported Map component ───────────────────────────────────────────────────
export const HospitalMap: React.FC<HospitalMapProps> = ({
  selectedWard,
  alerts = [],
  onWardClick,
  wards = [],
}) => {
  const [floorFilter, setFloorFilter] = useState<number | null>(null);

  return (
    // Changed height from "100%" to "100vh" to ensure it actually renders on screen
    <div style={{ width: "100%", height: "100vh", position: "relative", background: "#020a14" }}>
      {/* Floor filter pills */}
      <div style={{
        position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
        zIndex: 10, display: "flex", gap: 6,
        background: "rgba(2,8,18,0.85)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(0,212,255,0.15)", borderRadius: 10, padding: "6px 10px",
      }}>
        {[
          { label: "ALL FLOORS", val: null },
          { label: "GND",        val: 0 },
          { label: "F1",         val: 1 },
          { label: "F2",         val: 2 },
        ].map(f => (
          <button
            key={String(f.val)}
            onClick={() => setFloorFilter(f.val)}
            style={{
              padding: "4px 12px", fontSize: 9, fontWeight: 700,
              letterSpacing: 1, fontFamily: "monospace", cursor: "pointer",
              border: "1px solid",
              borderColor: floorFilter === f.val ? "rgba(0,212,255,0.5)" : "transparent",
              background: floorFilter === f.val ? "rgba(0,212,255,0.12)" : "transparent",
              color: floorFilter === f.val ? "#00d4ff" : "#445566",
              borderRadius: 6, transition: "all 0.2s",
            }}
          >{f.label}</button>
        ))}
      </div>

      {/* Ward count */}
      <div style={{
        position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
        zIndex: 10, fontSize: 9, color: "#334455",
        fontFamily: "monospace", letterSpacing: 2,
        background: "rgba(2,8,18,0.7)", padding: "4px 12px", borderRadius: 6,
        border: "1px solid rgba(0,212,255,0.08)",
      }}>
        {WARD_CONFIG.length} ROOMS · 3 FLOORS · INTERACTIVE 3D
      </div>

      <Canvas
        shadows
        camera={{ position: [18, 18, 18], fov: 50, near: 0.1, far: 200 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.8 }}
        style={{ background: "#020a14" }}
      >
        {/* Added Suspense boundary for Text / Html components */}
        <Suspense fallback={
          <Html center>
            <div style={{ color: "#00d4ff", fontFamily: "monospace" }}>Loading 3D Map...</div>
          </Html>
        }>
          <Scene
            selectedWard={selectedWard}
            alerts={alerts}
            onWardClick={onWardClick}
            wards={wards}
            floorFilter={floorFilter} // Pass filter state to scene
          />
        </Suspense>
        
        <OrbitControls
          makeDefault
          minDistance={8}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2.1}
          enablePan
          panSpeed={0.8}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          target={[0, 4, 0]}
        />
      </Canvas>
    </div>
  );
};

export default HospitalMap;
export { WARD_CONFIG };