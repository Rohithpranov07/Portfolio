import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges, Html, Line, RoundedBox, Environment, Float, Sparkles, Text } from "@react-three/drei";
import { useScroll, useSpring, type MotionValue } from "framer-motion";
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';

import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function rangeProgress(start: number, end: number, p: number) {
  return clamp01((p - start) / (end - start));
}

function easeOutBack(t: number) {
  const s = 1.70158;
  const u = t - 1;
  return 1 + u * u * ((s + 1) * u + s);
}

const THEME = {
  bg: "#04070c",
  green: "hsl(137, 70%, 55%)",
  greenDim: "hsl(137, 55%, 36%)",
  panel: "hsl(215, 22%, 11%)",
  gold: "#FFD700",
  silver: "#E0E0E0",
  copper: "#B87333",
};

const CHIP = {
  x: 0,
  y: -1.1,
  z: -34,
};

const TRAYS = {
  left: new THREE.Vector3(-7.2, 0.05, 6.2),
  right: new THREE.Vector3(7.2, 0.05, 6.2),
};

function gaussianPulse(x: number, center: number, width: number) {
  const d = (x - center) / width;
  return Math.exp(-d * d);
}

function CircuitFloor({ progress }: { progress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);

  const traces = useMemo(() => {
    const result: [number, number, number][][] = [];
    const y = -2.35;
    const sizeX = 22;
    const sizeZ = 92;
    const gridStep = 2;

    // faint grid
    for (let x = -sizeX; x <= sizeX; x += gridStep) {
      result.push([
        [x, y, 12],
        [x, y, -sizeZ],
      ]);
    }
    for (let z = 12; z >= -sizeZ; z -= gridStep) {
      result.push([
        [-sizeX, y, z],
        [sizeX, y, z],
      ]);
    }

    // thicker "bus" lines (PCB vibe)
    const buses: [number, number, number][][] = [
      [
        [-12, y, 10],
        [-12, y, -sizeZ],
      ],
      [
        [12, y, 10],
        [12, y, -sizeZ],
      ],
      [
        [0, y, 10],
        [0, y, -sizeZ],
      ],
      [
        [-sizeX, y, -24],
        [sizeX, y, -24],
      ],
      [
        [-sizeX, y, -58],
        [sizeX, y, -58],
      ],
    ];
    buses.forEach((b) => result.push(b));

    return result;
  }, []);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const p = progress.get();
    g.position.z = lerp(0, -14, smoothstep(0.12, 0.6, p));
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.02;
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.36, -40]}>
        <planeGeometry args={[72, 132, 1, 1]} />
        <meshBasicMaterial color={THEME.bg} transparent opacity={0.78} />
      </mesh>

      {traces.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color={THEME.greenDim}
          transparent
          opacity={i % 7 === 0 ? 0.12 : 0.045}
          lineWidth={1}
        />
      ))}
    </group>
  );
}


function FloatingParticles({ count = 300 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const themeColor = new THREE.Color(THEME.green);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 80 - 20
      ),
      speed: Math.random() * 0.05 + 0.01,
      scale: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2
    }));
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    
    particles.forEach((p, i) => {
      dummy.position.copy(p.pos);
      // subtle float
      dummy.position.y += Math.sin(t * p.speed + p.phase) * 0.05;
      dummy.position.z += Math.cos(t * p.speed * 0.5 + p.phase) * 0.05;
      
      dummy.rotation.set(t * p.speed, t * p.speed * 0.5, 0);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null!, null!, count]}>
      <dodecahedronGeometry args={[0.08, 0]} />
      <meshBasicMaterial color={themeColor} transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

