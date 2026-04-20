"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

const SET_COLORS: Record<string, { primary: string; secondary: string; accent: string }> = {
  "scarlet-violet":   { primary: "#c0392b", secondary: "#6b1515", accent: "#ff7675" },
  "paldea-evolved":   { primary: "#d35400", secondary: "#7d2f00", accent: "#fdcb6e" },
  "obsidian-flames":  { primary: "#1a5276", secondary: "#0d2137", accent: "#5dade2" },
  default:            { primary: "#7c3aed", secondary: "#3b0764", accent: "#a78bfa" },
};

const PACK_DIMS: Record<string, [number, number, number]> = {
  PACK:   [0.68, 1.0,  0.06],
  BOX:    [1.6,  1.05, 0.9 ],
  ETB:    [1.5,  1.1,  0.55],
  BUNDLE: [1.3,  1.05, 0.65],
};

const TYPE_LABELS: Record<string, string> = {
  PACK:   "Booster Pack",
  BOX:    "Booster Box",
  ETB:    "Elite Trainer Box",
  BUNDLE: "Bundle",
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function createFaceTexture(
  setName: string,
  typeLabel: string,
  colors: { primary: string; secondary: string; accent: string },
  isFront: boolean
): THREE.CanvasTexture {
  const W = 512, H = 768;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   colors.secondary);
  bg.addColorStop(0.5, colors.primary);
  bg.addColorStop(1,   colors.secondary);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  if (!isFront) {
    // Simple side texture
    const { r, g, b } = hexToRgb(colors.accent);
    const diagonal = ctx.createLinearGradient(0, 0, W, H);
    diagonal.addColorStop(0, `rgba(${r},${g},${b},0.05)`);
    diagonal.addColorStop(0.5, `rgba(${r},${g},${b},0.12)`);
    diagonal.addColorStop(1, `rgba(${r},${g},${b},0.05)`);
    ctx.fillStyle = diagonal;
    ctx.fillRect(0, 0, W, H);
    return new THREE.CanvasTexture(canvas);
  }

  // Sheen
  const sheen = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, H * 0.55);
  sheen.addColorStop(0, "rgba(255,255,255,0.18)");
  sheen.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, W - 28, H - 28);
  ctx.lineWidth = 2;
  ctx.strokeRect(22, 22, W - 44, H - 44);

  // Center decorative ring
  const { r: ar, g: ag, b: ab } = hexToRgb(colors.accent);
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 115, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.35)`;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 75, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.25)`;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Pokémon wordmark
  ctx.save();
  ctx.font = "bold 62px 'Arial Black', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.shadowColor = colors.accent;
  ctx.shadowBlur = 28;
  ctx.fillStyle = "#ffffff";
  ctx.fillText("POKÉMON", W / 2, 135);
  ctx.restore();

  // TCG label
  ctx.font = "bold 28px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = `rgba(${ar},${ag},${ab},0.9)`;
  ctx.fillText("TRADING CARD GAME", W / 2, 175);

  // Set name
  ctx.font = "600 30px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(setName.toUpperCase(), W / 2, H - 105);

  // Product type label
  ctx.font = "bold 38px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(typeLabel.toUpperCase(), W / 2, H - 55);

  return new THREE.CanvasTexture(canvas);
}

function createHoloTexture(): THREE.CanvasTexture {
  const S = 256;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0,    "rgba(255,  0,128,0.35)");
  grad.addColorStop(0.17, "rgba(200,  0,255,0.35)");
  grad.addColorStop(0.33, "rgba(  0,128,255,0.35)");
  grad.addColorStop(0.50, "rgba(  0,255,200,0.35)");
  grad.addColorStop(0.67, "rgba(128,255,  0,0.35)");
  grad.addColorStop(0.83, "rgba(255,200,  0,0.35)");
  grad.addColorStop(1,    "rgba(255,  0,128,0.35)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  return new THREE.CanvasTexture(canvas);
}

function Pack({
  productType,
  setSlug,
  setName,
}: {
  productType: string;
  setSlug: string;
  setName: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const holoRef = useRef<THREE.Mesh>(null);

  const colors = (SET_COLORS[setSlug] ?? SET_COLORS.default)!;
  const dims = (PACK_DIMS[productType] ?? PACK_DIMS.PACK)!;
  const typeLabel = TYPE_LABELS[productType] ?? productType;

  const { frontTex, sideTex, holoTex } = useMemo(() => ({
    frontTex: createFaceTexture(setName, typeLabel, colors, true),
    sideTex:  createFaceTexture(setName, typeLabel, colors, false),
    holoTex:  createHoloTexture(),
  }), [setSlug, productType, setName]);

  const materials = useMemo(() => [
    // right, left, top, bottom, front, back
    new THREE.MeshStandardMaterial({ map: sideTex,  roughness: 0.25, metalness: 0.5 }),
    new THREE.MeshStandardMaterial({ map: sideTex,  roughness: 0.25, metalness: 0.5 }),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(colors.secondary), roughness: 0.4, metalness: 0.3 }),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(colors.secondary), roughness: 0.4, metalness: 0.3 }),
    new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.15, metalness: 0.6 }),
    new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.15, metalness: 0.6 }),
  ], [frontTex, sideTex, colors.secondary]);

  const holoMat = useMemo(() => new THREE.MeshBasicMaterial({
    map: holoTex,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [holoTex]);

  useFrame((state) => {
    if (!meshRef.current || !holoRef.current) return;
    const t = state.clock.elapsedTime;
    const mx = state.mouse.x;
    const my = state.mouse.y;

    // Float
    meshRef.current.position.y = Math.sin(t * 1.3) * 0.07;

    // Mouse tilt
    const tX = my * 0.45;
    const tY = mx * 0.55;
    meshRef.current.rotation.x += (tX - meshRef.current.rotation.x) * 0.07;
    meshRef.current.rotation.y += (tY - meshRef.current.rotation.y) * 0.07;

    holoRef.current.position.copy(meshRef.current.position);
    holoRef.current.rotation.copy(meshRef.current.rotation);

    // Holo shimmmer
    const tilt = Math.abs(meshRef.current.rotation.x) + Math.abs(meshRef.current.rotation.y);
    holoMat.opacity = Math.min(tilt * 0.9, 0.55);
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

export function PackModel({ productType, setSlug, setName, className = "", cameraZ = 2.2 }: PackModelProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, cameraZ], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 3, 2]} intensity={1.4} castShadow />
        <pointLight position={[-1.5, 1.5, 1.5]} color="#7c3aed" intensity={2} />
        <pointLight position={[1.5, -1, 2]}   color="#a78bfa"  intensity={1} />
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <Pack productType={productType} setSlug={setSlug} setName={setName} />
        </Suspense>
      </Canvas>
    </div>
  );
}
