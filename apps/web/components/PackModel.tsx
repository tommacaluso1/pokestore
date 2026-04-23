"use client";

import React, { useRef, useMemo, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";

// ─── Per-set accent palette ───────────────────────────────────────────────────

const SET_ACCENT: Record<string, { bg: string; light: string; emissive: string }> = {
  "scarlet-violet":    { bg: "#1a080f", light: "#e03030", emissive: "#6b1515" },
  "paldea-evolved":    { bg: "#12100a", light: "#d35400", emissive: "#6a2a00" },
  "obsidian-flames":   { bg: "#060d14", light: "#2980b9", emissive: "#0e3d5e" },
  "151":               { bg: "#0a0f18", light: "#fbbf24", emissive: "#7a5a00" },
  "paradox-rift":      { bg: "#080a18", light: "#818cf8", emissive: "#3730a3" },
  "paldean-fates":     { bg: "#120810", light: "#ec4899", emissive: "#831843" },
  "temporal-forces":   { bg: "#08101a", light: "#38bdf8", emissive: "#0c4a6e" },
  "twilight-masquerade": { bg: "#100818", light: "#a855f7", emissive: "#581c87" },
  "shrouded-fable":    { bg: "#0c0814", light: "#c084fc", emissive: "#4c1d95" },
  "stellar-crown":     { bg: "#0a0c18", light: "#93c5fd", emissive: "#1e3a8a" },
  "surging-sparks":    { bg: "#0a1208", light: "#86efac", emissive: "#14532d" },
  default:             { bg: "#0d0820", light: "#7c3aed", emissive: "#3b1584" },
};

// [width, height, depth] Three.js units
const PACK_DIMS: Record<string, [number, number, number]> = {
  PACK:   [0.68, 1.0,  0.055],
  BOX:    [1.55, 1.05, 0.90],
  ETB:    [1.45, 1.10, 0.52],
  BUNDLE: [1.25, 1.05, 0.62],
};

// Natural aspect ratio of the front face image
const IMAGE_AR: Record<string, number> = {
  PACK:   242 / 437,
  BOX:    330 / 437,
  ETB:    437 / 417,
  BUNDLE: 330 / 437,
};

const BASE_ROT_Y = 0.26;    // resting 3/4 angle
const DRAG_CLAMP = 0.35;    // ±20°

// ─── UV helpers ───────────────────────────────────────────────────────────────

function coverUV(faceW: number, faceH: number, imgAR: number) {
  const faceAR = faceW / faceH;
  if (faceAR >= imgAR) {
    const ry = imgAR / faceAR;
    return { rx: 1, ry, ox: 0, oy: (1 - ry) / 2 };
  }
  const rx = faceAR / imgAR;
  return { rx, ry: 1, ox: (1 - rx) / 2, oy: 0 };
}

function applyFaceUV(tex: THREE.Texture, faceW: number, faceH: number, imgAR: number) {
  const { rx, ry, ox, oy } = coverUV(faceW, faceH, imgAR);
  tex.repeat.set(rx, ry);
  tex.offset.set(ox, oy);
  tex.needsUpdate = true;
}

function computeCameraZ(dims: [number, number, number], fill = 0.72, fovDeg = 42): number {
  const [w, h, d] = dims;
  const r = Math.sqrt(w * w + h * h + d * d) / 2;
  return r / (fill * Math.tan((fovDeg / 2) * (Math.PI / 180)));
}

// ─── Canvas textures (client-only, called inside dynamic import) ──────────────

function createFallbackDataUrl(accentHex: string, bgHex: string): string {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const ctx = c.getContext("2d")!;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, bgHex);
  bg.addColorStop(1, "#040208");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);

  // Radial glow
  const glow = ctx.createRadialGradient(S * 0.5, S * 0.42, 0, S * 0.5, S * 0.42, S * 0.46);
  glow.addColorStop(0, accentHex + "55");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, S, S);

  // Pokéball outline
  const cx = S * 0.5, cy = S * 0.48, r = S * 0.26;
  ctx.strokeStyle = accentHex + "70";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = accentHex + "45";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
  ctx.strokeStyle = accentHex + "80";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.13, 0, Math.PI * 2); ctx.stroke();

  // Dot grid
  ctx.fillStyle = "rgba(255,255,255,0.025)";
  for (let x = 14; x < S; x += 28) {
    for (let y = 14; y < S; y += 28) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    }
  }

  return c.toDataURL();
}

function createSideCanvasTexture(bgHex: string): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, S, S);
  const v = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.8);
  v.addColorStop(0, "rgba(255,255,255,0.09)");
  v.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
}