function RobotArm({
  chipGroupRef,
  baseLocal,
  targetLocalRef,
  activeRef,
  carryRef,
  joltRef,
}: {
  chipGroupRef: React.RefObject<THREE.Group | null>;
  baseLocal: [number, number, number];
  targetLocalRef: React.RefObject<THREE.Vector3>;
  activeRef: React.RefObject<boolean>;
  carryRef: React.RefObject<boolean>;
  joltRef: React.RefObject<number>;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const aimRef = useRef<THREE.Group>(null);
  const elbowRef = useRef<THREE.Group>(null);
  const clawRef = useRef<THREE.Group>(null);
  const carriedRef = useRef<THREE.Mesh>(null);
  const ledMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const sparkRef = useRef<THREE.Group>(null);

  const tmpWorld = useMemo(() => new THREE.Vector3(), []);
  const currentPos = useRef(new THREE.Vector3(baseLocal[0], baseLocal[1] + 2, baseLocal[2])); 
  const clawBasePos = useMemo(() => new THREE.Vector3(0, 0.1, -1.25), []);

  useFrame((state, delta) => {
    const root = rootRef.current;
    const aim = aimRef.current;
    const elbow = elbowRef.current;
    const claw = clawRef.current;
    const carried = carriedRef.current;
    const chip = chipGroupRef.current;
    if (!root || !aim || !elbow || !claw || !chip) return;

    const isActive = activeRef.current;
    const isCarrying = carryRef.current;
    const jolt = joltRef.current;
    root.visible = true;

    // --- Smoothing Logic ---
    // Instead of snapping to targetLocalRef, we lerp currentPos towards it
    const rawTarget = targetLocalRef.current;
    // Variable lerp speed based on distance/state? 
    // Faster when moving between tiles, steady when placing
    const dist = currentPos.current.distanceTo(rawTarget);
    const speed = dist > 2 ? 8 : 12; // move fast if far
    currentPos.current.lerp(rawTarget, delta * speed);

    // Convert smoothed local target to world for lookAt
    tmpWorld.copy(currentPos.current);
    chip.localToWorld(tmpWorld);

    aim.lookAt(tmpWorld);

    // --- Mechanical Animation ---
    const t = state.clock.elapsedTime;
    
    // Elbow moves to compensate reach + breathe
    const reachFactor = clamp01((dist - 1.5) / 5.0); // 0 (close) to 1 (far)
    const elbowAngle = lerp(-0.8, -0.1, reachFactor);
    
    elbowRef.current.rotation.x = THREE.MathUtils.lerp(
        elbowRef.current.rotation.x,
        elbowAngle + Math.sin(t * 1.5) * 0.03, // breathing
        delta * 4
    );

    // Claw Piston / Plunge
    claw.position.copy(clawBasePos);
    // We use 'jolt' (which implies placement/pickup action) to plunge
    const plunge = smoothstep(0, 1, jolt) * 0.25;
    claw.position.y -= plunge; 
    
    // Led / Welding Effect
    if (ledMatRef.current) {
        // High jolt = welding
        const isWelding = jolt > 0.4;
        const flash = isWelding ? Math.random() * jolt : 0; 
        ledMatRef.current.opacity = 0.5 + flash * 4.0;
        ledMatRef.current.color.setHSL(dist < 0.1 ? 0.35 : 0.1, 1.0, 0.5 + flash * 0.5); // Green/Orange sparks
    }
    
    // Sparks Visibility
    if (sparkRef.current) {
        sparkRef.current.visible = jolt > 0.5;
        if (sparkRef.current.visible) {
             sparkRef.current.rotation.z = Math.random() * Math.PI;
        }
    }

    if (carried) {
        carried.visible = isCarrying;
    }
  });

  return (
    <group ref={rootRef} position={baseLocal}>
      {/* Heavy Base Station */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.8, 1.0, 0.6, 16]} />
        <meshStandardMaterial color={THEME.panel} metalness={0.7} roughness={0.3} />
        <Edges color="#3a4b5c" />
      </mesh>
      
      {/* Rotating Turret */}
      <group ref={aimRef} position={[0, 0.4, 0]}>
         {/* Shoulder Housing */}
         <group rotation={[Math.PI/2, 0, 0]}>
            <mesh>
                <cylinderGeometry args={[0.35, 0.35, 0.8, 16]} />
                <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
                <Edges color={THEME.greenDim} opacity={0.4} />
            </mesh>
            {/* Decal */}
            <mesh position={[0, 0.2, 0.35]}>
                <planeGeometry args={[0.4, 0.4]} />
                <meshBasicMaterial color={THEME.green} transparent opacity={0.3} />
            </mesh>
         </group>
         
         {/* Upper Arm Structures (Parallel struts) */}
         <group position={[0, 0.1, -0.9]}>
            <mesh position={[-0.2, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                <boxGeometry args={[0.12, 0.12, 1.8]} />
                <meshStandardMaterial color={THEME.panel} metalness={0.6} roughness={0.5} />
            </mesh>
            <mesh position={[0.2, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                <boxGeometry args={[0.12, 0.12, 1.8]} />
                <meshStandardMaterial color={THEME.panel} metalness={0.6} roughness={0.5} />
            </mesh>
            {/* Hydraulic Piston / Cables */}
            <mesh position={[0, 0.08, 0]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.08, 1.6, 8]} />
                <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Cabling deco */}
             <mesh position={[0, 0.2, 0]} rotation={[Math.PI/2, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 1.6, 4]} />
                <meshStandardMaterial color="#111" />
            </mesh>
         </group>

         {/* Elbow Joint */}
         <group ref={elbowRef} position={[0, 0.1, -1.8]}>
            <group rotation={[0, 0, Math.PI/2]}>
               <mesh>
                   <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
                   <meshStandardMaterial color="#1a1a1a" metalness={0.7} />
               </mesh>
               <mesh position={[0, 0.28, 0]} rotation={[0, 0, 0]}>
                   <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
                    <meshStandardMaterial color={THEME.green} emissive={THEME.green} emissiveIntensity={0.5} />
               </mesh>
            </group>
            
            {/* Forearm */}
            <group position={[0, 0, -0.7]}>
               <mesh rotation={[Math.PI/2, 0, 0]}>
                  <boxGeometry args={[0.3, 0.18, 1.4]} />
                  <meshStandardMaterial color={THEME.panel} />
                  <Edges color={THEME.green} opacity={0.3} />
               </mesh>
               {/* Detail lines */}
               <Line points={[[-0.15, 0.1, 0.6], [-0.15, 0.1, -0.6]]} color="#333" lineWidth={2} />
               <Line points={[[0.15, 0.1, 0.6], [0.15, 0.1, -0.6]]} color="#333" lineWidth={2} />
            </group>

            {/* Wrist / Claw actuator */}
            <group ref={clawRef} position={[0, -0.1, -1.25]}>
                {/* Vertical actuator */}
                <mesh position={[0, 0.25, 0]}>
                   <cylinderGeometry args={[0.08, 0.12, 0.5, 8]} />
                   <meshStandardMaterial color="#555" metalness={0.8} />
                </mesh>
                
                {/* The Claw Head */}
                <group position={[0, 0, 0]}>
                    <mesh>
                       <boxGeometry args={[0.32, 0.12, 0.32]} />
                       <meshStandardMaterial color="#111" metalness={0.5} />
                       <Edges color={THEME.green} />
                    </mesh>
                    {/* Fingers */}
                    <mesh position={[-0.14, -0.12, 0]}>
                        <boxGeometry args={[0.04, 0.15, 0.2]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    <mesh position={[0.14, -0.12, 0]}>
                         <boxGeometry args={[0.04, 0.15, 0.2]} />
                         <meshStandardMaterial color="#333" />
                    </mesh>
                </group>
                
                {/* Glowing Laser/Welder Tip */}
                <mesh position={[0, -0.06, 0]}>
                   <cylinderGeometry args={[0.01, 0.04, 0.15, 8]} />
                   <meshBasicMaterial ref={ledMatRef} color={THEME.green} />
                </mesh>
                <pointLight 
                    position={[0, -0.2, 0]} 
                    distance={2.0} 
                    intensity={1.0} 
                    color={THEME.green} 
                    decay={2}
                />
                
                {/* Sparks */}
                <group ref={sparkRef as unknown as React.RefObject<THREE.Group>} position={[0, -0.2, 0]}>
                     <Sparkles 
                        count={15} 
                        scale={1.2} 
                        size={4}
                        speed={2} 
                        opacity={0.8} 
                        color={THEME.gold}
                        noise={0.5}
                     />
                </group>

                {/* Carried Tile */}
                <mesh ref={carriedRef} position={[0, -0.15, 0]}>
                  <boxGeometry args={[0.52, 0.08, 0.52]} />
                  <meshStandardMaterial
                    color={THEME.panel}
                    metalness={0.2}
                    roughness={0.5}
                    emissive={THEME.green}
                    emissiveIntensity={0.35}
                    transparent
                    opacity={0.95}
                  />
                  <Edges scale={1.02} color={THEME.greenDim} />
                </mesh>
            </group>
         </group>
      </group>
    </group>
  );
}

function DieTraces() {
  const lines = useMemo(() => {
    const out: [number, number, number][][] = [];
    const y = 0.29;
    const size = 2.45;
    const step = 0.35;
    for (let i = -size; i <= size; i += step) {
      // vertical micro-traces
      if (Math.abs(i) < 2.2) {
        out.push([
          [i, y, -size],
          [i, y, size],
        ]);
      }
      // horizontal micro-traces (sparser)
      if (Math.round((i + size) / step) % 2 === 0) {
        out.push([
          [-size, y, i],
          [size, y, i],
        ]);
      }
    }
    // a few "buses" on the die
    out.push([
      [-2.2, y, -1.1],
      [2.2, y, -1.1],
    ]);
    out.push([
      [-2.2, y, 1.1],
      [2.2, y, 1.1],
    ]);
    return out;
  }, []);

  return (
    <group>
      {lines.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color={THEME.greenDim}
          transparent
          opacity={i % 5 === 0 ? 0.16 : 0.08}
          lineWidth={1}
        />
      ))}
    </group>
  );
}

function ComputerIntro({ progress }: { progress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const screenMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const shellMats = useRef<THREE.MeshStandardMaterial[]>([]);

  useFrame((state) => {
    const p = progress.get();
    const g = groupRef.current;
    if (!g) return;

    // visible at top, fade as we "enter" the computer
    const show = 1 - smoothstep(0.1, 0.32, p);
    g.visible = show > 0.001;
    g.position.set(0, -0.2 + (1 - show) * 0.2, -7.5);
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.04;

    for (const m of shellMats.current) {
      if (!m) continue;
      m.opacity = 0.22 + show * 0.7;
      m.emissiveIntensity = 0.04 + show * 0.06;
    }
    if (screenMatRef.current) {
      const flicker = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 12.0);
      screenMatRef.current.emissiveIntensity = 0.45 + show * (0.8 + flicker * 0.25);
      screenMatRef.current.opacity = 0.25 + show * 0.55;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Laptop Screen Group - Hinged at back of keyboard */}
      <group position={[0, -1.4, -0.7]} rotation={[-0.15, 0, 0]}> 
         {/* Screen Content Container - shift up so pivot is at bottom */}
         <group position={[0, 2.9, 0]}>
            {/* Monitor Casing */}
            <RoundedBox args={[9.4, 5.8, 0.4]} radius={0.15} smoothness={4}>
              <meshStandardMaterial
                ref={(m) => {
                  if (m) shellMats.current[0] = m;
                }}
                color={THEME.panel}
                metalness={0.6}
                roughness={0.2}
                emissive={THEME.green}
                emissiveIntensity={0.02}
              />
            </RoundedBox>
            <Edges scale={1.0} threshold={15} color={THEME.greenDim} opacity={0.5} />
            
            {/* Screen Glass - Now correctly parented */}
            <mesh position={[0, 0, 0.22]}>
                <planeGeometry args={[8.6, 5.0]} />
                <meshPhysicalMaterial
                  ref={screenMatRef}
                  color={THEME.bg}
                  emissive={THEME.green}
                  emissiveIntensity={0.8}
                  metalness={0.1}
                  roughness={0.2}
                  transmission={0.1}
                  thickness={0.5}
                />
            </mesh>

            {/* Webcam */}
            <group position={[0, 2.65, 0]}>
                 <mesh rotation={[0, 0, Math.PI/2]}>
                     <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
                     <meshStandardMaterial color="#111" metalness={0.8} />
                 </mesh>
                 <mesh position={[0, 0, 0.12]} rotation={[Math.PI/2, 0, 0]}>
                     <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
                     <meshBasicMaterial color="#000" />
                 </mesh>
                 <mesh position={[0.25, 0, 0.12]}>
                     <sphereGeometry args={[0.02]} />
                     <meshBasicMaterial color={THEME.green} />
                 </mesh>
            </group>

            {/* Terminal Overlay - Parented to screen to follow rotation */}
            <Html transform distanceFactor={8} position={[-3.6, 1.4, 0.26]} className="pointer-events-none">
                <div className="font-mono text-[10px] leading-relaxed text-muted-foreground/90 drop-shadow-md select-none bg-black/80 backdrop-blur-sm p-3 rounded-lg border border-white/10 w-[320px]">
                  <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                     <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                     </div>
                     <span className="text-zinc-500 text-[9px] font-semibold ml-2">root@system:~/core</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs"><span className="text-green-500 font-bold">➜</span> <span className="text-blue-400">./initialize_sequence.sh</span></div>
                  <div className="pl-4 border-l-2 border-zinc-800 space-y-1 mt-2 text-[9px] font-medium tracking-wide">
                     <div className="text-zinc-400">→ Loading kernel modules... <span className="text-zinc-600">[DONE]</span></div>
                     <div className="text-zinc-400">→ Mounting virtual filesystems... <span className="text-zinc-600">[DONE]</span></div>
                     <div className="text-zinc-400">→ Establishing neural link...</div>
                     <div className="text-zinc-300 bg-green-500/10 inline-block px-1 rounded mt-1">STATUS: <span className="text-green-400 font-bold">ONLINE</span></div>
                     <div className="text-green-400 animate-pulse mt-2 font-bold">&gt;&gt; SYSTEM READY</div>
                  </div>
                </div>
            </Html>
         </group>
      </group>
      
      {/* Hinge mechanism */}
      <mesh position={[0, -1.45, -0.7]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.2, 0.2, 8.5, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </mesh>

      {/* keyboard base - lowered slightly to mate with hinge */}
      <group position={[0, -1.55, 2.4]} rotation={[0.05, 0, 0]}>
        <RoundedBox args={[10.6, 0.5, 6.2]} radius={0.15} smoothness={4}>
           <meshStandardMaterial
              ref={(m) => {
                if (m) shellMats.current[1] = m;
              }}
              color={THEME.panel}
              metalness={0.6}
              roughness={0.4}
              emissive={THEME.green}
              emissiveIntensity={0.02}
           />
        </RoundedBox>
        <Edges scale={1.0} color={THEME.greenDim} opacity={0.2} />
        
        {/* Touch Bar */}
        <mesh position={[0, 0.26, -2.4]}>
            <planeGeometry args={[9.4, 0.25]} />
            <meshBasicMaterial color={THEME.green} transparent opacity={0.35} />
        </mesh>
        
        {/* Keys grid */}
        <group position={[-4.5, 0.28, -1.8]}>
            {[...Array(5)].map((_, r) => (
                <group key={r} position={[0, 0, r * 0.82]}>
                    {[...Array(13)].map((_, c) => (
                         // Spacebar row logic
                         (r === 4 && (c > 3 && c < 9)) ? null : (
                         <mesh key={c} position={[c * 0.75, 0, 0]}>
                             <RoundedBox args={[0.6, 0.12, 0.6]} radius={0.05} smoothness={2}>
                                <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.7} />
                             </RoundedBox>
                         </mesh>)
                    ))}
                </group>
            ))}
            {/* Spacebar */}
            <mesh position={[6 * 0.75, 0, 4 * 0.82]}>
                 <RoundedBox args={[3.6, 0.12, 0.6]} radius={0.05} smoothness={2}>
                    <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.7} />
                 </RoundedBox>
            </mesh>
        </group>
        
        {/* Trackpad */}
        <mesh position={[0, 0.26, 2.2]} rotation={[-Math.PI/2, 0, 0]}>
             <planeGeometry args={[4.2, 2.4]} />
             <meshStandardMaterial color="#111" metalness={0.5} roughness={0.3} />
             <Edges color="#333" />
        </mesh>
      </group>
      
      {/* Mouse - on table */}
      <group position={[6.8, -1.6, 2.8]} rotation={[0, -0.3, 0]}>
           <RoundedBox args={[1.6, 0.5, 2.6]} radius={0.25} smoothness={4}>
               <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.2} />
           </RoundedBox>
           {/* Wheel */}
           <mesh position={[0, 0.28, -0.6]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
                <meshStandardMaterial color="#333" />
           </mesh>
           {/* Laser light underneath */}
           <pointLight position={[0, -0.4, 0]} color={THEME.green} distance={2.0} intensity={2.5} decay={2} />
      </group>

      {/* vents (chip vibe) */}
      <mesh position={[0, -0.65, -1.8]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[7.2, 0.15, 1.8]} />
        <meshStandardMaterial
          ref={(m) => {
            if (m) shellMats.current[2] = m;
          }}
          color={THEME.bg}
          metalness={0.8}
          roughness={0.2}
          emissive={THEME.greenDim}
          emissiveIntensity={0.05}
        />
        <Edges scale={1.01} color={THEME.greenDim} />
      </mesh>
    </group>
  );
}

function EntryTunnel({ progress }: { progress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const frames = useMemo(() => Array.from({ length: 14 }, (_, i) => -10 - i * 2.3), []);

  useFrame(() => {
    const p = progress.get();
    const g = groupRef.current;
    if (!g) return;
    const show = smoothstep(0.08, 0.34, p) * (1 - smoothstep(0.34, 0.62, p));
    g.visible = show > 0.001;
    if (matRef.current) matRef.current.opacity = 0.05 + show * 0.12;
  });

  return (
    <group ref={groupRef}>
      {frames.map((z, i) => (
        <mesh key={z} position={[0, 0.4 + (i % 2) * 0.06, z]} rotation={[0.02, 0.08 * (i % 2 ? 1 : -1), 0]}>
          <boxGeometry args={[10.5, 6.4, 0.08]} />
          <meshBasicMaterial ref={i === 0 ? matRef : undefined} color={THEME.greenDim} transparent opacity={0.12} />
          <Edges scale={1.01} color={THEME.greenDim} />
        </mesh>
      ))}
    </group>
  );
}

function CpuChip({ progress }: { progress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const pinsRef = useRef<THREE.InstancedMesh>(null);
  const tilesRef = useRef<THREE.InstancedMesh>(null);
  const trayLeftRef = useRef<THREE.InstancedMesh>(null);
  const trayRightRef = useRef<THREE.InstancedMesh>(null);
  const tmpObj = useMemo(() => new THREE.Object3D(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);
  const cDim = useMemo(() => new THREE.Color(THEME.greenDim), []);
  const cBright = useMemo(() => new THREE.Color(THEME.green), []);

  const leftTargetLocal = useRef(new THREE.Vector3(-1, 0.2, 0));
  const rightTargetLocal = useRef(new THREE.Vector3(1, 0.2, 0));
  const leftActive = useRef(false);
  const rightActive = useRef(false);
  const leftCarry = useRef(false);
  const rightCarry = useRef(false);
  const leftJolt = useRef(0);
  const rightJolt = useRef(0);

  const pins = useMemo(() => {
    const out: { x: number; z: number; rotY: number; phase: number }[] = [];
    const half = 3.8;
    const countPerSide = 22;
    for (let i = 0; i < countPerSide; i++) {
      const t = lerp(-half + 0.25, half - 0.25, i / (countPerSide - 1));
      out.push({ x: t, z: half + 0.55, rotY: 0, phase: Math.random() * Math.PI * 2 });
      out.push({ x: t, z: -half - 0.55, rotY: 0, phase: Math.random() * Math.PI * 2 });
      out.push({ x: half + 0.55, z: t, rotY: Math.PI / 2, phase: Math.random() * Math.PI * 2 });
      out.push({ x: -half - 0.55, z: t, rotY: Math.PI / 2, phase: Math.random() * Math.PI * 2 });
    }
    return out;
  }, []);

  const tiles = useMemo(() => {
    const grid = 8;
    const step = 0.62;
    const origin = -((grid - 1) * step) / 2;
    const out: {
      target: THREE.Vector3;
      start: THREE.Vector3;
      phase: number;
      side: "L" | "R";
      pick: THREE.Vector3;
      slot: number;
    }[] = [];

    for (let z = 0; z < grid; z++) {
      for (let x = 0; x < grid; x++) {
        const tx = origin + x * step;
        const tz = origin + z * step;
        const target = new THREE.Vector3(tx, 0.36, tz);
        const side: "L" | "R" = (x + z) % 2 === 0 ? "L" : "R";
        const slot = (x + z * grid) % 16;
        const sx = (slot % 4) - 1.5;
        const sz = Math.floor(slot / 4) - 1.5;
        const tray = side === "L" ? TRAYS.left : TRAYS.right;
        const pick = new THREE.Vector3(tray.x + sx * 0.55, tray.y + 0.32, tray.z + sz * 0.55);
        const start = pick.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.08, 0.02 + Math.random() * 0.04, (Math.random() - 0.5) * 0.08));
        out.push({ target, start, pick, slot, phase: Math.random() * Math.PI * 2, side });
      }
    }
    return out;
  }, []);

  const traySlots = useMemo(() => {
    const slots: { side: "L" | "R"; slot: number; pos: THREE.Vector3 }[] = [];
    for (const side of ["L", "R"] as const) {
      const tray = side === "L" ? TRAYS.left : TRAYS.right;
      for (let slot = 0; slot < 16; slot++) {
        const sx = (slot % 4) - 1.5;
        const sz = Math.floor(slot / 4) - 1.5;
        slots.push({
          side,
          slot,
          pos: new THREE.Vector3(tray.x + sx * 0.55, tray.y + 0.26, tray.z + sz * 0.55),
        });
      }
    }
    return slots;
  }, []);

  useFrame((state) => {
    const p = progress.get();
    const g = groupRef.current;
    if (!g) return;

    const show = smoothstep(0.08, 0.28, p);
    g.visible = show > 0.001;
    g.position.set(CHIP.x, CHIP.y + (1 - show) * 0.7, CHIP.z);
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.18) * 0.05;

    // subtle "clock" breathing
    if (coreMatRef.current) {
      coreMatRef.current.emissiveIntensity = 0.18 + (0.08 * Math.sin(state.clock.elapsedTime * 1.2 + p * 4));
    }

    // scanline across die
    if (scanRef.current) {
      const t = state.clock.elapsedTime;
      scanRef.current.position.x = Math.sin(t * 0.75) * 1.35;
      scanRef.current.position.z = Math.cos(t * 0.6) * 0.8;
      scanRef.current.rotation.y = t * 0.25;
      (scanRef.current.material as THREE.MeshBasicMaterial).opacity = 0.06 + 0.05 * (0.5 + 0.5 * Math.sin(t * 1.4));
    }

    // pins activity (inside CPU group)
    const pinMesh = pinsRef.current;
    if (pinMesh) {
      pinMesh.visible = g.visible;
      for (let i = 0; i < pins.length; i++) {
        const pin = pins[i];
        tmpObj.position.set(pin.x, -0.72, pin.z);
        tmpObj.rotation.set(0, pin.rotY, 0);
        tmpObj.scale.set(1, 1, 1);
        tmpObj.updateMatrix();
        pinMesh.setMatrixAt(i, tmpObj.matrix);

        const activity = 0.35 + 0.35 * Math.sin(state.clock.elapsedTime * 2.2 + pin.phase + p * 3);
        tmpColor.copy(cDim).lerp(cBright, activity);
        pinMesh.setColorAt(i, tmpColor);
      }
      if (pinMesh.instanceColor) pinMesh.instanceColor.needsUpdate = true;
      pinMesh.instanceMatrix.needsUpdate = true;
    }

    // die tiles assembly (robot build)
    const tileMesh = tilesRef.current;
    if (tileMesh) {
      const build = smoothstep(0.12, 0.56, p);
      const n = tiles.length;
      const cur = Math.min(n - 1, Math.max(0, Math.floor(build * n)));

      // stage the arm: tray -> move -> place (to feel like "grab and place")
      const activeTile = tiles[cur];
      const curT = clamp01(build * n - cur); // 0..1

      leftActive.current = activeTile?.side === "L";
      rightActive.current = activeTile?.side === "R";
      leftCarry.current = false;
      rightCarry.current = false;
      leftJolt.current = 0;
      rightJolt.current = 0;

      if (activeTile) {
        const pick = activeTile.pick;
        const place = activeTile.target;
        // pickup clamp / pause
        const pickupJolt = gaussianPulse(curT, 0.35, 0.035);
        // placement clamp / pause
        const placeJolt = gaussianPulse(curT, 0.9, 0.04);

        const isPickupPause = curT > 0.31 && curT < 0.39;
        const isPlacePause = curT > 0.86 && curT < 0.94;

        if (curT < 0.31 || isPickupPause) {
          // approach + pause on tray
          if (activeTile.side === "L") leftTargetLocal.current.copy(pick);
          else rightTargetLocal.current.copy(pick);
        } else if (curT < 0.7) {
          // carry toward placement
          const mid = pick.clone().lerp(place, smoothstep(0.39, 0.7, curT));
          if (activeTile.side === "L") {
            leftTargetLocal.current.copy(mid);
            leftCarry.current = true;
          } else {
            rightTargetLocal.current.copy(mid);
            rightCarry.current = true;
          }
        } else if (isPlacePause) {
          // pause / clamp on placement
          if (activeTile.side === "L") {
            leftTargetLocal.current.copy(place);
            leftCarry.current = curT < 0.91;
          } else {
            rightTargetLocal.current.copy(place);
            rightCarry.current = curT < 0.91;
          }
        } else {
          // final place and release
          if (activeTile.side === "L") {
            leftTargetLocal.current.copy(place);
            leftCarry.current = curT < 0.9;
          } else {
            rightTargetLocal.current.copy(place);
            rightCarry.current = curT < 0.9;
          }
        }

        if (activeTile.side === "L") leftJolt.current = Math.min(1, pickupJolt + placeJolt);
        else rightJolt.current = Math.min(1, pickupJolt + placeJolt);
      }

      tileMesh.visible = g.visible;
      for (let i = 0; i < n; i++) {
        const tile = tiles[i];
        const t = clamp01(build * n - i);
        // hold on tray briefly (so arm can "grab"), then pop into place
        const moveT = t <= 0.35 ? 0 : clamp01((t - 0.35) / 0.65);
        const e = moveT <= 0 ? 0 : moveT >= 1 ? 1 : easeOutBack(moveT);

        tmpObj.position.copy(tile.start).lerp(tile.target, e);
        tmpObj.position.y += Math.sin(state.clock.elapsedTime * 0.9 + tile.phase) * 0.02 * (1 - moveT);
        const s = lerp(0.001, 1, e);
        tmpObj.scale.set(0.52 * s, 0.12 * s, 0.52 * s);
        tmpObj.rotation.set(0, Math.sin(tile.phase) * 0.12 * (1 - moveT), 0);
        tmpObj.updateMatrix();
        tileMesh.setMatrixAt(i, tmpObj.matrix);
      }
      tileMesh.instanceMatrix.needsUpdate = true;
    }

    // visible tile stacks on trays that deplete
    const build = smoothstep(0.12, 0.56, p);
    const n = tiles.length;
    const pickedBySlotL = new Array<number>(16).fill(0);
    const pickedBySlotR = new Array<number>(16).fill(0);
    for (let i = 0; i < n; i++) {
      const tile = tiles[i];
      const localT = clamp01(build * n - i);
      const picked = localT >= 0.35; // once the tile starts moving, it's "picked"
      if (!picked) continue;
      if (tile.side === "L") pickedBySlotL[tile.slot] += 1;
      else pickedBySlotR[tile.slot] += 1;
    }

    const depth = 4; // 4-high stacks; will empty as we pick repeatedly from each slot
    const updateTray = (trayRef: React.RefObject<THREE.InstancedMesh>, side: "L" | "R") => {
      const trayMesh = trayRef.current;
      if (!trayMesh) return;
      trayMesh.visible = g.visible;
      const pickedBySlot = side === "L" ? pickedBySlotL : pickedBySlotR;
      let instance = 0;
      for (const slotInfo of traySlots) {
        if (slotInfo.side !== side) continue;
        const pickedCount = pickedBySlot[slotInfo.slot] || 0;
        const remaining = Math.max(0, depth - pickedCount);
        for (let layer = 0; layer < depth; layer++) {
          const present = layer < remaining;
          tmpObj.position.copy(slotInfo.pos);
          tmpObj.position.y += layer * 0.14;
          tmpObj.rotation.set(0, 0, 0);
          const s = present ? 1 : 0.001;
          tmpObj.scale.set(0.52 * s, 0.12 * s, 0.52 * s);
          tmpObj.updateMatrix();
          trayMesh.setMatrixAt(instance, tmpObj.matrix);
          instance += 1;
        }
      }
      trayMesh.instanceMatrix.needsUpdate = true;
    };

    updateTray(trayLeftRef, "L");
    updateTray(trayRightRef, "R");
  });

  return (
    <group ref={groupRef}>
      {/* package */}
      <mesh position={[0, -0.45, 0]}>
        <boxGeometry args={[7.4, 0.9, 7.4]} />
        <meshStandardMaterial color="#111" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* heat spreader (silver top) */}
      <RoundedBox args={[5.8, 0.15, 5.8]} position={[0, 0.05, 0]} radius={0.05} smoothness={4}>
        <meshStandardMaterial color={THEME.silver} metalness={0.9} roughness={0.2} />
      </RoundedBox>

      {/* silk / top mark */}
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.5, 4.5]} />
        <meshBasicMaterial color="#000" transparent opacity={0.1} />
      </mesh>
      <Html transform distanceFactor={10} position={[-2.2, 0.14, 2.4]} rotation={[-Math.PI/2, 0, 0]} className="pointer-events-none">
        <div className="font-mono text-[8px] text-zinc-500/60 font-bold tracking-widest bg-white/5 px-2 py-1 rounded">
          M1 ULTRA · ARCH
        </div>
      </Html>

      {/* die - slightly raised */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[5.2, 0.1, 5.2]} />
        <meshStandardMaterial ref={coreMatRef} color="#050505" metalness={0.4} roughness={0.2} emissive={THEME.green} emissiveIntensity={0.1} />
        <Edges scale={1.01} color={THEME.green} threshold={10} />
      </mesh>
      <group position={[0, 0.08, 0]}>
         <DieTraces />
      </group>

      {/* capacitors around the die */}
      <group>
        {[...Array(8)].map((_, i) => (
           <mesh key={i} position={[2.8, 0.02, -2.4 + i*0.7]}>
             <boxGeometry args={[0.3, 0.2, 0.15]} />
             <meshStandardMaterial color={THEME.copper} metalness={0.8} roughness={0.3} />
           </mesh>
        ))}
         {[...Array(8)].map((_, i) => (
           <mesh key={i} position={[-2.8, 0.02, -2.4 + i*0.7]}>
             <boxGeometry args={[0.3, 0.2, 0.15]} />
             <meshStandardMaterial color={THEME.copper} metalness={0.8} roughness={0.3} />
           </mesh>
        ))}
      </group>

      {/* scan plane (light sweep) */}
      <mesh ref={scanRef as unknown as React.RefObject<THREE.Mesh>} position={[0, 0.4, 0]}>
        <planeGeometry args={[1.6, 5.4]} />
        <meshBasicMaterial color={THEME.green} transparent opacity={0.1} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* pins (QFP-ish vibes) - GOLD */}
      <instancedMesh ref={pinsRef} args={[null!, null!, pins.length]}>
        <boxGeometry args={[0.15, 0.08, 0.55]} />
        <meshStandardMaterial
          color={THEME.gold}
          emissive={THEME.gold}
          emissiveIntensity={0.2}
          metalness={1.0}
          roughness={0.15}
        />
      </instancedMesh>

      {/* tiles assembling on die */}
      <instancedMesh ref={tilesRef} args={[null!, null!, tiles.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={THEME.panel}
          metalness={0.4}
          roughness={0.4}
          emissive={THEME.green}
          emissiveIntensity={0.2}
          transparent
          opacity={0.95}
        />
      </instancedMesh>

      {/* robotic arms building the chip */}
      <RobotArm
        chipGroupRef={groupRef}
        baseLocal={[-9.4, 0.1, 6.6]}
        targetLocalRef={leftTargetLocal}
        activeRef={leftActive}
        carryRef={leftCarry}
        joltRef={leftJolt}
      />
      <RobotArm
        chipGroupRef={groupRef}
        baseLocal={[9.4, 0.1, 6.6]}
        targetLocalRef={rightTargetLocal}
        activeRef={rightActive}
        carryRef={rightCarry}
        joltRef={rightJolt}
      />

      {/* trays */}
      <group position={[0, -0.35, 0]}>
        <mesh position={[TRAYS.left.x, 0.2, TRAYS.left.z]}>
          <boxGeometry args={[2.9, 0.12, 2.2]} />
          <meshStandardMaterial color={THEME.panel} metalness={0.25} roughness={0.7} emissive={THEME.green} emissiveIntensity={0.06} />
          <Edges scale={1.02} color={THEME.greenDim} />
        </mesh>
        <mesh position={[TRAYS.right.x, 0.2, TRAYS.right.z]}>
          <boxGeometry args={[2.9, 0.12, 2.2]} />
          <meshStandardMaterial color={THEME.panel} metalness={0.25} roughness={0.7} emissive={THEME.green} emissiveIntensity={0.06} />
          <Edges scale={1.02} color={THEME.greenDim} />
        </mesh>

        {/* tray slot dividers (feeder cassette) */}
        {(["L", "R"] as const).map((side) => {
          const tray = side === "L" ? TRAYS.left : TRAYS.right;
          const baseY = 0.27;
          const w = 2.6;
          const d = 2.0;
          const cols = 4;
          const rows = 4;
          const x0 = tray.x - w / 2;
          const z0 = tray.z - d / 2;
          const lines: [number, number, number][][] = [];
          for (let c = 0; c <= cols; c++) {
            const x = x0 + (w * c) / cols;
            lines.push([
              [x, baseY, z0],
              [x, baseY, z0 + d],
            ]);
          }
          for (let r = 0; r <= rows; r++) {
            const z = z0 + (d * r) / rows;
            lines.push([
              [x0, baseY, z],
              [x0 + w, baseY, z],
            ]);
          }
          return (
            <group key={side}>
              {lines.map((pts, i) => (
                <Line
                  key={i}
                  points={pts}
                  color={THEME.greenDim}
                  transparent
                  opacity={0.22}
                  lineWidth={1}
                />
              ))}
            </group>
          );
        })}
      </group>

      {/* visible tile stacks on trays */}
      <instancedMesh ref={trayLeftRef} args={[null!, null!, 16 * 4]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={THEME.panel}
          metalness={0.22}
          roughness={0.6}
          emissive={THEME.green}
          emissiveIntensity={0.1}
          transparent
          opacity={0.9}
        />
      </instancedMesh>
      <instancedMesh ref={trayRightRef} args={[null!, null!, 16 * 4]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={THEME.panel}
          metalness={0.22}
          roughness={0.6}
          emissive={THEME.green}
          emissiveIntensity={0.1}
          transparent
          opacity={0.9}
        />
      </instancedMesh>
    </group>
  );
}

function MemoryModules({ progress }: { progress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);

  const modules = useMemo(() => {
    const sticks = 6;
    const left: THREE.Vector3[] = [];
    const right: THREE.Vector3[] = [];
    for (let i = 0; i < sticks; i++) {
      left.push(new THREE.Vector3(-11.5, -1.55, -22 - i * 4.2));
      right.push(new THREE.Vector3(11.5, -1.55, -22 - i * 4.2));
    }
    return { left, right };
  }, []);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const p = progress.get();
    const show = smoothstep(0.18, 0.36, p) * (1 - smoothstep(0.78, 0.95, p));
    g.visible = show > 0.001;
    g.position.y = -0.05 + (1 - show) * 0.5;
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
  });

  return (
    <group ref={groupRef}>
      {modules.left.map((pos, i) => (
        <group key={`l-${i}`} position={pos}>
          <mesh rotation={[0, 0.15, 0]}>
            <boxGeometry args={[2.2, 0.35, 0.55]} />
            <meshStandardMaterial color={THEME.panel} emissive={THEME.green} emissiveIntensity={0.1} metalness={0.2} roughness={0.65} />
            <Edges scale={1.01} color={THEME.greenDim} />
          </mesh>
        </group>
      ))}
      {modules.right.map((pos, i) => (
        <group key={`r-${i}`} position={pos}>
          <mesh rotation={[0, -0.15, 0]}>
            <boxGeometry args={[2.2, 0.35, 0.55]} />
            <meshStandardMaterial color={THEME.panel} emissive={THEME.green} emissiveIntensity={0.1} metalness={0.2} roughness={0.65} />
            <Edges scale={1.01} color={THEME.greenDim} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

type BeatRef = React.RefObject<{ lastBeatTime: number; beatCount: number }>;

function AnimatedBuses({ progress, beatRef }: { progress: MotionValue<number>; beatRef: BeatRef }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineRefs = useRef<any[]>([]);

  const buses = useMemo(() => {
    const y = -1.1;
    const z0 = -34;
    return [
      { a: [-3.2, y, z0], b: [-11.2, y - 0.45, -30] },
      { a: [3.2, y, z0], b: [11.2, y - 0.45, -30] },
      { a: [-2.2, y, z0 - 2.2], b: [-11.2, y - 0.45, -40] },
      { a: [2.2, y, z0 - 2.2], b: [11.2, y - 0.45, -40] },
      { a: [0, y, z0 + 2.2], b: [0, y - 0.85, -10] },
    ] as { a: [number, number, number]; b: [number, number, number] }[];
  }, []);

  useFrame((state) => {
    const p = progress.get();
    const show = smoothstep(0.18, 0.36, p) * (1 - smoothstep(0.85, 0.98, p));
    const since = state.clock.elapsedTime - beatRef.current.lastBeatTime;
    const beat = Math.exp(-since * 4.2); // fast decay
    for (const ref of lineRefs.current) {
      if (!ref?.material) continue;
      ref.visible = show > 0.001;
      ref.material.opacity = 0.12 + show * 0.28 + beat * 0.22;
      // animate dashes to feel like "signals" without dots
      if (typeof ref.material.dashOffset === "number") {
        ref.material.dashOffset = -state.clock.elapsedTime * (0.75 + p) - beat * 0.45;
      }
    }
  });

  return (
    <group>
      {buses.map((b, i) => (
        <Line
          key={i}
          ref={(r) => {
            if (r) lineRefs.current[i] = r;
          }}
          points={[b.a, b.b]}
          color={THEME.green}
          transparent
          opacity={0.2}
          lineWidth={1}
          dashed
          dashScale={1}
          dashSize={0.35}
          gapSize={0.55}
        />
      ))}
    </group>
  );
}

function MergeWave({ progress }: { progress: MotionValue<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const p = progress.get();
    const t = smoothstep(0.58, 0.82, p);
    const wave = t * (1 - smoothstep(0.82, 0.95, p));
    const m = meshRef.current;
    const mat = matRef.current;
    if (!m || !mat) return;
    m.visible = wave > 0.001;
    m.scale.set(lerp(0.4, 18, wave), 1, lerp(0.4, 18, wave));
    m.rotation.y = state.clock.elapsedTime * 0.12;
    mat.opacity = 0.16 * (1 - wave) + 0.03;
  });

  return (
    <mesh ref={meshRef} position={[0, -2.22, -44]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.2, 1.6, 96]} />
      <meshBasicMaterial ref={matRef} color={THEME.green} transparent opacity={0.08} depthWrite={false} />
    </mesh>
  );
}

function InstructionPipeline({ progress, beatRef }: { progress: MotionValue<number>; beatRef: BeatRef }) {
  const groupRef = useRef<THREE.Group>(null);
  const laneMats = useRef<THREE.MeshStandardMaterial[]>([]);
  const instrRef = useRef<THREE.Mesh>(null);
  const prevStage = useRef<number>(-1);

  const stages = useMemo(
    () => [
      { key: "F", name: "Fetch", x: -3.3 },
      { key: "D", name: "Decode", x: -1.1 },
      { key: "E", name: "Execute", x: 1.1 },
      { key: "W", name: "Writeback", x: 3.3 },
    ],
    []
  );

  useFrame((state) => {
    const p = progress.get();
    const g = groupRef.current;
    if (!g) return;
    const show = smoothstep(0.34, 0.46, p) * (1 - smoothstep(0.92, 1.0, p));
    g.visible = show > 0.001;
    g.position.set(0, 1.35 + (1 - show) * 0.6, CHIP.z - 6);
    g.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;

    // Scroll drives instruction through stages
    const t = rangeProgress(0.38, 0.86, p);
    const z = lerp(8, -42, t);
    const stageIdx = Math.min(3, Math.max(0, Math.floor(t * 4)));
    const within = (t * 4) - stageIdx;

    if (stageIdx !== prevStage.current) {
      prevStage.current = stageIdx;
      beatRef.current.lastBeatTime = state.clock.elapsedTime;
      beatRef.current.beatCount += 1;
    }

    // lane lighting
    for (let i = 0; i < stages.length; i++) {
      const mat = laneMats.current[i];
      if (!mat) continue;
      const active = i === stageIdx ? 1 : 0;
      const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2.2 + i * 1.3);
      mat.emissiveIntensity = 0.06 + (active ? 0.22 + pulse * 0.12 : 0.05);
      mat.opacity = 0.14 + show * (active ? 0.22 : 0.12);
    }

    const instr = instrRef.current;
    if (instr) {
      const xFrom = stages[stageIdx]?.x ?? 0;
      const xTo = stages[Math.min(3, stageIdx + 1)]?.x ?? xFrom;
      const x = lerp(xFrom, xTo, smoothstep(0, 1, within));
      instr.position.set(x, 0.18, z);
      instr.rotation.y = state.clock.elapsedTime * 0.6;
      const s = 0.55 + 0.08 * Math.sin(state.clock.elapsedTime * 3.2);
      instr.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      {/* lanes */}
      {stages.map((s, i) => (
        <group key={s.key} position={[s.x, 0, 0]}>
          <mesh
            ref={(r) => {
              if (r?.material) laneMats.current[i] = r.material as THREE.MeshStandardMaterial;
            }}
            rotation={[0, 0, 0]}
          >
            <boxGeometry args={[1.7, 0.22, 12]} />
            <meshStandardMaterial
              color={THEME.panel}
              metalness={0.18}
              roughness={0.65}
              emissive={THEME.green}
              emissiveIntensity={0.08}
              transparent
              opacity={0.18}
            />
            <Edges scale={1.01} color={THEME.greenDim} />
          </mesh>
          <Html transform distanceFactor={11} position={[-0.7, 0.35, 4.7]} className="pointer-events-none">
            <div className="rounded-md border border-border/60 bg-secondary/20 backdrop-blur px-2 py-1 font-mono text-[10px] text-foreground">
              {s.name}
            </div>
          </Html>
        </group>
      ))}

      {/* instruction token */}
      <mesh ref={instrRef} position={[0, 0.18, 6]}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          color={THEME.bg}
          emissive={THEME.green}
          emissiveIntensity={2.1}
          roughness={0.5}
          metalness={0.25}
        />
      </mesh>
    </group>
  );
}

function DigitalRain({ count = 120 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const themeColor = new THREE.Color(THEME.green);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const drops = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 140, 
      y: Math.random() * 60 + 10,
      z: -30 - Math.random() * 50,
      speed: Math.random() * 0.4 + 0.1,
      len: Math.random() * 2 + 0.5,
      phase: Math.random() * Math.PI * 2
    }));
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    
    drops.forEach((d, i) => {
      // falling loops
      const y = ((d.y - t * d.speed * 10) % 60) - 10;
      dummy.position.set(d.x, y, d.z);
      dummy.scale.set(0.08, d.len, 0.08);
      dummy.rotation.y = d.phase;
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null!, null!, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={themeColor} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}

function FloatingCode() {
  const snippets = [
    "git commit -m 'feat: init'", "npm install", "const ref = useRef()", 
    "docker build .", "optimization: true", "0x5f3759df", 
    "console.log('Hello')", "if (err) throw err", "chmod +x script.sh",
    "background-color: #000", "return <Canvas />", "await fetch('/api')"
  ];
  
  return (
    <group>
      {snippets.map((text, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={0.5} floatIntensity={1}>
           <group position={[
              (Math.random() - 0.5) * 120,
              Math.random() * 40 - 10,
              -20 - Math.random() * 60
           ]} rotation={[0, (Math.random()-0.5)*0.5, 0]}>
              <Text
                font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff" // Generic tech font fallback
                fontSize={0.8}
                color={THEME.green}
                fillOpacity={0.15}
              >
                {text}
              </Text>
           </group>
        </Float>
      ))}
    </group>
  );
}

function CinematicEffects() {
    return (
        <EffectComposer>
            <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.75} radius={0.6} />
            <Noise opacity={0.025} />
            <Vignette eskil={false} offset={0.1} darkness={0.85} />
            <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} radialModulation={false} modulationOffset={0} />
        </EffectComposer>
    )
}

function DistantGrid() {
    return (
        <group position={[0, 40, -60]} rotation={[0.4, 0, 0]}>
             <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[200, 200, 40, 40]} />
                <meshBasicMaterial color={THEME.greenDim} wireframe transparent opacity={0.03} />
            </mesh>
        </group>
    )
}


function FloatingGeo() {
  const groupRef = useRef<THREE.Group>(null);
  const objects = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      pos: new THREE.Vector3((Math.random()-0.5)*180, (Math.random()-0.5)*80, -40 - Math.random()*80),
      rot: new THREE.Vector3(Math.random(), Math.random(), Math.random()), 
      scale: Math.random() * 2 + 1,
      speed: Math.random() * 0.1 + 0.02
    }));
  }, []);

  useFrame((state) => {
    if(!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <group ref={groupRef}>
      {objects.map((obj, i) => (
         <mesh key={i} position={obj.pos} rotation={obj.rot.toArray() as [number,number,number]} scale={obj.scale}>
           <icosahedronGeometry args={[1, 0]} />
           <meshBasicMaterial color={THEME.greenDim} wireframe transparent opacity={0.05} />
         </mesh>
      ))}
    </group>
  );
}

function CyberRings() {
    const groupRef = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.z = state.clock.elapsedTime * 0.05;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, -80]}>
            {[...Array(3)].map((_, i) => (
                <mesh key={i} rotation={[0, 0, i * 2]}>
                    <ringGeometry args={[30 + i * 15, 30.5 + i * 15, 64]} />
                    <meshBasicMaterial color={THEME.greenDim} transparent opacity={0.06} side={THREE.DoubleSide} />
                </mesh>
            ))}
        </group>
    )
}

