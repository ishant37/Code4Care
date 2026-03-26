import React from 'react';
import { Canvas } from '@react-three/fiber';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
} from '@react-three/postprocessing';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../store';
import { AlertOverlay } from './AlertOverlay';

const CameraControls = ({ camera }: any) => {
  React.useEffect(() => {
    camera.position.set(0, 25, 25);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
};

/**
 * Hospital Floor Plan - The base 2D representation with grid
 */
const FloorPlan: React.FC = () => {
  const gridRef = React.useRef<THREE.LineSegments>(null);

  const createGrid = () => {
    const points = [];
    const gridSize = 40;
    const cellSize = 2;
    const half = gridSize / 2;

    for (let i = 0; i <= gridSize / cellSize; i++) {
      const pos = -half + i * cellSize;

      // Horizontal lines
      points.push(new THREE.Vector3(-half, 0, pos));
      points.push(new THREE.Vector3(half, 0, pos));

      // Vertical lines
      points.push(new THREE.Vector3(pos, 0, -half));
      points.push(new THREE.Vector3(pos, 0, half));
    }

    return points;
  };

  const points = createGrid();
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group>
      {/* Main floor plane */}
      <mesh position={[0, -0.1, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color="#0d1a2f"
          metalness={0.3}
          roughness={0.8}
          emissive="#0a0e27"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Grid overlay */}
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#1a4d6d" linewidth={1} transparent opacity={0.4} />
      </lineSegments>

      {/* Border */}
      <lineSegments position={[0, 0.01, 0]}>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={8}
            array={new Float32Array([
              -20, 0, -20, 20, 0, -20, 20, 0, -20, 20, 0, 20, 20, 0, 20,
              -20, 0, 20, -20, 0, 20, -20, 0, -20,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#00d4ff" linewidth={2} />
      </lineSegments>
    </group>
  );
};

/**
 * Ward Footprint - interactive area that responds to hover
 */
const WardFootprint: React.FC<{
  id: string;
  name: string;
  position: [number, number, number];
  width: number;
  depth: number;
  color: string;
  status: 'normal' | 'warning' | 'critical';
}> = ({ id, name, position, width, depth, color, status, onHover }) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const hoveredWardId = useAppStore((state) => state.hoveredWardId);
  const isHovered = hoveredWardId === id;

  const getBaseColor = () => {
    switch (status) {
      case 'critical':
        return '#ff0040';
      case 'warning':
        return '#ffaa00';
      default:
        return color;
    }
  };

  const baseColor = getBaseColor();

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={() => onHover?.(id)}
      onPointerLeave={() => onHover?.(null)}
    >
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial
        color={baseColor}
        transparent
        opacity={isHovered ? 0.3 : 0.08}
        emissive={baseColor}
        emissiveIntensity={isHovered ? 0.8 : 0.2}
        wireframe={false}
      />
    </mesh>
  );
};

/**
 * 3D Ward Structure - Shows wireframe when hovered
 */
const Ward3D: React.FC<{
  id: string;
  name: string;
  position: [number, number, number];
  width: number;
  depth: number;
  height: number;
  color: string;
  status: 'normal' | 'warning' | 'critical';
}> = ({ id, name, position, width, depth, height, color, status }) => {
  const hoveredWardId = useAppStore((state) => state.hoveredWardId);
  const isHovered = hoveredWardId === id;

  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return '#ff0040';
      case 'warning':
        return '#ffaa00';
      default:
        return color;
    }
  };

  const statusColor = getStatusColor();

  if (!isHovered) return null;

  return (
    <group position={position}>
      {/* Filled wireframe box */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={statusColor}
          wireframe={true}
          emissive={statusColor}
          emissiveIntensity={1}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Solid edges for better glow */}
      <lineSegments>
        <edgeGeometry
          args={[new THREE.BoxGeometry(width, height, depth)]}
        />
        <lineBasicMaterial color={statusColor} linewidth={3} />
      </lineSegments>
    </group>
  );
};

/**
 * Main Hospital 3D Scene with Bloom effects
 */
export const Hospital3DSceneEnhanced: React.FC = () => {
  const store = useAppStore();
  const wards = store.wards;

  const handleWardHover = (wardId: string | null) => {
    store.setHoveredWardId(wardId);
  };

  return (
    <Canvas
      camera={{ position: [0, 25, 25], fov: 60 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Lights */}
      <ambientLight intensity={0.5} color="#ffffff" />
      <directionalLight
        position={[15, 20, 15]}
        intensity={0.7}
        color="#00d4ff"
      />
      <directionalLight
        position={[-15, 15, -15]}
        intensity={0.4}
        color="#ff00ff"
      />
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#00ff41" />

      {/* Floor and Grid */}
      <FloorPlan />

      {/* Hospital Wards */}
      {wards.map((ward) => (
        <group key={ward.id}>
          <WardFootprint
            id={ward.id}
            name={ward.name}
            position={ward.position}
            width={5}
            depth={5}
            color={ward.color}
            status={ward.status}
            onHover={handleWardHover}
          />
          <Ward3D
            id={ward.id}
            name={ward.name}
            position={ward.position}
            width={5}
            depth={5}
            height={4}
            color={ward.color}
            status={ward.status}
          />
        </group>
      ))}

      {/* 3D Alert Overlays */}
      <AlertOverlay />

      {/* Post-processing Effects */}
      <EffectComposer>
        <Bloom
          intensity={2}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <ChromaticAberration offset={[0.001, 0.001]} />
      </EffectComposer>
    </Canvas>
  );
};
