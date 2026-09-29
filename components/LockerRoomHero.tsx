"use client";

import { Suspense, useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Drop } from "@/data/drops";

// ── Scene constants ──────────────────────────────────────────────────────────
const BX  = 1.55;       // outer X of each locker bank
const LD  = 0.54;       // locker depth (front-to-back, along X)
const LH  = 2.2;        // locker height
const LW  = 0.72;       // single slot width (along Z corridor axis)
const IFX = BX - LD;   // inner face X ≈ 1.01
const FY  = -1.1;       // floor Y
const T   = 0.022;      // panel thickness
const Z0  = 4.5;        // corridor start Z (near-camera end)
const NR  = 7;          // right-bank slot count
const NL  = 6;          // left-bank slot count

// Z-centre of slot i (i=0 is closest to camera)
const sz = (i: number) => Z0 - i * LW - LW / 2;

// ── Products (replace hex / name / price with Supabase later) ───────────────
const PRODUCTS = [
  { name: "Phantom Jersey", look: "01", price: "$89",  hex: "#1E40AF" },
  { name: "Eclipse Jersey", look: "02", price: "$94",  hex: "#991B1B" },
  { name: "Solaris Jersey", look: "03", price: "$99",  hex: "#166534" },
];

// Right-bank slots that are "featured" (animated door + jersey)
const FEAT = [1, 3, 5];
const FZ   = FEAT.map(sz); // world Z of each featured locker

// ── Camera keyframes ─────────────────────────────────────────────────────────
function v(x: number, y: number, z: number) { return new THREE.Vector3(x, y, z); }

const CK = [
  { p: 0.00, pos: v(0.30, 0.70, 6.5),          look: v(0.0, 0.50,  1.0) },
  { p: 0.08, pos: v(0.30, 0.70, 6.5),          look: v(0.0, 0.50,  1.0) }, // intro hold
  { p: 0.22, pos: v(0.95, 0.55, FZ[0] + 0.44), look: v(IFX + 0.15, 0.82, FZ[0]) },
  { p: 0.36, pos: v(0.95, 0.55, FZ[0] + 0.44), look: v(IFX + 0.15, 0.82, FZ[0]) }, // WP1 hold
  { p: 0.52, pos: v(0.95, 0.55, FZ[1] + 0.44), look: v(IFX + 0.15, 0.82, FZ[1]) },
  { p: 0.64, pos: v(0.95, 0.55, FZ[1] + 0.44), look: v(IFX + 0.15, 0.82, FZ[1]) }, // WP2 hold
  { p: 0.77, pos: v(0.95, 0.55, FZ[2] + 0.44), look: v(IFX + 0.15, 0.82, FZ[2]) },
  { p: 0.87, pos: v(0.95, 0.55, FZ[2] + 0.44), look: v(IFX + 0.15, 0.82, FZ[2]) }, // WP3 hold
  { p: 0.93, pos: v(0.00, 1.40, 3.2),           look: v(0.0, 0.50, -1.0) },          // climax pullback
  { p: 1.00, pos: v(0.00, 1.40, 3.2),           look: v(0.0, 0.50, -1.0) },
];

// Door open timing (per featured locker)
const DOOR_S = [0.22, 0.52, 0.77]; // open start
const DOOR_E = [0.31, 0.60, 0.84]; // fully open
// Product info overlay timing
const INFO_S = [0.30, 0.59, 0.82];
const INFO_E = [0.50, 0.72, 0.91];

