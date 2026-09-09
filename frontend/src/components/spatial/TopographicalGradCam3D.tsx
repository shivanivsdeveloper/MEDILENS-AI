import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface TopographicalGradCam3DProps {
  elevationGrid?: number[][];
  sweepPlane: number; // 0.0 to 1.0
  heightScale: number; // 0.5 to 3.0
  wireframe: boolean;
}

function ElevationMesh({
  elevationGrid,
  sweepPlane,
  heightScale,
  wireframe
}: TopographicalGradCam3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const size = elevationGrid && elevationGrid.length > 0 ? elevationGrid.length : 32;

  const { geometry, colors } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(4, 4, size - 1, size - 1);
    const pos = geo.attributes.position;
    const cols = new Float32Array(pos.count * 3);

    const coldColor = new THREE.Color('#0052D4'); // Deep Blue
    const midColor = new THREE.Color('#4364F7');  // Cyan
    const peakColor = new THREE.Color('#FF416C'); // Hot Crimson/Amber

    let idx = 0;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const val = elevationGrid && elevationGrid[i] && elevationGrid[i][j] !== undefined
          ? elevationGrid[i][j]
          : 0.1;
        
        // Z height elevation (extrusion along Z)
        pos.setZ(idx, val * heightScale * 1.2);

        // Color based on elevation value
        const c = val > 0.5
          ? midColor.clone().lerp(peakColor, (val - 0.5) * 2.0)
          : coldColor.clone().lerp(midColor, val * 2.0);

        cols[idx * 3] = c.r;
        cols[idx * 3 + 1] = c.g;
        cols[idx * 3 + 2] = c.b;

        idx++;
      }
    }

    geo.computeVertexNormals();
    return { geometry: geo, colors: cols };
  }, [elevationGrid, size, heightScale]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = -Math.PI / 3.2; // Isometric tilt
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        roughness={0.3}
        metalness={0.2}
        wireframe={wireframe}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export const TopographicalGradCam3D: React.FC<TopographicalGradCam3DProps> = (props) => {
  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden bg-slate-950 border border-coherent-blue/20">
      <Canvas
        camera={{ position: [0, -3.5, 4.2], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 7]} intensity={1.2} />
        <pointLight position={[-5, -5, 5]} color="#00F2FE" intensity={1.5} />
        <ElevationMesh {...props} />
        <OrbitControls enableZoom={true} enablePan={true} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
      <div className="absolute bottom-3 left-3 bg-matrix-black/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10 text-xs font-mono text-telemetry-cyan flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-telemetry-cyan animate-ping" />
        2.5D Topographical Saliency Matrix | Elevation = Activation Weight
      </div>
    </div>
  );
};