function DigitalAtmosphere({ progress }: { progress: MotionValue<number> }) {
  return (
    <group>
        <DigitalRain />
        <DistantGrid />
        <CyberRings />
        <FloatingGeo />
        <FloatingCode />
        <group position={[0, -20, -80]}>
           {[...Array(6)].map((_, i) => (
               <mesh key={i} position={[(i - 2.5) * 30, 0, -Math.abs(i-2.5)*10]}>
                  <boxGeometry args={[4, 120, 4]} />
                  <meshBasicMaterial color={THEME.panel} transparent opacity={0.05} />
                  <Edges color={THEME.greenDim} opacity={0.1} />
               </mesh>
           ))}
        </group>
    </group>
  );
}

function CameraRig({ progress }: { progress: MotionValue<number> }) {
  const camTarget = useMemo(() => new THREE.Vector3(), []);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const beatRef = useRef({ lastBeatTime: 0, beatCount: 0 });

  useFrame((state) => {
    const p = clamp01(progress.get());

    const intro = rangeProgress(0, 0.18, p);
    const dive = rangeProgress(0.18, 0.34, p);
    const roam = rangeProgress(0.34, 0.72, p);
    const merge = rangeProgress(0.72, 0.9, p);
    const outro = rangeProgress(0.9, 1, p);

    // focus the whole film around the CPU die (a real "3D world" anchor)
    if (p < 0.18) {
      // outside the computer looking at the screen
      camTarget.set(0, lerp(2.6, 1.8, intro), lerp(26, 14.5, intro));
      lookTarget.set(0, 0.8, -7.5);
    } else if (p < 0.34) {
      // dive into the computer - warp speed feel
      camTarget.set(0, lerp(1.8, 0.35, dive), lerp(14.5, -6.5, dive));
      lookTarget.set(0, lerp(0.8, -0.7, dive), lerp(-7.5, -24, dive));
    } else if (p < 0.72) {
      const a = roam * Math.PI * 2;
      camTarget.set(
        Math.sin(a) * 3.8, // wider swing
        0.8 + Math.cos(a * 0.7) * 0.8, // more vertical range
        lerp(-6.5, 4.8, 1 - roam)
      );
      lookTarget.set(Math.sin(a * 2) * 2, -1.5, -34); // Look around a bit more dynamically
    } else if (p < 0.9) {
      // dramatically look at the merge center
      camTarget.set(Math.sin(merge * Math.PI) * 1.5, lerp(0.8, 0.4, merge), lerp(4.8, 2.9, merge));
      lookTarget.set(0, -1.1, -36);
    } else {
      camTarget.set(0, lerp(0.35, 0.5, outro), lerp(2.4, 3.5, outro));
      lookTarget.set(0, -1.2, -40);
    }

    // cinematic handheld drift
    const t = state.clock.elapsedTime;
    camTarget.x += Math.sin(t * 0.2) * 0.1;
    camTarget.y += Math.cos(t * 0.25) * 0.08;
    camTarget.z += Math.sin(t * 0.15) * 0.05;

    state.camera.position.lerp(camTarget, 0.05); // heavier smoothing for weight
    state.camera.lookAt(lookTarget);
  });

  return (
    <>
      <CinematicEffects />
      
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#b3ffb3" castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={THEME.green} />
      <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={2} color={THEME.gold} distance={40} />
      
      {/* Environment map for realistic metallic reflections */}
      <Environment preset="city" />

      <DigitalAtmosphere progress={progress} />

      {/* Floating dust particles for 3D feel */}
      <FloatingParticles count={600} />

      <Float speed={0.8} rotationIntensity={0.02} floatIntensity={0.05}>
        <ComputerIntro progress={progress} />
      </Float>
      
      <EntryTunnel progress={progress} />
      <CircuitFloor progress={progress} />
      <CpuChip progress={progress} />
      <MemoryModules progress={progress} />
      <AnimatedBuses progress={progress} beatRef={beatRef} />
      <MergeWave progress={progress} />
      <InstructionPipeline progress={progress} beatRef={beatRef} />
    </>
  );
}


export default function GitWorldBackground({ targetRef }: { targetRef: React.RefObject<HTMLElement> }) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, { mass: 0.2, stiffness: 90, damping: 20, restDelta: 0.0001 });

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.8, 18], fov: 52, near: 0.1, far: 280 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={[THEME.bg]} />
        <fog attach="fog" args={[THEME.bg, 14, 110]} />
        <CameraRig progress={smoothProgress} />
      </Canvas>
    </div>
  );
}