// ── Utilities ────────────────────────────────────────────────────────────────
function eio(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function getCam(p: number) {
  for (let i = 0; i < CK.length - 1; i++) {
    const a = CK[i], b = CK[i + 1];
    if (p >= a.p && p <= b.p) {
      const t = eio((p - a.p) / (b.p - a.p));
      return { pos: a.pos.clone().lerp(b.pos, t), look: a.look.clone().lerp(b.look, t) };
    }
  }
  const L = CK[CK.length - 1];
  return { pos: L.pos.clone(), look: L.look.clone() };
}

// Featured lockers are on right wall → negative Y rotation opens door into corridor
function doorTarget(p: number, i: number) {
  const open = -Math.PI * 0.72;
  if (p < DOOR_S[i]) return 0;
  if (p >= DOOR_E[i]) return open;
  return open * eio((p - DOOR_S[i]) / (DOOR_E[i] - DOOR_S[i]));
}

// ── CameraController ──────────────────────────────────────────────────────────
function CameraController({
  progressRef,
  featDoorRefs,
  bgRDoorRefs,
  bgLDoorRefs,
}: {
  progressRef:  React.MutableRefObject<number>;
  featDoorRefs: React.RefObject<THREE.Group | null>[];
  bgRDoorRefs:  React.MutableRefObject<(THREE.Group | null)[]>;
  bgLDoorRefs:  React.MutableRefObject<(THREE.Group | null)[]>;
}) {
  const dummy = useRef(new THREE.Object3D());

  useFrame(({ camera }) => {
    const p = progressRef.current;
    const { pos, look } = getCam(p);

    // Smooth camera position + rotation
    camera.position.lerp(pos, 0.04);
    dummy.current.position.copy(camera.position);
    dummy.current.lookAt(look);
    camera.quaternion.slerp(dummy.current.quaternion, 0.04);

    // Featured door animations
    featDoorRefs.forEach((ref, i) => {
      const g = ref.current;
      if (!g) return;
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, doorTarget(p, i), 0.07);
    });

    // Climax: all background doors open (staggered)
    const climT = Math.max(0, (p - 0.91) / 0.08);
    bgRDoorRefs.current.forEach((g, i) => {
      if (!g) return;
      const t = Math.max(0, Math.min(1, (climT - i * 0.06) * 2));
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, -Math.PI * 0.68 * eio(t), 0.05);
    });
    bgLDoorRefs.current.forEach((g, i) => {
      if (!g) return;
      const t = Math.max(0, Math.min(1, (climT - i * 0.06) * 2));
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, +Math.PI * 0.68 * eio(t), 0.05);
    });
  });

  return null;
}

// ── DoorGroup — hinge at far-Z edge of locker slot ───────────────────────────
// Right wall (side=+1): negative rotation opens into corridor
// Left  wall (side=-1): positive rotation opens into corridor
type AnyRef =
  | React.RefObject<THREE.Group | null>
  | ((el: THREE.Group | null) => void);

function DoorGroup({
  lockerZ, side, mat, matHandle, groupRef,
}: {
  lockerZ:  number;
  side:     1 | -1;
  mat:      THREE.MeshStandardMaterial;
  matHandle: THREE.MeshStandardMaterial;
  groupRef?: AnyRef;
}) {
  return (
    // Hinge pivot at far-Z edge (lower Z = deeper in corridor)
    <group
      ref={groupRef as React.Ref<THREE.Group>}
      position={[side * IFX, FY + LH / 2, lockerZ - LW / 2]}
    >
      {/* Door panel: center is LW/2 toward near-camera from hinge */}
      <mesh position={[0, 0, LW / 2 - T / 2]} material={mat}>
        <boxGeometry args={[T * 1.5, LH - T * 2, LW - T * 2]} />
      </mesh>
      {/* Handle on corridor-facing side */}
      <mesh position={[-side * T, -(LH * 0.06), LW * 0.35]} material={matHandle}>
        <boxGeometry args={[0.018, 0.09, 0.014]} />
      </mesh>
    </group>
  );
}

// ── Jersey — simple T silhouette ─────────────────────────────────────────────
function Jersey({ mat }: { mat: THREE.MeshStandardMaterial }) {
  return (
    <group>
      <mesh material={mat}>
        <boxGeometry args={[0.03, LH * 0.26, LW * 0.43]} />
      </mesh>
      <mesh position={[0, LH * 0.135, 0]} material={mat}>
        <boxGeometry args={[0.03, LH * 0.062, LW * 0.60]} />
      </mesh>
    </group>
  );
}

