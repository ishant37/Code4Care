import Bed from "./Bed";
import * as THREE from 'three';

interface RoomProps {
  position: [number, number, number];
  isAlert: boolean;
}

const Room = ({ position, isAlert }: RoomProps) => {
  const color = isAlert ? "#ff1744" : "#00d4ff";

  return (
    <group position={position}>
      
      {/* FLOOR */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[3, 0.05, 3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>

      {/* WALLS (4 sides) */}
      {[
        [0, 0, -1.5], // back
        [0, 0, 1.5],  // front
        [-1.5, 0, 0], // left
        [1.5, 0, 0],  // right
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[i < 2 ? 3 : 0.05, 2, i < 2 ? 0.05 : 3]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.15}
            emissive={color}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}

      {/* EDGE GLOW (IMPORTANT) */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(3, 2, 3)]} />
        <lineBasicMaterial color={color} />
      </lineSegments>

      {/* BED */}
      <Bed />

    </group>
  );
};

export default Room;