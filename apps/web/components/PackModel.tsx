"use client";

import React, { useRef, useMemo, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";

// ─── Product image map — local files in /public/products/ ────────────────────
// Keys are set slugs. Three sets have bespoke product photos.
// Other sets fall back to closest match by product type.

const PRODUCT_IMAGE: Record<string, Partial<Record<string, string>>> = {
  "scarlet-violet":  { PACK: "/products/sv-pack.jpg",  BOX: "/products/sv-box.jpg",  ETB: "/products/sv-etb.jpg"  },
  "paldea-evolved":  { PACK: "/products/pe-pack.jpg",  BOX: "/products/pe-box.jpg",  ETB: "/products/pe-etb.jpg"  },
  "obsidian-flames": { PACK: "/products/of-pack.jpg",  BOX: "/products/of-box.jpg",  ETB: "/products/of-etb.jpg"  },
};

// Generic fallbacks by product type when no set-specific image exists
const TYPE_FALLBACK: Record<string, string> = {
  PACK:   "/products/sv-pack.jpg",
  BOX:    "/products/sv-box.jpg",
  ETB:    "/products/sv-etb.jpg",
  BUNDLE: "/products/sv-box.jpg",
};

function resolveProductImage(setSlug: string, productType: string): string {
  return PRODUCT_IMAGE[setSlug]?.[productType]
    ?? TYPE_FALLBACK[productType]
    ?? "/products/sv-pack.jpg";
}

// ─── Per-set accent colours ───────────────────────────────────────────────────

const SET_ACCENT: Record<string, { light: string; emissive: string }> = {
  "scarlet-violet":      { light: "#e03030", emissive: "#5a1010" },
  "paldea-evolved":      { light: "#d35400", emissive: "#5a2200" },
  "obsidian-flames":     { light: "#2980b9", emissive: "#0c2f50" },
  "151":                 { light: "#fbbf24", emissive: "#5a3e00" },
  "paradox-rift":        { light: "#818cf8", emissive: "#2e2d8a" },
  "paldean-fates":       { light: "#ec4899", emissive: "#6b103a" },
  "temporal-forces":     { light: "#38bdf8", emissive: "#083a54" },
  "twilight-masquerade": { light: "#a855f7", emissive: "#42076b" },
  "shrouded-fable":      { light: "#c084fc", emissive: "#380a5e" },
  "stellar-crown":       { light: "#93c5fd", emissive: "#132a5c" },
  "surging-sparks":      { light: "#86efac", emissive: "#0e3d1e" },
  default:               { light: "#7c3aed", emissive: "#2e0e6a" },
};

// ─── Product geometry dimensions [w, h, d] in Three.js units ─────────────────
// PACK depth 0.11 — thick enough to read as a sealed foil pack, not a card.

const PACK_DIMS: Record<string, [number, number, number]> = {
  PACK:   [0.68, 1.0,  0.11],
  BOX:    [1.55, 1.05, 0.90],
  ETB:    [1.45, 1.10, 0.52],
  BUNDLE: [1.25, 1.05, 0.62],
};

// Front-face image natural aspect ratio (w/h) — used for cover-fit UV
const IMAGE_AR: Record<string, number> = {
  PACK:   242 / 437,
  BOX:    330 / 437,
  ETB:    437 / 417,
  BUNDLE: 330 / 437,
};

const BASE_ROT_Y = 0.26;   // resting 3/4 angle shows front + right side
const DRAG_CLAMP = 0.35;   // ±20° rotation clamp

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

function computeCameraZ(dims: [number, number, number], fill = 0.70, fovDeg = 42): number {
  const [w, h, d] = dims;
  const r = Math.sqrt(w * w + h * h + d * d) / 2;
  return r / (fill * Math.tan((fovDeg / 2) * (Math.PI / 180)));
}

// ─── Canvas textures ──────────────────────────────────────────────────────────

// Side/back face — dark gradient with subtle vignette, no product image
function createSideTexture(accentHex: string): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const ctx = c.getContext("2d")!;

  // Base dark fill
  ctx.fillStyle = "#0a0614";
  ctx.fillRect(0, 0, S, S);

  // Soft radial vignette highlight
  const hl = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.75);
  hl.addColorStop(0, "rgba(255,255,255,0.07)");
  hl.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = hl;
  ctx.fillRect(0, 0, S, S);

  // Faint accent tint at edge
  const tint = ctx.createLinearGradient(0, S, S, 0);
  tint.addColorStop(0, accentHex + "18");
  tint.addColorStop(1, "transparent");
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, S, S);

  return new THREE.CanvasTexture(c);
}

