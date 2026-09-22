"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Text } from "@react-three/drei";
import * as THREE from "three";

const STAGES = [
  { name: "JERSEY MAKING", color: "#FF4D1E" },
  { name: "JERSEY FULL VIEW", color: "#FFB84D" },
  { name: "SMALL DETAILS", color: "#4DB8FF" },
  { name: "PACKAGING UNBOXING", color: "#B84DFF" },
];

interface Stage3DProps {
  stageIndex: number;
  progress: number;
}

function Stage3D({ stageIndex, progress }: Stage3DProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;
    }
  });

  const renderShape = (index: number) => {
    switch (index) {
      case 0:
        return (
          <mesh key="box" ref={meshRef}>
            <boxGeometry args={[2, 2, 2]} />
            <meshPhongMaterial color={STAGES[0].color} />
          </mesh>
        );
      case 1:
        return (
          <mesh key="sphere" ref={meshRef}>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshPhongMaterial color={STAGES[1].color} />
          </mesh>
        );
      case 2:
        return (
          <mesh key="torus" ref={meshRef}>
            <torusGeometry args={[1.5, 0.6, 16, 32]} />
            <meshPhongMaterial color={STAGES[2].color} />
          </mesh>
        );
      case 3:
        return (
          <mesh key="cone" ref={meshRef}>
            <coneGeometry args={[1.5, 3, 32]} />
            <meshPhongMaterial color={STAGES[3].color} />
          </mesh>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />

      {/* Render active stage shape */}
      {renderShape(stageIndex)}

      {/* Stage label */}
      <group position={[0, -2.5, 0]}>
        <Text
          fontSize={0.5}
          color={STAGES[stageIndex].color}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          {STAGES[stageIndex].name}
        </Text>
      </group>
    </>
  );
}

interface ProcessCanvasProps {
  scrollProgress: number;
}

export default function ProcessCanvas({ scrollProgress }: ProcessCanvasProps) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const newIndex = Math.min(
      Math.floor(scrollProgress * STAGES.length),
      STAGES.length - 1
    );
    setStageIndex(newIndex);
  }, [scrollProgress]);

  return (
    <Canvas className="w-full h-screen" style={{ background: "#000000" }}>
      <Stage3D stageIndex={stageIndex} progress={scrollProgress} />
    </Canvas>
  );
}