// ── FeaturedLocker — open-box panels + interior + jersey + animated door ──────
function FeaturedLocker({
  z, mat, matDoor, matHandle, matInterior, matJersey, doorRef,
}: {
  z:          number;
  mat:        THREE.MeshStandardMaterial;
  matDoor:    THREE.MeshStandardMaterial;
  matHandle:  THREE.MeshStandardMaterial;
  matInterior: THREE.MeshStandardMaterial;
  matJersey:  THREE.MeshStandardMaterial;
  doorRef:    React.RefObject<THREE.Group | null>;
}) {
  const cx = BX - LD / 2; // X centre of locker body
  const cy = FY + LH / 2;

  return (
    <group>
      {/* Back panel */}
      <mesh position={[BX - T / 2, cy, z]} material={mat}>
        <boxGeometry args={[T, LH, LW]} />
      </mesh>
      {/* Left side */}
      <mesh position={[cx, cy, z - LW / 2 + T / 2]} material={mat}>
        <boxGeometry args={[LD - T, LH, T]} />
      </mesh>
      {/* Right side */}
      <mesh position={[cx, cy, z + LW / 2 - T / 2]} material={mat}>
        <boxGeometry args={[LD - T, LH, T]} />
      </mesh>
      {/* Top */}
      <mesh position={[cx, FY + LH - T / 2, z]} material={mat}>
        <boxGeometry args={[LD, T, LW]} />
      </mesh>
      {/* Bottom */}
      <mesh position={[cx, FY + T / 2, z]} material={mat}>
        <boxGeometry args={[LD, T, LW]} />
      </mesh>
      {/* Mid shelf */}
      <mesh position={[cx, FY + LH * 0.46, z]} material={mat}>
        <boxGeometry args={[LD - T * 2, T, LW - T * 2]} />
      </mesh>

      {/* Warm interior back surface — emissive glow when door opens */}
      <mesh position={[BX - T * 1.5, cy, z]} material={matInterior}>
        <boxGeometry args={[T * 0.4, LH - T * 4, LW - T * 4]} />
      </mesh>

      {/* Jersey in upper half of locker */}
      <group position={[cx, FY + LH * 0.72, z]}>
        <Jersey mat={matJersey} />
      </group>

      {/* Animated door */}
      <DoorGroup
        lockerZ={z}
        side={1}
        mat={matDoor}
        matHandle={matHandle}
        groupRef={doorRef}
      />
    </group>
  );
}

// ── BgLocker — cheap single-box locker + animated door ───────────────────────
function BgLocker({
  z, side, mat, matDoor, matHandle, doorRefCb,
}: {
  z:         number;
  side:      1 | -1;
  mat:       THREE.MeshStandardMaterial;
  matDoor:   THREE.MeshStandardMaterial;
  matHandle: THREE.MeshStandardMaterial;
  doorRefCb: (el: THREE.Group | null) => void;
}) {
  return (
    <group>
      <mesh position={[side * (BX - LD / 2), FY + LH / 2, z]} material={mat}>
        <boxGeometry args={[LD, LH, LW - T * 2]} />
      </mesh>
      <DoorGroup
        lockerZ={z}
        side={side}
        mat={matDoor}
        matHandle={matHandle}
        groupRef={doorRefCb}
      />
    </group>
  );
}

