import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useQuests } from '@/lib/stores/useQuests';
import { useGame } from '@/lib/stores/useGame';

function CompanionModel() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { companion, interactWithCompanion } = useQuests();
  const [hover, setHover] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Simple animated companion using basic geometry
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Gentle rotation based on mood
      if (companion.mood === 'excited') {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.2;
      } else {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1) * 0.1;
      }

      // Scale based on interaction
      const targetScale = hover ? 1.1 : clicked ? 0.9 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  useEffect(() => {
    if (clicked) {
      const timer = setTimeout(() => setClicked(false), 200);
      return () => clearTimeout(timer);
    }
  }, [clicked]);

  const getMoodColor = () => {
    switch (companion.mood) {
      case 'happy': return '#4ade80'; // green
      case 'excited': return '#fbbf24'; // yellow
      case 'working': return '#3b82f6'; // blue
      case 'sleepy': return '#a78bfa'; // purple
      case 'proud': return '#f59e0b'; // orange
      default: return '#4ade80';
    }
  };

  const handleClick = () => {
    setClicked(true);
    interactWithCompanion();
  };

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        position={[0, 0, 0]}
      >
        {/* Main body - rounded cube */}
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial 
          color={getMoodColor()} 
          roughness={0.3}
          metalness={0.1}
        />
        
        {/* Eyes */}
        <mesh position={[-0.15, 0.2, 0.41]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.15, 0.2, 0.41]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>

        {/* Eye highlights */}
        <mesh position={[-0.15, 0.22, 0.45]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.15, 0.22, 0.45]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Nose */}
        <mesh position={[0, 0.05, 0.42]}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial color="#333333" />
        </mesh>

        {/* Antennae for cute factor */}
        <mesh position={[-0.2, 0.6, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0.2, 0.6, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3]} />
          <meshStandardMaterial color="#333333" />
        </mesh>

        {/* Antennae tips */}
        <mesh position={[-0.2, 0.75, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={getMoodColor()} emissive={getMoodColor()} emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0.2, 0.75, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={getMoodColor()} emissive={getMoodColor()} emissiveIntensity={0.3} />
        </mesh>
      </mesh>
    </Float>
  );
}

function CompanionText() {
  const { companion } = useQuests();
  
  const getMoodMessage = () => {
    switch (companion.mood) {
      case 'happy': return 'Great work! 😊';
      case 'excited': return 'Amazing! 🎉';
      case 'working': return 'Keep going! 💪';
      case 'sleepy': return 'Take a break? 😴';
      case 'proud': return 'Fantastic! 🌟';
      default: return 'Hello! 👋';
    }
  };

  return (
    <Text
      position={[0, -1.5, 0]}
      fontSize={0.2}
      color="#333333"
      anchorX="center"
      anchorY="middle"
      maxWidth={3}
      textAlign="center"
    >
      {getMoodMessage()}
    </Text>
  );
}

export function CompanionCharacter() {
  const { companion } = useQuests();

  return (
    <div className="w-full h-40 bg-gradient-to-b from-blue-50 to-white rounded-lg border border-blue-100">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[2, 2, 1]} 
          intensity={0.8}
          castShadow
        />
        <pointLight position={[0, 2, 2]} intensity={0.4} />

        {/* Companion */}
        <group>
          <CompanionModel />
          <CompanionText />
        </group>
      </Canvas>
      
      {/* Energy indicator */}
      <div className="px-4 pb-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Energy</span>
          <span>{companion.energy}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
          <div 
            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${companion.energy}%` }}
          />
        </div>
      </div>
    </div>
  );
}