// Back face — generic Pokémon-card-back style (dark + Pokéball motif)
function createBackTexture(): THREE.CanvasTexture {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const ctx = c.getContext("2d")!;

  // Background
  const bg = ctx.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, "#100020");
  bg.addColorStop(1, "#06000e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);

  // Glow
  const glow = ctx.createRadialGradient(S * 0.5, S * 0.5, 0, S * 0.5, S * 0.5, S * 0.45);
  glow.addColorStop(0, "rgba(124,58,237,0.22)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, S, S);

  // Pokéball
  const cx = S * 0.5, cy = S * 0.5, r = S * 0.24;
  ctx.strokeStyle = "rgba(167,139,250,0.5)";
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "rgba(167,139,250,0.3)";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
  ctx.strokeStyle = "rgba(167,139,250,0.6)";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.14, 0, Math.PI * 2); ctx.stroke();

  return new THREE.CanvasTexture(c);
}

// Holographic shimmer — additive blending layer, opacity driven by tilt angle
function createHoloTexture(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const ctx = c.getContext("2d")!;

  // Diagonal rainbow bands — narrower for a more realistic foil look
  const g = ctx.createLinearGradient(0, S, S, 0);
  g.addColorStop(0,    "rgba(255,  0,120,0.55)");
  g.addColorStop(0.15, "rgba(200,  0,255,0.50)");
  g.addColorStop(0.30, "rgba(  0,120,255,0.50)");
  g.addColorStop(0.45, "rgba(  0,240,200,0.50)");
  g.addColorStop(0.60, "rgba( 80,255, 80,0.50)");
  g.addColorStop(0.75, "rgba(255,220,  0,0.50)");
  g.addColorStop(0.90, "rgba(255, 80,  0,0.50)");
  g.addColorStop(1,    "rgba(255,  0,120,0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  return new THREE.CanvasTexture(c);
}

// Subtle foil grain normal map — gives front face micro-texture, not flat
function createFoilNormalMap(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const ctx = c.getContext("2d")!;

  // Flat normal base (128,128,255 = pointing straight out)
  ctx.fillStyle = "#8080ff";
  ctx.fillRect(0, 0, S, S);

  // Very subtle horizontal scan lines — mimics the lenticular foil texture
  for (let y = 0; y < S; y += 4) {
    ctx.fillStyle = "rgba(120,120,255,0.35)";
    ctx.fillRect(0, y, S, 1);
  }

  // Noise-like specks
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const v = Math.floor(Math.random() * 20 + 118);
    ctx.fillStyle = `rgba(${v},${v},255,0.18)`;
    ctx.fillRect(x, y, 1, 1);
  }

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

// ─── Interaction refs ─────────────────────────────────────────────────────────

type InteractionRefs = {
  mouseRef:   React.MutableRefObject<{ x: number; y: number }>;
  isDragging: React.MutableRefObject<boolean>;
  dragRot:    React.MutableRefObject<{ x: number; y: number }>;
  isHovered:  React.MutableRefObject<boolean>;
};

// ─── Inner mesh component ─────────────────────────────────────────────────────

function ProductMesh({
  productType, setSlug, imgPath,
  mouseRef, isDragging, dragRot, isHovered,
}: { productType: string; setSlug: string; imgPath: string } & InteractionRefs) {
  const meshRef = useRef<THREE.Mesh>(null);
  const holoRef = useRef<THREE.Mesh>(null);

  const accent = SET_ACCENT[setSlug] ?? SET_ACCENT["default"]!;
  const dims   = PACK_DIMS[productType] ?? PACK_DIMS["PACK"]!;
  const imgAR  = IMAGE_AR[productType] ?? IMAGE_AR["PACK"]!;
  const [w, h, d] = dims;

  const productTex = useLoader(THREE.TextureLoader, imgPath);

  const holoTex    = useMemo(() => createHoloTexture(), []);
  const backTex    = useMemo(() => createBackTexture(), []);
  const normalTex  = useMemo(() => createFoilNormalMap(), []);
  const sideTex    = useMemo(() => createSideTexture(accent.light), [accent.light]);

  const [frontMat, backMat, sideMat] = useMemo(() => {
    productTex.colorSpace = THREE.SRGBColorSpace;

    // Front — cover-fit the product photo, foil laminate material
    const frontTex = productTex.clone();
    frontTex.colorSpace = THREE.SRGBColorSpace;
    applyFaceUV(frontTex, w, h, imgAR);

    // Normal map — same UV scaling as front
    const nm = normalTex.clone();
    applyFaceUV(nm, w, h, imgAR);

    const emissive = new THREE.Color(accent.emissive);

    return [
      // Front face: printed foil laminate
      new THREE.MeshStandardMaterial({
        map: frontTex,
        normalMap: nm,
        normalScale: new THREE.Vector2(0.3, 0.3),
        roughness: 0.38,
        metalness: 0.12,
        emissive,
        emissiveIntensity: 0.12,
        envMapIntensity: 1.8,
      }),
      // Back face: generic card back
      new THREE.MeshStandardMaterial({
        map: backTex,
        roughness: 0.42,
        metalness: 0.08,
        emissive,
        emissiveIntensity: 0.06,
        envMapIntensity: 1.2,
      }),
      // Side/top/bottom: dark with subtle vignette
      new THREE.MeshStandardMaterial({
        map: sideTex,
        roughness: 0.45,
        metalness: 0.10,
        emissive,
        emissiveIntensity: 0.05,
        envMapIntensity: 0.85,
      }),
    ];
  }, [productTex, normalTex, backTex, sideTex, accent, w, h, imgAR]);

  // BoxGeometry face order: +x(right), -x(left), +y(top), -y(bottom), +z(front), -z(back)
  const materials = useMemo(
    () => [sideMat, sideMat, sideMat, sideMat, frontMat, backMat],
    [frontMat, backMat, sideMat],
  );

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

    // Hover tilt — disabled while dragging so the two systems don't fight
    const hoverX = isDragging.current ? 0 : mouseRef.current.y * 0.28;
    const hoverY = isDragging.current ? 0 : mouseRef.current.x * 0.38;

    const targetX = dragRot.current.x + hoverX;
    const targetY = BASE_ROT_Y + dragRot.current.y + hoverY;

    // Float
    meshRef.current.position.y = Math.sin(t * 1.18) * 0.062;

    // Smooth rotation lerp
    meshRef.current.rotation.x += (targetX - meshRef.current.rotation.x) * 0.09;
    meshRef.current.rotation.y += (targetY - meshRef.current.rotation.y) * 0.09;

    // Scale — only on hover, not drag
    const targetScale = isHovered.current && !isDragging.current ? 1.05 : 1.0;
    const cs = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(cs + (targetScale - cs) * 0.10);

    // Holo layer tracks the mesh exactly
    holoRef.current.position.copy(meshRef.current.position);
    holoRef.current.rotation.copy(meshRef.current.rotation);
    holoRef.current.scale.copy(meshRef.current.scale);

    // Holo opacity driven by angular deviation from rest — more tilt = more shimmer
    const tilt =
      Math.abs(meshRef.current.rotation.x) +
      Math.abs(meshRef.current.rotation.y - BASE_ROT_Y);
    holoMat.opacity = Math.min(tilt * 0.85, 0.50);

    // Scroll holo UV — diagonal drift gives viewing-angle shimmer illusion
    holoTex.offset.set(
      Math.sin(t * 0.5) * 0.25,
      Math.cos(t * 0.4) * 0.25,
    );
    holoTex.needsUpdate = true;
  });

  return (
    <group>
      <mesh ref={meshRef} material={materials}>
        <boxGeometry args={dims} />
      </mesh>
      {/* Holographic shimmer layer — slightly proud of the mesh */}
      <mesh ref={holoRef} material={holoMat}>
        <boxGeometry args={[w + 0.002, h + 0.002, d + 0.002]} />
      </mesh>
    </group>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export interface PackModelProps {
  productType: string;
  setSlug: string;
  setName: string;
  imageUrl?: string | null;   // custom uploaded product image (admin override)
  logoUrl?: string | null;    // NOT used for the 3D face — kept for future use
  className?: string;
  cameraZ?: number;
  lowQuality?: boolean;
}

export function PackModel({
  productType, setSlug, imageUrl,
  className = "", cameraZ, lowQuality = false,
}: PackModelProps) {
  const dims            = PACK_DIMS[productType] ?? PACK_DIMS["PACK"]!;
  const accent          = SET_ACCENT[setSlug] ?? SET_ACCENT["default"]!;
  const resolvedCameraZ = cameraZ ?? computeCameraZ(dims);

  // Texture source: custom admin upload → bespoke product photo → type fallback
  const imgPath = imageUrl ?? resolveProductImage(setSlug, productType);

  const containerRef  = useRef<HTMLDivElement>(null);
  const mouseRef      = useRef({ x: 0, y: 0 });
  const isDragging    = useRef(false);
  const dragRot       = useRef({ x: 0, y: 0 });
  const lastPointer   = useRef({ x: 0, y: 0 });
  const isHovered     = useRef(false);
  const tweenRef      = useRef<gsap.core.Tween | null>(null);

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
    // GSAP elastic spring snaps back to resting angle
    tweenRef.current = gsap.to(dragRot.current, {
      x: 0, y: 0,
      duration: 1.1,
      ease: "elastic.out(1, 0.45)",
    });
  }, []);

  const handlePointerEnter  = useCallback(() => { isHovered.current = true; }, []);
  const handlePointerLeave  = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
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

        {/* Lighting rig */}
        <ambientLight intensity={0.30} />
        {/* Key light — warm white from upper-right front */}
        <directionalLight position={[2.5, 4, 3.5]} intensity={1.1} />
        {/* Purple rim — upper-left, catches the foil edge */}
        <pointLight position={[-2.5, 2.5, 2]} color="#a78bfa" intensity={2.6} />
        {/* Set-accent fill — below-right front, lifts shadow side */}
        <pointLight position={[2, -2, 2.5]} color={accent.light} intensity={1.6} />
        {/* Back rim — very subtle, separates product from dark background */}
        <pointLight position={[0, 0.5, -3]} color={accent.emissive} intensity={0.7} />

        <Suspense fallback={null}>
          <ProductMesh
            productType={productType}
            setSlug={setSlug}
            imgPath={imgPath}
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
