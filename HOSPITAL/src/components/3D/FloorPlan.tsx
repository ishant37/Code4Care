const FloorPlan = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[30, 30]} />
      <meshBasicMaterial color="#1e293b" wireframe />
    </mesh>
  );
};

export default FloorPlan;