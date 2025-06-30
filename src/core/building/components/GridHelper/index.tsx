interface GridHelperProps {
  size?: number;
  divisions?: number;
  color1?: string;
  color2?: string;
}

export function GridHelper({ 
  size = 100, 
  divisions = 50,
  color1 = '#888888',
  color2 = '#444444'
}: GridHelperProps) {
  return (
    <gridHelper 
      args={[size, divisions, color1, color2]} 
      position={[0, 0.01, 0]}
    />
  );
}