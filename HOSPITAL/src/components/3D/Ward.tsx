import Room from "./Room";
import WardLabel from "./WardLabel";


interface WardProps {
  position: [number, number, number];
  isAlert: boolean;
  name: string;
}

const Ward = ({ position, isAlert, name }: WardProps) => {
  return (
    <group position={position}>
      {/* 4 rooms grid */}
      <Room position={[-2, 0, -2]} isAlert={isAlert} />
      <Room position={[2, 0, -2]} isAlert={isAlert} />
      <Room position={[-2, 0, 2]} isAlert={isAlert} />
      <Room position={[2, 0, 2]} isAlert={isAlert} />

      <WardLabel text={name} isAlert={isAlert} />
    </group>
  );
};

export default Ward;