// ── LockerScene ───────────────────────────────────────────────────────────────
function LockerScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  // Door refs — individual for featured, arrays for background
  const door0 = useRef<THREE.Group | null>(null);
  const door1 = useRef<THREE.Group | null>(null);
  const door2 = useRef<THREE.Group | null>(null);
  const bgRDoorRefs = useRef<(THREE.Group | null)[]>([]);
  const bgLDoorRefs = useRef<(THREE.Group | null)[]>([]);

  // Materials — all created at scene root, passed as props (no missing-material bugs)
  const matBody = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#141414", metalness: 0.72, roughness: 0.36 }),
    []
  );
  const matDoor = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#1d1d1d", metalness: 0.78, roughness: 0.28 }),
    []
  );
  const matHandle = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#a06520",
        metalness: 0.88,
        roughness: 0.18,
        emissive: new THREE.Color("#FF5010"),
        emissiveIntensity: 0.28,
      }),
    []
  );
  const matInterior = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2a0f02",
        metalness: 0.1,
        roughness: 0.85,
        emissive: new THREE.Color("#FF6010"),
        emissiveIntensity: 0.14,
      }),
    []
  );
  const matFloor = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#0c0c0c", metalness: 0.50, roughness: 0.38 }),
    []
  );
  const matCeil = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#060606", metalness: 0.05, roughness: 0.95 }),
    []
  );
  const jerseyMats = useMemo(
    () =>
      PRODUCTS.map(
        (pr) => new THREE.MeshStandardMaterial({ color: pr.hex, metalness: 0.12, roughness: 0.78 })
      ),
    []
  );

  const bgRSlots = Array.from({ length: NR }, (_, i) => i).filter((i) => !FEAT.includes(i)); // [0,2,4,6]
  const bgLSlots = Array.from({ length: NL }, (_, i) => i);

  return (
    <>
      {/* 4 lights total — safe on all hardware */}
      <ambientLight intensity={0.08} />
      <directionalLight position={[0, 6, 2]} intensity={0.18} color="#c8d8f0" />
      {/* Hero amber — centred on middle featured locker, illuminates all 3 */}
      <pointLight
        position={[1.1, FY + LH * 0.58, FZ[1]]}
        intensity={4.0}
        color="#FFA838"
        distance={5}
        decay={2}
      />
      {/* Vanishing-point corridor glow */}
      <pointLight
        position={[0, FY + LH * 0.5, -4.5]}
        intensity={0.75}
        color="#FF7020"
        distance={8}
        decay={2}
      />

      {/* Featured lockers (right wall, slots 1, 3, 5) */}
      <FeaturedLocker
        z={FZ[0]}
        mat={matBody} matDoor={matDoor} matHandle={matHandle}
        matInterior={matInterior} matJersey={jerseyMats[0]}
        doorRef={door0}
      />
      <FeaturedLocker
        z={FZ[1]}
        mat={matBody} matDoor={matDoor} matHandle={matHandle}
        matInterior={matInterior} matJersey={jerseyMats[1]}
        doorRef={door1}
      />
      <FeaturedLocker
        z={FZ[2]}
        mat={matBody} matDoor={matDoor} matHandle={matHandle}
        matInterior={matInterior} matJersey={jerseyMats[2]}
        doorRef={door2}
      />

      {/* Background right lockers (slots 0, 2, 4, 6) */}
      {bgRSlots.map((si, i) => (
        <BgLocker
          key={si}
          z={sz(si)}
          side={1}
          mat={matBody} matDoor={matDoor} matHandle={matHandle}
          doorRefCb={(el) => { bgRDoorRefs.current[i] = el; }}
        />
      ))}

      {/* Background left lockers (all 6) */}
      {bgLSlots.map((si, i) => (
        <BgLocker
          key={si}
          z={sz(si)}
          side={-1}
          mat={matBody} matDoor={matDoor} matHandle={matHandle}
          doorRefCb={(el) => { bgLDoorRefs.current[i] = el; }}
        />
      ))}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FY, 1]} material={matFloor}>
        <planeGeometry args={[4.2, 14]} />
      </mesh>
      {/* Ceiling strip */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, FY + LH + 0.06, 1]} material={matCeil}>
        <planeGeometry args={[IFX * 2 + 0.1, 14]} />
      </mesh>
      {/* Far back wall */}
      <mesh position={[0, FY + LH / 2, -5.5]} material={matCeil}>
        <planeGeometry args={[4.2, LH + 0.3]} />
      </mesh>

      <CameraController
        progressRef={progressRef}
        featDoorRefs={[door0, door1, door2]}
        bgRDoorRefs={bgRDoorRefs}
        bgLDoorRefs={bgLDoorRefs}
      />
    </>
  );
}