function createHoloCanvasTexture(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0,    "rgba(255,  0,128,0.45)");
  g.addColorStop(0.17, "rgba(200,  0,255,0.45)");
  g.addColorStop(0.33, "rgba(  0,128,255,0.45)");
  g.addColorStop(0.50, "rgba(  0,255,200,0.45)");
  g.addColorStop(0.67, "rgba(128,255,  0,0.45)");
  g.addColorStop(0.83, "rgba(255,200,  0,0.45)");
  g.addColorStop(1,    "rgba(255,  0,128,0.45)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
}

// ─── IBL environment ──────────────────────────────────────────────────────────

function SceneEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const env = pmrem.fromScene(new RoomEnvironment()).texture;
    scene.environment = env;
    pmrem.dispose();
    return () => { env.dispose(); scene.environment = null; };
  }, [gl, scene]);
  return null;
}

// ─── Interaction refs type ────────────────────────────────────────────────────

type InteractionRefs = {
  mouseRef:   React.MutableRefObject<{ x: number; y: number }>;
  isDragging: React.MutableRefObject<boolean>;
  dragRot:    React.MutableRefObject<{ x: number; y: number }>;
  isHovered:  React.MutableRefObject<boolean>;
};

// ─── Inner 3D mesh ────────────────────────────────────────────────────────────

