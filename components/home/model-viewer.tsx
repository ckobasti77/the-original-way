"use client";

import React, { useRef, Suspense, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Set the decoder path to local public/draco/
useGLTF.setDecoderPath("/draco/");

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

interface ModelProps {
  url: string;
  rotationSpeed?: number;
  scale?: number;
}

function Model({ url, rotationSpeed = 0.005, scale = 1 }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(url);

  // Clone and calculate bounds once, returning properties to be applied declaratively as props
  const { sceneObject, position, scaleProp } = React.useMemo(() => {
    if (!gltf || !gltf.scene) {
      return { sceneObject: null, position: [0, 0, 0] as [number, number, number], scaleProp: 1 };
    }
    const scene = gltf.scene.clone();

    // Ensure world matrices are fully updated before calculating the bounding box
    scene.updateMatrixWorld(true);

    // Calculate bounding box using only Mesh objects to ignore helper cameras/lights
    const box = new THREE.Box3();
    let hasMesh = false;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        box.expandByObject(child);
        hasMesh = true;
      }
    });
    
    if (!hasMesh) {
      box.setFromObject(scene);
    }

    const center = new THREE.Vector3();
    box.getCenter(center);

    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Normalize model size so that its largest dimension is exactly 1.4 units, then apply the custom scale
    const normalizationScale = maxDim > 0 ? (1.4 / maxDim) * scale : scale;

    const pos: [number, number, number] = [
      -center.x * normalizationScale,
      -center.y * normalizationScale,
      -center.z * normalizationScale
    ];

    return {
      sceneObject: scene,
      position: pos,
      scaleProp: normalizationScale
    };
  }, [gltf, scale]);

  // Auto-rotate the model slowly around the Y axis
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Clamped delta to avoid huge jumps on tab switch/lag
      const safeDelta = Math.min(delta, 0.1);
      groupRef.current.rotation.y += rotationSpeed * (safeDelta * 60);
    }
  });

  if (!sceneObject) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <group position={position} scale={scaleProp}>
        <primitive object={sceneObject} />
      </group>
    </group>
  );
}

interface ModelViewerProps {
  url: string;
  rotationSpeed?: number;
  scale?: number;
  className?: string;
  cameraPosition?: [number, number, number];
}

export function ModelViewer({
  url,
  rotationSpeed = 0.005,
  scale = 1,
  className = "",
  cameraPosition = [0, 0, 3],
}: ModelViewerProps) {
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isMounted) {
    // Return empty placeholder with same dimensions to avoid layout shifts
    return <div className={`bg-transparent ${className}`} />;
  }

  return (
    <div className={`relative ${className}`}>
      <Canvas
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        camera={{ position: cameraPosition, fov: 45 }}
        style={{ background: "transparent" }}
      >
        {/* Studio Lighting Setup */}
        <ambientLight intensity={0.8} />
        
        {/* Main light from top-front-right */}
        <directionalLight position={[5, 10, 5]} intensity={1.6} />
        
        {/* Fill light from left side */}
        <pointLight position={[-5, 5, -3]} intensity={1.0} />
        
        {/* Rim light from behind for premium glowing edges */}
        <pointLight position={[0, -5, 5]} intensity={0.6} />
        
        <Suspense fallback={null}>
          <Model url={url} rotationSpeed={rotationSpeed} scale={scale} />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Preload models to initiate downloads immediately when the script runs on the client
useGLTF.preload("/assets/3d-models/air-max-dn.glb");
useGLTF.preload("/assets/3d-models/tech-fleece.glb");
