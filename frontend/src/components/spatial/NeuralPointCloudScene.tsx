import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function PointCloud() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 18000;

  // Generate anatomical volumetric brain/neural cluster coordinates
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorA = new THREE.Color('#00F2FE'); // Coherent Cyan
    const colorB = new THREE.Color('#6366F1'); // Synaptic Indigo
    const colorC = new THREE.Color('#38BDF8'); // Blue Telemetry

    for (let i = 0; i < count; i++) {
      // Two hemisphere ellipsoid distributions
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 2.8;

      const sinPhi = Math.sin(phi);
      let x = r * sinPhi * Math.cos(theta);
      let y = r * sinPhi * Math.sin(theta) * 0.85;
      let z = r * Math.cos(phi) * 1.1;

      // Add medial sulcus cleft
      if (Math.abs(x) < 0.25) {
        x *= 1.4;
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Distance gradient color
      const mixed = colorA.clone().lerp(colorB, (y + 2.5) / 5.0).lerp(colorC, Math.abs(x) / 3.0);
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }

    return { positions: pos, colors: col };
  }, [count]);

  useFrame(({ clock, pointer }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime();
      // Organic rotation + smooth pointer parallax
      pointsRef.current.rotation.y = t * 0.08 + pointer.x * 0.35;
      pointsRef.current.rotation.x = Math.sin(t * 0.05) * 0.1 - pointer.y * 0.25;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export const NeuralPointCloudScene: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none opacity-80">
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <PointCloud />
      </Canvas>
    </div>
  );
};
