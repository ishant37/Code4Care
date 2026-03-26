import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../store';

const CameraControls = () => {
  const { camera } = useThree();
  const controls = useRef<any>(null);

  useEffect(() => {
    camera.position.set(0, 25, 25);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
};

import { useThree } from '@react-three/fiber';

/**
 * Hospital Floor Plan - The base 2D representation
 */
const FloorPlan: React.FC = () => {
  return (
    <group>
      {/* Main floor plane */}
      <mesh position={[0, -0.1, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color="#1a2847"
          metalness={0.2}
          roughness={0.8}
          emissive="#0d1a2f"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Grid overlay */}
      <Grid gridSize={40} cellSize={2} />

      {/* Border */}
      <mesh position={[0, 0, 0]}>
        <edgeGeometry
          args={[
            new THREE.PlaneGeometry(40, 40),
          ]}
        />
        <lineBasicMaterial color="#00d4ff" linewidth={2} />
      </mesh>
    </group>
  );
};

/**
 * Grid helper for the floor plan
 */
const Grid: React.FC<{ gridSize: number; cellSize: number }> = ({
  gridSize,
  cellSize,
}) => {
  const points = [];
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

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#1a4d6d" linewidth={1} transparent opacity={0.3} />
    </lineSegments>
  );
};

/**
 * Ward Footprint - invisible by default, shows on hover
 */
const WardFootprint: React.FC<{
  id: string;
  name: string;
  position: [number, number, number];
  width: number;
  depth: number;
  color: string;
  onHover: (id: string | null) => void;
}> = ({ id, name, position, width, depth, color, onHover }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const hoveredWardId = useAppStore((state) => state.hoveredWardId);
  const isHovered = hoveredWardId === id;

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={() => onHover(id)}
      onPointerLeave={() => onHover(null)}
      userData={{ wardId: id, wardName: name }}
    >
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={isHovered ? 0.2 : 0.05}
        emissive={color}
        emissiveIntensity={isHovered ? 0.5 : 0.1}
        wireframe={false}
      />
    </mesh>
  );
};

/**
 * 3D Ward Structure - Wireframe with neon effect
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

  // Determine color based on status
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

  return (
    <group position={position} visible={isHovered}>
      {/* Main structure - wireframe box */}
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={statusColor}
          wireframe={true}
          linewidth={2}
          emissive={statusColor}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Glowing edges */}
      <lineSegments>
        <edgeGeometry
          args={[
            new THREE.BoxGeometry(width, height, depth),
          ]}
        />
        <lineBasicMaterial color={statusColor} linewidth={2} />
      </lineSegments>
    </group>
  );
};

/**
 * Main 3D Hospital Visualization Component
 */
export const Hospital3DScene: React.FC = () => {
  const store = useAppStore();
  const hoveredWardId = store.hoveredWardId;

  const handleWardHover = (wardId: string | null) => {
    store.setHoveredWardId(wardId);
  };

  return (
    <Canvas
      camera={{ position: [0, 25, 25], fov: 75 }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight position={[10, 20, 10]} intensity={0.8} color="#00d4ff" />
      <pointLight position={[-10, 10, -10]} intensity={0.4} color="#8800ff" />

      {/* Floor and grid */}
      <FloorPlan />

      {/* Ward footprints and 3D models */}
      {store.wards.map((ward) => (
        <group key={ward.id}>
          {/* Footprint */}
          <WardFootprint
            id={ward.id}
            name={ward.name}
            position={ward.position}
            width={5}
            depth={5}
            color={ward.color}
            onHover={handleWardHover}
          />

          {/* 3D Ward structure */}
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

      {/* Alerts overlay (3D HTML elements will be added separately) */}
    </Canvas>
  );
};