// ── ProductOverlay — HTML overlay, opacity driven by scroll ──────────────────
function ProductOverlay({
  infoRefs,
}: {
  infoRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {PRODUCTS.map((p, i) => (
        <div
          key={i}
          ref={(el) => { infoRefs.current[i] = el; }}
          style={{
            position: "absolute",
            left: "5%",
            bottom: "18%",
            opacity: 0,
            transition: "opacity 0.5s ease",
          }}
        >
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.38em] text-white/50">
            Look {p.look}
          </p>
          <h2 className="font-display text-3xl font-bold uppercase text-white md:text-5xl tracking-widest">
            {p.name}
          </h2>
          <p className="mt-2 font-semibold text-accent" style={{ fontSize: "1.15rem" }}>
            {p.price}
          </p>
          <button
            className="pointer-events-auto mt-5 border border-white/30 px-6 py-2 text-[11px] font-bold uppercase tracking-widest text-white/80 transition-colors hover:bg-white/10"
            type="button"
          >
            Shop Now →
          </button>
        </div>
      ))}
    </div>
  );
}

// ── LockerRoomHero ────────────────────────────────────────────────────────────
export default function LockerRoomHero({ drop }: { drop: Drop }) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const progressRef   = useRef<number>(0);
  const infoRefs      = useRef<(HTMLDivElement | null)[]>([null, null, null]);

  useEffect(() => {
    progressRef.current = 0;

    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const scrolled = -el.getBoundingClientRect().top;
      const total    = el.offsetHeight - window.innerHeight;
      const p        = Math.max(0, Math.min(1, scrolled / total));
      progressRef.current = p;

      // Toggle product info opacity via DOM (no React state = no re-renders)
      for (let i = 0; i < 3; i++) {
        const ref = infoRefs.current[i];
        if (!ref) continue;
        ref.style.opacity = (p >= INFO_S[i] && p <= INFO_E[i]) ? "1" : "0";
      }

      // Fade canvas out at the very end so normal page content takes over
      const fadeOut = Math.max(0, (p - 0.96) / 0.04);
      if (canvasWrapRef.current) {
        canvasWrapRef.current.style.opacity = String(1 - fadeOut);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // 600vh container — user scrolls through this to drive the 3D camera
    <div ref={containerRef} style={{ height: "600vh", position: "relative" }}>
      {/* Sticky viewport: stays fixed while container scrolls past */}
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>

        {/* 3D Canvas */}
        <div
          ref={canvasWrapRef}
          className="absolute inset-0"
          style={{ transition: "opacity 0.5s ease" }}
        >
          <Suspense fallback={<div className="h-full w-full bg-[#050505]" />}>
            <Canvas
              camera={{ position: [0.3, 0.7, 6.5], fov: 62 }}
              style={{ background: "#050505" }}
              gl={{ antialias: true, alpha: false }}
            >
              <LockerScene progressRef={progressRef} />
            </Canvas>
          </Suspense>
        </div>

        {/* Persistent top-left headline */}
        <div className="pointer-events-none absolute left-6 top-8 z-10 md:left-12">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/40">
            {drop?.name ?? "Drop 001"}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold uppercase text-white/90 drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] md:text-4xl tracking-widest">
            The Locker Room
          </h1>
        </div>

        {/* Scroll indicator — sits below headline */}
        <div className="pointer-events-none absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/35">
          <span className="text-[9px] uppercase tracking-[0.4em]">Scroll to explore</span>
          <div className="h-8 w-px animate-pulse bg-white/25" />
        </div>

        {/* Product info cards (opacity driven by scroll listener) */}
        <ProductOverlay infoRefs={infoRefs} />
      </div>
    </div>
  );
}
