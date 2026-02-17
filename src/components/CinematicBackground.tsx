import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, Html, Line } from "@react-three/drei";
import { useScroll, type MotionValue } from "framer-motion";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function rangeProgress(start: number, end: number, p: number) {
  return clamp01((p - start) / (end - start));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function RepoStars() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 2400;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const green = new THREE.Color("hsl(137, 55%, 36%)");
    const white = new THREE.Color("hsl(213, 14%, 80%)");

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 110;
      pos[i3 + 1] = (Math.random() - 0.5) * 80;
      pos[i3 + 2] = (Math.random() - 0.5) * 140;

      const c = Math.random() > 0.88 ? green : white;
      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;
    }
    return [pos, col] as const;
  }, []);

  useFrame((state) => {
    const pts = pointsRef.current;
    if (!pts) return;
    pts.rotation.y = state.clock.elapsedTime * 0.012;
    pts.rotation.x = Math.sin(state.clock.elapsedTime * 0.09) * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.085} vertexColors transparent opacity={0.78} sizeAttenuation />
    </points>
  );
}

function RepoRings() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const ringCount = 64;

  const dummy = useMemo(() => new THREE.Object3D(), []);

  const matricesReady = useRef(false);

  useFrame((state) => {
    const g = groupRef.current;
    const mesh = meshRef.current;
    if (g) {
      g.rotation.z = Math.sin(state.clock.elapsedTime * 0.12) * 0.03;
      g.rotation.y = state.clock.elapsedTime * 0.02;
    }
    if (!mesh || matricesReady.current) return;

    for (let i = 0; i < ringCount; i++) {
      const t = i / (ringCount - 1);
      const z = lerp(8, -72, t);
      const s = lerp(0.8, 1.65, t);
      dummy.position.set(0, 0, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    matricesReady.current = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null!, null!, ringCount]}>
        <torusGeometry args={[4.9, 0.04, 10, 64]} />
        <meshBasicMaterial
          color="hsl(137, 55%, 36%)"
          wireframe
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}

function RepoFloor({ progress }: { progress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const lines = useMemo(() => {
    const segments: [number, number, number][][] = [];
    const size = 22;
    const step = 2;
    const y = -2.2;
    for (let i = -size; i <= size; i += step) {
      segments.push([
        [i, y, 10],
        [i, y, -90],
      ]);
      segments.push([
        [-size, y, i - 10],
        [size, y, i - 10],
      ]);
    }
    return segments;
  }, []);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const p = progress.get();
    g.position.z = lerp(0, -14, smoothstep(0.12, 0.62, p));
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.02;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {lines.map((pts, i) => (
        <Line

          key={i}
          points={pts}
          color="hsl(137, 55%, 36%)"
          transparent
          opacity={0.05}
          lineWidth={1}
        />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.25, -40]}>
        <planeGeometry args={[70, 120, 1, 1]} />
        <meshBasicMaterial color="#05090f" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function DiffPanels({ progress }: { progress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const matA = useRef<THREE.MeshStandardMaterial>(null);
  const matB = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const p = progress.get();
    const g = groupRef.current;
    if (!g) return;

    const show = smoothstep(0.1, 0.28, p) * (1 - smoothstep(0.42, 0.62, p));
    g.visible = show > 0.001;

    if (matA.current) matA.current.opacity = 0.12 + show * 0.35;
    if (matB.current) matB.current.opacity = 0.08 + show * 0.28;

    g.position.y = 0.2 + (1 - show) * 0.6;
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.06;
  });

  return (
    <group ref={groupRef} position={[0, 0.7, -10]}>
      <mesh position={[-2.6, 0.6, -10]} rotation={[0.02, 0.35, 0]}>
        <boxGeometry args={[5.2, 3.1, 0.12]} />
        <meshStandardMaterial
          ref={matA}
          color="hsl(215, 22%, 11%)"
          metalness={0.2}
          roughness={0.6}
          transparent
          opacity={0.22}
          emissive="hsl(137, 70%, 55%)"
          emissiveIntensity={0.35}
        />
        <Edges scale={1.01} color="hsl(137, 55%, 42%)" />
        <Html transform distanceFactor={6.5} position={[-2.2, 0.9, 0.08]} className="pointer-events-none">
          <div className="rounded-lg border-glow bg-secondary/40 backdrop-blur px-3 py-2 font-mono text-[10px] leading-relaxed text-muted-foreground w-[240px]">
            <div className="text-primary">$ git diff</div>
            <div className="mt-1">
              <span className="text-primary">+</span> add cinematic scroll chapters
            </div>
            <div>
              <span className="text-primary">+</span> render commit runway in 3D
            </div>
            <div>
              <span className="text-primary">+</span> merge pulse + branch labels
            </div>
          </div>
        </Html>
      </mesh>

      <mesh position={[3.2, -0.2, -13]} rotation={[0.01, -0.28, 0]}>
        <boxGeometry args={[4.6, 2.7, 0.12]} />
        <meshStandardMaterial
          ref={matB}
          color="hsl(215, 22%, 11%)"
          metalness={0.15}
          roughness={0.65}
          transparent
          opacity={0.18}
          emissive="hsl(137, 70%, 55%)"
          emissiveIntensity={0.22}
        />
        <Edges scale={1.01} color="hsl(137, 55%, 38%)" />
        <Html transform distanceFactor={7.5} position={[-1.9, 0.7, 0.08]} className="pointer-events-none">
          <div className="rounded-lg border-glow bg-secondary/35 backdrop-blur px-3 py-2 font-mono text-[10px] leading-relaxed text-muted-foreground w-[210px]">
            <div className="text-foreground">commit 9f1c2a7</div>
            <div className="text-muted-foreground/70">feat: tech/git background upgrade</div>
          </div>
        </Html>
      </mesh>
    </group>
  );
}

function CommitRunway({ progress }: { progress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const commits = useMemo(() => {
    const rows = [
      { hash: "a14c2f9", msg: "feat: cinematic 3D scroll" },
      { hash: "b7e901d", msg: "perf: smooth scroll + budget" },
      { hash: "c09d11a", msg: "ui: project deck + tabs" },
      { hash: "d3ad88e", msg: "3d: commit runway + diff panels" },
      { hash: "e12f0c4", msg: "chore: polish + tokens" },
      { hash: "f9c2a70", msg: "merge: feature/cinematic" },
    ];
    return rows.map((r, i) => ({
      ...r,
      pos: new THREE.Vector3((i % 2 === 0 ? -1 : 1) * (0.6 + i * 0.08), -0.3 + Math.sin(i) * 0.08, -18 - i * 8.2),
    }));
  }, []);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const p = progress.get();
    const show = smoothstep(0.26, 0.52, p) * (1 - smoothstep(0.8, 0.98, p));
    g.visible = show > 0.001;
    g.position.y = -0.2 + (1 - show) * 0.6;
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.14) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {commits.map((c) => (
        <group key={c.hash} position={c.pos}>
          <mesh>
            <sphereGeometry args={[0.18, 18, 18]} />
            <meshStandardMaterial
              color="hsl(215, 28%, 5%)"
              emissive="hsl(137, 70%, 55%)"
              emissiveIntensity={2.1}
              roughness={0.6}
              metalness={0.25}
            />
          </mesh>
          <mesh position={[0, 0, -0.9]}>
            <cylinderGeometry args={[0.012, 0.012, 1.8, 8]} />
            <meshBasicMaterial color="hsl(137, 55%, 36%)" transparent opacity={0.22} />
          </mesh>
          <Html transform distanceFactor={9} position={[0.45, 0.18, 0]} className="pointer-events-none">
            <div className="rounded-lg border border-border/60 bg-secondary/35 backdrop-blur px-3 py-2 font-mono text-[10px] leading-snug text-muted-foreground w-[220px]">
              <div className="text-primary">{c.hash}</div>
              <div className="text-foreground">{c.msg}</div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

function MergePulse({ progress }: { progress: MotionValue<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const p = progress.get();
    const t = smoothstep(0.62, 0.78, p);
    const m = meshRef.current;
    const mat = matRef.current;
    if (!m || !mat) return;
    const pulse = t * (1 - smoothstep(0.78, 0.9, p));
    m.visible = pulse > 0.001;
    const s = lerp(0.4, 7.5, pulse);
    m.scale.setScalar(s);
    m.rotation.z = state.clock.elapsedTime * 0.22;
    mat.opacity = 0.28 * (1 - pulse) + 0.05;
  });

  return (
    <mesh ref={meshRef} position={[0, -0.2, -56]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.2, 0.03, 10, 90]} />
      <meshBasicMaterial ref={matRef} color="hsl(137, 70%, 55%)" transparent opacity={0.12} depthWrite={false} />
    </mesh>
  );
}

function TechOrbits({ progress }: { progress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const tags = useMemo(
    () => [
      { label: "React", angle: 0.1 },
      { label: "TypeScript", angle: 1.2 },
      { label: "three.js", angle: 2.3 },
      { label: "Node.js", angle: 3.5 },
      { label: "Tailwind", angle: 4.3 },
    ],
    []
  );

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const p = progress.get();
    const show = smoothstep(0.34, 0.52, p) * (1 - smoothstep(0.6, 0.8, p));
    g.visible = show > 0.001;
    g.position.y = 1.2 + (1 - show) * 0.5;
    g.rotation.y = state.clock.elapsedTime * 0.12;
  });

  return (
    <group ref={groupRef} position={[0, 1.2, -32]}>
      <mesh>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="hsl(215, 28%, 5%)" emissive="hsl(137, 70%, 55%)" emissiveIntensity={1.8} />
      </mesh>
      {tags.map((t) => (
        <group key={t.label} position={[Math.cos(t.angle) * 2.2, Math.sin(t.angle * 1.1) * 0.6, Math.sin(t.angle) * 2.2]}>
          <mesh>
            <sphereGeometry args={[0.12, 14, 14]} />
            <meshStandardMaterial color="hsl(215, 28%, 5%)" emissive="hsl(137, 70%, 55%)" emissiveIntensity={1.6} />
          </mesh>
          <Html transform distanceFactor={10} position={[0.3, 0.12, 0]} className="pointer-events-none">
            <div className="rounded-md border border-border/60 bg-secondary/30 backdrop-blur px-2 py-1 font-mono text-[10px] text-foreground">
              {t.label}
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

function BranchGraph({ progress }: { progress: MotionValue<number> }) {
  const groupA = useRef<THREE.Group>(null);
  const groupB = useRef<THREE.Group>(null);
  const center = useRef<THREE.Group>(null);

  const path = useMemo(() => {
    const n = 28;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
      const z = -10 - i * 1.85;
      const y = Math.cos(i * 0.33) * 0.32;
      const x = Math.sin(i * 0.25) * 0.25;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, []);

  const lineA = useMemo(() => path.map((p) => p.toArray()) as [number, number, number][], [path]);
  const lineB = useMemo(
    () => path.map((p) => new THREE.Vector3(-p.x, p.y * 0.95, p.z).toArray()) as [number, number, number][],
    [path]
  );

  useFrame((state) => {
    const p = progress.get();
    const spreadIn = smoothstep(0.24, 0.48, p);
    const spreadOut = 1 - smoothstep(0.62, 0.9, p);
    const spread = 3.1 * spreadIn * spreadOut;

    const a = groupA.current;
    const b = groupB.current;
    const c = center.current;
    if (a) {
      a.position.x = -spread;
      a.rotation.y = -0.18 + Math.sin(state.clock.elapsedTime * 0.25) * 0.04;
    }
    if (b) {
      b.position.x = spread;
      b.rotation.y = 0.18 + Math.sin(state.clock.elapsedTime * 0.25) * 0.04;
    }
    if (c) {
      c.visible = p > 0.58;
      c.position.z = -56;
      c.scale.setScalar(lerp(0.5, 1.2, smoothstep(0.58, 0.8, p)));
    }
  });

  return (
    <group position={[0, -0.2, 0]}>
      <group ref={groupA}>
        <Line points={lineA} color="hsl(137, 55%, 46%)" transparent opacity={0.55} lineWidth={1} />
        {path.map((pt, i) => (
          <mesh key={`a-${i}`} position={pt}>
            <sphereGeometry args={[i === 0 ? 0.18 : 0.12, 16, 16]} />
            <meshStandardMaterial color="hsl(215, 28%, 5%)" emissive="hsl(137, 70%, 55%)" emissiveIntensity={1.6} />
          </mesh>
        ))}
      </group>

      <group ref={groupB}>
        <Line points={lineB} color="hsl(137, 55%, 42%)" transparent opacity={0.5} lineWidth={1} />
        {path.map((pt, i) => (
          <mesh key={`b-${i}`} position={[-pt.x, pt.y * 0.95, pt.z]}>
            <sphereGeometry args={[i === 0 ? 0.18 : 0.12, 16, 16]} />
            <meshStandardMaterial color="hsl(215, 28%, 5%)" emissive="hsl(137, 70%, 55%)" emissiveIntensity={1.4} />
          </mesh>
        ))}
      </group>

      <group ref={center}>
        <mesh position={[0, 0, -56]}>
          <octahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial color="hsl(215, 28%, 5%)" emissive="hsl(137, 70%, 55%)" emissiveIntensity={2.2} />
        </mesh>
      </group>
    </group>
  );
}

function CinematicRig({ progress }: { progress: MotionValue<number> }) {
  const camTarget = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const p = clamp01(progress.get());

    const intro = rangeProgress(0, 0.2, p);
    const orbit = rangeProgress(0.2, 0.6, p);
    const merge = rangeProgress(0.6, 0.84, p);
    const outro = rangeProgress(0.84, 1, p);

    if (p < 0.2) {
      camTarget.set(0, lerp(1.05, 0.45, intro), lerp(18, 10.2, intro));
      lookTarget.set(0, 0.05, -18);
    } else if (p < 0.6) {
      const a = orbit * Math.PI * 2;
      camTarget.set(Math.sin(a) * 2.7, 0.75 + Math.cos(a * 0.7) * 0.35, lerp(9, 4.6, orbit));
      lookTarget.set(0, 0.05, -34);
    } else if (p < 0.84) {
      camTarget.set(Math.sin(merge * Math.PI) * 0.55, lerp(0.7, 0.35, merge), lerp(4.6, 2.4, merge));
      lookTarget.set(0, 0.0, -52);
    } else {
      camTarget.set(0, lerp(0.35, 0.3, outro), lerp(2.4, 2.8, outro));
      lookTarget.set(0, 0.0, -58);
    }

    state.camera.position.lerp(camTarget, 0.08);
    state.camera.lookAt(lookTarget);
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 8, 6]} intensity={0.65} />
      <pointLight position={[0, 0, 10]} intensity={0.6} color="hsl(137, 70%, 55%)" />

      <RepoStars />
      <RepoRings />
      <RepoFloor progress={progress} />
      <DiffPanels progress={progress} />
      <CommitRunway progress={progress} />
      <TechOrbits progress={progress} />
      <MergePulse progress={progress} />
      <BranchGraph progress={progress} />
    </>
  );
}

export default function CinematicBackground({
  targetRef,
}: {
  targetRef: React.RefObject<HTMLElement>;
}) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.3, 18], fov: 55, near: 0.1, far: 240 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#04080d"]} />
        <fog attach="fog" args={["#04080d", 16, 98]} />
        <CinematicRig progress={scrollYProgress} />
      </Canvas>
    </div>
  );
}
