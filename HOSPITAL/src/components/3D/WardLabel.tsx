import { Text } from '@react-three/drei';

interface WardLabelProps {
  text: string;
  isAlert: boolean;
}

const WardLabel = ({ text, isAlert }: WardLabelProps) => {
  return (
    <Text
      position={[0, 2, 0]}
      fontSize={0.8}
      color={isAlert ? '#ff1744' : '#00d4ff'}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
};

export default WardLabel;