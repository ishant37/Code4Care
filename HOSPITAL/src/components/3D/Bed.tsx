const Bed = () => {
  return (
    <mesh position={[0, -0.7, 0]}>
      <boxGeometry args={[1.5, 0.3, 2]} />
      <meshStandardMaterial color="#0ea5e9" />
    </mesh>
  );
};

export default Bed;