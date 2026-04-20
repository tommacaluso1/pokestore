"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

// Maps set slug + product type → public image path
const PRODUCT_IMAGE: Record<string, Record<string, string>> = {
  "scarlet-violet": {
    PACK:   "/products/sv-pack.jpg",
    BOX:    "/products/sv-box.jpg",
    ETB:    "/products/sv-etb.jpg",
    BUNDLE: "/products/sv-box.jpg",
  },
  "paldea-evolved": {
    PACK:   "/products/pe-pack.jpg",
    BOX:    "/products/pe-box.jpg",
    ETB:    "/products/pe-etb.jpg",
    BUNDLE: "/products/pe-box.jpg",
  },
  "obsidian-flames": {
    PACK:   "/products/of-pack.jpg",
    BOX:    "/products/of-box.jpg",
    ETB:    "/products/of-etb.jpg",
    BUNDLE: "/products/of-box.jpg",
  },
};

const FALLBACK_IMAGE = "/products/sv-pack.jpg";

// Accent colors per set for side faces and lighting
const SET_ACCENT: Record<string, { side: string; light: string }> = {
  "scarlet-violet":  { side: "#1a0a1f", light: "#c0392b" },
  "paldea-evolved":  { side: "#12100a", light: "#d35400" },
  "obsidian-flames": { side: "#060d14", light: "#2980b9" },
  default:           { side: "#0d0820", light: "#7c3aed" },
};

// 3D box dimensions [w, h, d] per product type
const PACK_DIMS: Record<string, [number, number, number]> = {
  PACK:   [0.68, 1.0,  0.055],
  BOX:    [1.55, 1.05, 0.90 ],
  ETB:    [1.45, 1.10, 0.52 ],
  BUNDLE: [1.25, 1.05, 0.62 ],
};

function createHoloTexture(): THREE.CanvasTexture {
  const S = 256;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0,    "rgba(255,  0,128,0.4)");
  g.addColorStop(0.17, "rgba(200,  0,255,0.4)");
  g.addColorStop(0.33, "rgba(  0,128,255,0.4)");
  g.addColorStop(0.50, "rgba(  0,255,200,0.4)");
  g.addColorStop(0.67, "rgba(128,255,  0,0.4)");
  g.addColorStop(0.83, "rgba(255,200,  0,0.4)");
  g.addColorStop(1,    "rgba(255,  0,128,0.4)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(canvas);
}

function Pack({
  productType,
  setSlug,
}: {
  productType: string;
  setSlug: string;
}) {
  const meshRef  = useRef<THREE.Mesh>(null);
  const holoRef  = useRef<THREE.Mesh>(null);

  const imgPath = PRODUCT_IMAGE[setSlug]?.[productType] ?? FALLBACK_IMAGE;
  const accent  = (SET_ACCENT[setSlug]  ?? SET_ACCENT.default)!;
  const dims    = (PACK_DIMS[productType] ?? PACK_DIMS.PACK)!;

  const productTex = useLoader(THREE.TextureLoader, imgPath);

  const holoTex = useMemo(() => createHoloTexture(), []);

  const materials = useMemo(() => {
    productTex.colorSpace = THREE.SRGBColorSpace;
    const sideColor = new THREE.Color(accent.side);
    const front = new THREE.MeshStandardMaterial({
      map: productTex,
      roughness: 0.18,
      metalness: 0.55,
    });
    const back = new THREE.MeshStandardMaterial({
      map: productTex,
      roughness: 0.25,
      metalness: 0.4,
    });
    const side = new THREE.MeshStandardMaterial({
      color: sideColor,
      roughness: 0.3,
      metalness: 0.45,
    });
    // right, left, top, bottom, front(+z), back(-z)
    return [side, side, side, side, front, back];
  }, [productTex, accent.side]);

  const holoMat = useMemo(() => new THREE.MeshBasicMaterial({
    map: holoTex,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [holoTex]);

  useFrame((state) => {
    if (!meshRef.current || !holoRef.current) return;
    const t  = state.clock.elapsedTime;
    const mx = state.mouse.x;
    const my = state.mouse.y;

    // Float
    meshRef.current.position.y = Math.sin(t * 1.25) * 0.065;

    // Mouse parallax tilt
    meshRef.current.rotation.x += (my * 0.45  - meshRef.current.rotation.x) * 0.07;
    meshRef.current.rotation.y += (mx * 0.55  - meshRef.current.rotation.y) * 0.07;

    holoRef.current.position.copy(meshRef.current.position);
    holoRef.current.rotation.copy(meshRef.current.rotation);

    // Holographic shimmer scales with tilt amount
    const tilt = Math.abs(meshRef.current.rotation.x) + Math.abs(meshRef.current.rotation.y);
    holoMat.opacity = Math.min(tilt * 0.85, 0.5);
    holoTex.offset.set(Math.sin(t * 0.5) * 0.3, Math.cos(t * 0.4) * 0.3);
    holoTex.needsUpdate = true;
  });

  return (
    <group>
      <mesh ref={meshRef} material={materials} castShadow>
        <boxGeometry args={dims} />
      </mesh>
      <mesh ref={holoRef} material={holoMat}>
        <boxGeometry args={[dims[0] + 0.002, dims[1] + 0.002, dims[2] + 0.002]} />
      </mesh>
    </group>
  );
}

export interface PackModelProps {
  productType: string;
  setSlug: string;
  setName: string;
  className?: string;
  cameraZ?: number;
}

export function PackModel({ productType, setSlug, className = "", cameraZ = 2.2 }: PackModelProps) {
  const accent = (SET_ACCENT[setSlug] ?? SET_ACCENT.default)!;

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[2, 3, 2]}  intensity={1.3} castShadow />
        <pointLight position={[-1.5, 1.5, 1.5]} color="#7c3aed"    intensity={1.8} />
        <pointLight position={[1.5, -1, 2]}     color={accent.light} intensity={1.4} />
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <Pack productType={productType} setSlug={setSlug} />
        </Suspense>
      </Canvas>
    </div>
  );
}
