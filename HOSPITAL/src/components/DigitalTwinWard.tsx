import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  activeWard: any;
  isAlert: boolean;
}

interface Room {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  type: 'bed' | 'equipment' | 'hallway';
  isAlert: boolean;
}

export const DigitalTwinWard: React.FC<Props> = ({ activeWard, isAlert }) => {
  const groupRef = useRef<THREE.Group>(null!);

  // Create hospital rooms layout
  const rooms = useMemo<Room[]>(() => [
    // Normal zones (Cyan)
    { id: 'room-1', position: [-3, 0, 3], size: [1.2, 1.5, 1.2], type: 'bed', isAlert: false },
    { id: 'room-2', position: [-1, 0, 3], size: [1.2, 1.5, 1.2], type: 'bed', isAlert: false },
    { id: 'room-3', position: [1, 0, 3], size: [1.2, 1.5, 1.2], type: 'bed', isAlert: false },
    { id: 'room-4', position: [3, 0, 3], size: [1.2, 1.5, 1.2], type: 'bed', isAlert: false },
    
    // Critical zones (Red)
    { id: 'icu-1', position: [-3, 0, -3], size: [1.2, 1.5, 1.2], type: 'equipment', isAlert: true },
    { id: 'icu-2', position: [-1, 0, -3], size: [1.2, 1.5, 1.2], type: 'equipment', isAlert: isAlert },
    { id: 'icu-3', position: [1, 0, -3], size: [1.2, 1.5, 1.2], type: 'equipment', isAlert: false },
  ], [isAlert]);

  // Animation loop
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
      groupRef.current.rotation.z = Math.cos(state.clock.getElapsedTime() * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main building structure - transparent walls */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[9, 2, 8]} />
        <meshStandardMaterial
          color="#00f2ff"
          transparent
          opacity={0.08}
          emissive="#00f2ff"
          emissiveIntensity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe outline for cyberpunk effect */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[9, 2, 8]} />
        <meshStandardMaterial
          wireframe
          color="#00f2ff"
          emissive="#00f2ff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Individual rooms */}
      {rooms.map((room) => {
        const color = room.isAlert ? '#ff1744' : '#00d4ff';
        const emissive = room.isAlert ? '#ff1744' : '#00d4ff';
        
        return (
          <group key={room.id} position={room.position}>
            {/* Room box */}
            <mesh>
              <boxGeometry args={room.size} />
              <meshStandardMaterial
                color={color}
                transparent
                opacity={0.15}
                emissive={emissive}
                emissiveIntensity={room.isAlert ? 1.2 : 0.4}
              />
            </mesh>

            {/* Room outline */}
            <mesh>
              <boxGeometry args={[room.size[0] * 1.05, room.size[1] * 1.05, room.size[2] * 1.05]} />
              <meshStandardMaterial
                wireframe
                color={color}
                emissive={emissive}
                emissiveIntensity={room.isAlert ? 1.5 : 0.6}
                transparent
                opacity={room.isAlert ? 0.8 : 0.4}
              />
            </mesh>

            {/* Bed/Equipment geometry */}
            <mesh position={[0, -0.4, 0]}>
              <boxGeometry args={[0.8, 0.3, 0.5]} />
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={0.5}
              />
            </mesh>

            {/* Data point indicator */}
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={1.2}
              />
            </mesh>
          </group>
        );
      })}

      {/* Connecting grid lines for futuristic feel */}
      <group>
        {rooms.map((room, idx) => {
          if (idx < rooms.length - 1) {
            return (
              <Line
                key={`line-${room.id}`}
                points={[room.position, rooms[idx + 1].position]}
                color={room.isAlert ? '#ff1744' : '#00d4ff'}
                lineWidth={0.5}
                transparent
                opacity={0.3}
              />
            );
          }
          return null;
        })}
      </group>

      {/* Central hub with pulsing effect */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color="#00f2ff"
          emissive="#00f2ff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Ward label */}
      <Text position={[0, 1.2, 0]} fontSize={0.3} color="#00d4ff" anchorX="center">
        {activeWard?.name || 'WARD_ALPHA'}
      </Text>

      {/* Status label */}
      <Text position={[0, 0.8, 0]} fontSize={0.15} color={isAlert ? '#ff1744' : '#00d4ff'} anchorX="center">
        {isAlert ? '⚠ CRITICAL' : '✓ STABLE'}
      </Text>
    </group>
  );
};