function Pack({
  productType, setSlug, textureUrl,
  mouseRef, isDragging, dragRot, isHovered,
}: { productType: string; setSlug: string; textureUrl: string } & InteractionRefs) {
  const meshRef = useRef<THREE.Mesh>(null);
  const holoRef = useRef<THREE.Mesh>(null);

  const accent = SET_ACCENT[setSlug] ?? SET_ACCENT["default"]!;
  const dims   = PACK_DIMS[productType] ?? PACK_DIMS["PACK"]!;
  const imgAR  = IMAGE_AR[productType] ?? IMAGE_AR["PACK"]!;
  const [w, h, d] = dims;

  const productTex = useLoader(THREE.TextureLoader, textureUrl);
  const holoTex    = useMemo(() => createHoloCanvasTexture(), []);

  const [frontMat, backMat, sideMat] = useMemo(() => {
    productTex.colorSpace = THREE.SRGBColorSpace;

    const frontTex = productTex.clone();
    frontTex.colorSpace = THREE.SRGBColorSpace;
    applyFaceUV(frontTex, w, h, imgAR);

    const backTex = productTex.clone();
    backTex.colorSpace = THREE.SRGBColorSpace;
    applyFaceUV(backTex, w, h, imgAR);

    const sideTex = createSideCanvasTexture(accent.bg);
    const emissive = new THREE.Color(accent.emissive);

    return [
      new THREE.MeshStandardMaterial({
        map: frontTex, roughness: 0.10, metalness: 0.60,
        emissive, emissiveIntensity: 0.18, envMapIntensity: 1.5,
      }),
      new THREE.MeshStandardMaterial({
        map: backTex, roughness: 0.22, metalness: 0.42,
        emissive, emissiveIntensity: 0.07, envMapIntensity: 1.0,
      }),
      new THREE.MeshStandardMaterial({
        map: sideTex, roughness: 0.26, metalness: 0.48,
        emissive, emissiveIntensity: 0.06, envMapIntensity: 0.9,
      }),
    ];
  }, [productTex, accent, w, h, imgAR]);

  // BoxGeometry face order: +x, -x, +y, -y, +z(front), -z(back)
  const materials = useMemo(
    () => [sideMat, sideMat, sideMat, sideMat, frontMat, backMat],
    [frontMat, backMat, sideMat]
  );

  const holoMat = useMemo(() => new THREE.MeshBasicMaterial({
    map: holoTex, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }), [holoTex]);

  useFrame((state) => {
    if (!meshRef.current || !holoRef.current) return;
    const t = state.clock.elapsedTime;

    // Hover tilt disabled while dragging
    const hoverX = isDragging.current ? 0 : mouseRef.current.y * 0.30;
    const hoverY = isDragging.current ? 0 : mouseRef.current.x * 0.40;

    const targetX = dragRot.current.x + hoverX;
    const targetY = BASE_ROT_Y + dragRot.current.y + hoverY;

    meshRef.current.position.y = Math.sin(t * 1.2) * 0.065;
    meshRef.current.rotation.x += (targetX - meshRef.current.rotation.x) * 0.09;
    meshRef.current.rotation.y += (targetY - meshRef.current.rotation.y) * 0.09;

    const targetScale = isHovered.current && !isDragging.current ? 1.055 : 1.0;
    const cs = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(cs + (targetScale - cs) * 0.10);

    holoRef.current.position.copy(meshRef.current.position);
    holoRef.current.rotation.copy(meshRef.current.rotation);
    holoRef.current.scale.copy(meshRef.current.scale);

    const tilt = Math.abs(meshRef.current.rotation.x) + Math.abs(meshRef.current.rotation.y - BASE_ROT_Y);
    holoMat.opacity = Math.min(tilt * 0.9, 0.55);
    holoTex.offset.set(Math.sin(t * 0.55) * 0.3, Math.cos(t * 0.42) * 0.3);
    holoTex.needsUpdate = true;
  });

  return (
    <group>
      <mesh ref={meshRef} material={materials}>
        <boxGeometry args={dims} />
      </mesh>
      <mesh ref={holoRef} material={holoMat}>
        <boxGeometry args={[w + 0.003, h + 0.003, d + 0.003]} />
      </mesh>
    </group>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export interface PackModelProps {
  productType: string;
  setSlug: string;
  setName: string;
  imageUrl?: string | null;
  logoUrl?: string | null;
  className?: string;
  cameraZ?: number;
  lowQuality?: boolean;
}

export function PackModel({
  productType, setSlug, imageUrl, logoUrl,
  className = "", cameraZ, lowQuality = false,
}: PackModelProps) {
  const accent          = SET_ACCENT[setSlug] ?? SET_ACCENT["default"]!;
  const dims            = PACK_DIMS[productType] ?? PACK_DIMS["PACK"]!;
  const resolvedCameraZ = cameraZ ?? computeCameraZ(dims);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef     = useRef({ x: 0, y: 0 });
  const isDragging   = useRef(false);
  const dragRot      = useRef({ x: 0, y: 0 });
  const lastPointer  = useRef({ x: 0, y: 0 });
  const isHovered    = useRef(false);
  const tweenRef     = useRef<gsap.core.Tween | null>(null);

  // Texture URL: product image → set logo → canvas data URL fallback
  const textureUrl = useMemo<string>(() => {
    if (imageUrl) return imageUrl;
    if (logoUrl) return logoUrl;
    return createFallbackDataUrl(accent.light, accent.bg);
  }, [imageUrl, logoUrl, accent.light, accent.bg]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    tweenRef.current?.kill();
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.cursor = "grabbing";
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging.current) {
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      const clamp = (v: number) => Math.max(-DRAG_CLAMP, Math.min(DRAG_CLAMP, v));
      dragRot.current.y = clamp(dragRot.current.y + dx * 0.008);
      dragRot.current.x = clamp(dragRot.current.x - dy * 0.008);
    } else {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouseRef.current = {
        x:  ((e.clientX - rect.left) / rect.width)  * 2 - 1,
        y: -((e.clientY - rect.top)  / rect.height) * 2 + 1,
      };
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    e.currentTarget.style.cursor = "grab";
    // GSAP elastic spring return to identity rotation
    tweenRef.current = gsap.to(dragRot.current, {
      x: 0,
      y: 0,
      duration: 1.1,
      ease: "elastic.out(1, 0.45)",
    });
  }, []);

  const handlePointerEnter = useCallback(() => { isHovered.current = true; }, []);

  const handlePointerLeave = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isHovered.current = false;
    mouseRef.current = { x: 0, y: 0 };
    e.currentTarget.style.cursor = "grab";
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ cursor: "grab" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <Canvas
        camera={{ position: [0, 0, resolvedCameraZ], fov: 42 }}
        gl={{
          antialias: !lowQuality,
          alpha: true,
          powerPreference: lowQuality ? "low-power" : "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <SceneEnvironment />
        <ambientLight intensity={0.28} />
        <directionalLight position={[3, 5, 4]} intensity={1.0} />
        {/* Primary purple rim */}
        <pointLight position={[-2, 2.5, 2.5]} color="#a78bfa" intensity={2.8} />
        {/* Set accent fill from below-front */}
        <pointLight position={[1.5, -1.5, 2.5]} color={accent.light} intensity={1.8} />
        {/* Subtle back rim for depth */}
        <pointLight position={[0, 0.5, -2.5]} color={accent.emissive} intensity={0.8} />
        <Suspense fallback={null}>
          <Pack
            productType={productType}
            setSlug={setSlug}
            textureUrl={textureUrl}
            mouseRef={mouseRef}
            isDragging={isDragging}
            dragRot={dragRot}
            isHovered={isHovered}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
