import { Text } from "@react-three/drei";

interface NameTagProps {
  text: string;
  fontSize?: number;
  color?: string;
  background?: string;
}

export default function NameTag({ 
  text, 
  fontSize = 1, 
  color = "#000000", 
  background = "#ffffff" 
}: NameTagProps) {
  return (
    <group>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[text.length * fontSize * 0.6, fontSize * 1.2]} />
        <meshBasicMaterial color={background} transparent opacity={0.8} />
      </mesh>
      <Text
        position={[0, 0, 0]}
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle">
        {text}
      </Text>
    </group>
  );
} 