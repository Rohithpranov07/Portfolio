import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

const StarField = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 2000;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const green = new THREE.Color("hsl(137, 55%, 36%)");
    const white = new THREE.Color("hsl(213, 14%, 80%)");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 80;
      pos[i3 + 1] = (Math.random() - 0.5) * 80;
      pos[i3 + 2] = (Math.random() - 0.5) * 80;

      const c = Math.random() > 0.85 ? green : white;
      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

const FloatingNodes = () => {
  const groupRef = useRef<THREE.Group>(null);
  const nodeCount = 12;

  const nodes = useMemo(() => {
    return Array.from({ length: nodeCount }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
      ] as [number, number, number],
      scale: 0.04 + Math.random() * 0.06,
      speed: 0.3 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.01;
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <FloatingNode key={i} {...node} />
      ))}
    </group>
  );
};

const FloatingNode = ({
  position,
  scale,
  speed,
  offset,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
  offset: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * speed + offset) * 0.8;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="hsl(137, 55%, 36%)" wireframe transparent opacity={0.4} />
    </mesh>
  );
};

const ConnectionLines = () => {
  const linesRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const result: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    for (let i = 0; i < 8; i++) {
      result.push({
        start: new THREE.Vector3(
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 15
        ),
        end: new THREE.Vector3(
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 15
        ),
      });
    }
    return result;
  }, []);

  useFrame((state) => {
    if (!linesRef.current) return;
    linesRef.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <group ref={linesRef}>
      {lines.map((l, i) => (
        <Line
          key={i}
          points={[l.start.toArray(), l.end.toArray()]}
          color="hsl(137, 55%, 36%)"
          transparent
          opacity={0.08}
          lineWidth={1}
        />
      ))}
    </group>
  );
};

const SpaceBackground = () => {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <StarField />
        <FloatingNodes />
        <ConnectionLines />
      </Canvas>
    </div>
  );
};

export default SpaceBackground;
