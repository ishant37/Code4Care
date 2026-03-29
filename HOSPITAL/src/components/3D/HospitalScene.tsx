import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Ward from './Ward';
import FloorPlan from './FloorPlan';

const wardsData = [
  { pos: [0, 0, 0] as [number, number, number], alert: false, name: 'Ward A', patients: 12, capacity: 20 },
  { pos: [5, 0, 0] as [number, number, number], alert: false, name: 'Ward B', patients: 18, capacity: 20 },
  { pos: [-5, 0, 0] as [number, number, number], alert: true, name: 'ICU', patients: 8, capacity: 10 },
];

interface HospitalSceneProps {
  selectedWard: any;
  alerts: any[];
  onWardClick: (name: string) => void;
}

const HospitalScene = ({ alerts, onWardClick }: HospitalSceneProps) => {
  return (
    <Canvas
      className="hospital-canvas"
      camera={{ position: [20, 15, 20], fov: 35 }}
    >
      <color attach="background" args={['#0f172a']} />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} />
      <pointLight position={[10, 10, 10]} color="#00d4ff" />

      {/* Environment */}
      <Environment preset="city" />

      {/* Scene helpers */}
      <fog attach="fog" args={['#0f172a', 20, 60]} />
      <gridHelper args={[30, 30]} />

      {/* Base */}
      <FloorPlan />

      {/* Dynamic Wards */}
      {wardsData.map((ward, i) => (
        <Ward
          key={i}
          position={ward.pos}
          isAlert={ward.alert}
          name={ward.name}
          patients={ward.patients}
          capacity={ward.capacity}
          onClick={() => onWardClick(ward.name)}
        />
      ))}

      {/* Controls */}
      <OrbitControls autoRotate autoRotateSpeed={0.5} />

      {/* Effects */}
      <EffectComposer>
        <Bloom intensity={1.5} luminanceThreshold={0.15} />
      </EffectComposer>
    </Canvas>
  );
};

export default HospitalScene;