"use client";

import React, { useRef, useMemo, useCallback, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const PRODUCT_IMAGE: Record<string, Record<string, string>> = {
  "scarlet-violet":  { PACK: "/products/sv-pack.jpg", BOX: "/products/sv-box.jpg", ETB: "/products/sv-etb.jpg", BUNDLE: "/products/sv-box.jpg" },
  "paldea-evolved":  { PACK: "/products/pe-pack.jpg", BOX: "/products/pe-box.jpg", ETB: "/products/pe-etb.jpg", BUNDLE: "/products/pe-box.jpg" },
  "obsidian-flames": { PACK: "/products/of-pack.jpg", BOX: "/products/of-box.jpg", ETB: "/products/of-etb.jpg", BUNDLE: "/products/of-box.jpg" },
};

const FALLBACK_IMAGE = "/products/sv-pack.jpg";

const SET_ACCENT: Record<string, { side: string; light: string }> = {
  "scarlet-violet":  { side: "#1a0a1f", light: "#c0392b" },
  "paldea-evolved":  { side: "#12100a", light: "#d35400" },
  "obsidian-flames": { side: "#060d14", light: "#2980b9" },
  default:           { side: "#0d0820", light: "#7c3aed" },
};

// [width, height, depth] in Three.js units
const PACK_DIMS: Record<string, [number, number, number]> = {
  PACK:   [0.68, 1.0,  0.055],
  BOX:    [1.55, 1.05, 0.90],
  ETB:    [1.45, 1.10, 0.52],
  BUNDLE: [1.25, 1.05, 0.62],
};

// Measured pixel aspect ratios (w/h) of the product images
const IMAGE_AR: Record<string, number> = {
  PACK:   242 / 437,
  BOX:    330 / 437,
  ETB:    437 / 417,
  BUNDLE: 330 / 437,
};

// Slight 3/4 angle at rest — shows front + one side
const BASE_ROT_Y = 0.26;

// Drag clamp: ±20° ≈ ±0.35 rad
const DRAG_CLAMP = 0.35;

// ─── UV helpers ───────────────────────────────────────────────────────────────

function coverUV(faceW: number, faceH: number, imgAR: number) {
  const faceAR = faceW / faceH;
  if (faceAR >= imgAR) {
    const ry = imgAR / faceAR;
    return { rx: 1, ry, ox: 0, oy: (1 - ry) / 2 };
  } else {
    const rx = faceAR / imgAR;
    return { rx, ry: 1, ox: (1 - rx) / 2, oy: 0 };
  }
}

function applyFaceUV(tex: THREE.Texture, faceW: number, faceH: number, imgAR: number) {
  const { rx, ry, ox, oy } = coverUV(faceW, faceH, imgAR);
  tex.repeat.set(rx, ry);
  tex.offset.set(ox, oy);
  tex.needsUpdate = true;
}

// Auto camera Z so bounding sphere fills `fill` fraction of the canvas
function computeCameraZ(dims: [number, number, number], fill = 0.72, fovDeg = 42): number {
  const [w, h, d] = dims;
  const r = Math.sqrt(w * w + h * h + d * d) / 2;
  return r / (fill * Math.tan((fovDeg / 2) * (Math.PI / 180)));
}

// ─── Canvas textures ──────────────────────────────────────────────────────────

function createHoloTexture(): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const ctx = c.getContext("2d")!;
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
  return new THREE.CanvasTexture(c);
}

function createSideTexture(hexColor: string): THREE.CanvasTexture {
  const S = 128;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, S, S);
  const radial = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S * 0.7);
  radial.addColorStop(0, "rgba(255,255,255,0.13)");
  radial.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, S, S);
  return new THREE.CanvasTexture(c);
}

// ─── Error boundary ───────────────────────────────────────────────────────────

class TextureErrorBoundary extends React.Component<
  { fallbackSrc: string; children: React.ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) {
      return (
        <img
          src={this.props.fallbackSrc}
          alt="Product"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      );
    }
    return this.props.children;
  }
}

// ─── RoomEnvironment — zero network, procedural IBL ──────────────────────────

function SceneEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const env = pmrem.fromScene(new RoomEnvironment()).texture;
    scene.environment = env;
    pmrem.dispose();
    return () => {
      env.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

// ─── Shared ref shape ─────────────────────────────────────────────────────────

type InteractionRefs = {
  mouseRef:   React.MutableRefObject<{ x: number; y: number }>;
  isDragging: React.MutableRefObject<boolean>;
  dragRot:    React.MutableRefObject<{ x: number; y: number }>;
  isHovered:  React.MutableRefObject<boolean>;
};

// ─── 3D pack mesh ─────────────────────────────────────────────────────────────

function Pack({
  productType,
  setSlug,
  mouseRef,
  isDragging,
  dragRot,
  isHovered,
}: { productType: string; setSlug: string } & InteractionRefs) {
  const meshRef = useRef<THREE.Mesh>(null);
  const holoRef = useRef<THREE.Mesh>(null);

  const imgPath = PRODUCT_IMAGE[setSlug]?.[productType] ?? FALLBACK_IMAGE;
  const accent  = (SET_ACCENT[setSlug] ?? SET_ACCENT["default"])!;
  const dims    = (PACK_DIMS[productType] ?? PACK_DIMS["PACK"])!;
  const imgAR   = (IMAGE_AR[productType] ?? IMAGE_AR["PACK"])!;
  const [w, h, d] = dims;

  const productTex = useLoader(THREE.TextureLoader, imgPath);
  const holoTex    = useMemo(() => createHoloTexture(), []);

  const materials = useMemo(() => {
    productTex.colorSpace = THREE.SRGBColorSpace;

    const frontTex = productTex.clone();
    frontTex.colorSpace = THREE.SRGBColorSpace;
    applyFaceUV(frontTex, w, h, imgAR);

    const backTex = productTex.clone();
    backTex.colorSpace = THREE.SRGBColorSpace;
    applyFaceUV(backTex, w, h, imgAR);

    const sideTex    = createSideTexture(accent.side);
    const accentColor = new THREE.Color(accent.light);

    const matFront = new THREE.MeshStandardMaterial({
      map: frontTex, roughness: 0.15, metalness: 0.6,
      emissive: accentColor, emissiveIntensity: 0.12, envMapIntensity: 1.2,
    });
    const matBack = new THREE.MeshStandardMaterial({
      map: backTex, roughness: 0.28, metalness: 0.4,
      emissive: accentColor, emissiveIntensity: 0.05, envMapIntensity: 1.0,
    });
    const matSide = new THREE.MeshStandardMaterial({
      map: sideTex, roughness: 0.30, metalness: 0.5,
      emissive: accentColor, emissiveIntensity: 0.04, envMapIntensity: 0.8,
    });

    // BoxGeometry face order: +x(right), -x(left), +y(top), -y(bottom), +z(front), -z(back)
    return [matSide, matSide, matSide, matSide, matFront, matBack];
  }, [productTex, accent.side, accent.light, w, h, d, imgAR]);

  const holoMat = useMemo(() => new THREE.MeshBasicMaterial({
    map: holoTex, transparent: true, opacity: 0,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }), [holoTex]);

  useFrame((state) => {
    if (!meshRef.current || !holoRef.current) return;
    const t = state.clock.elapsedTime;

    // On release: drag rotation decays smoothly back to neutral
    if (!isDragging.current) {
      dragRot.current.x *= 0.92;
      dragRot.current.y *= 0.92;
    }

    // Hover tilt is disabled while dragging
    const hoverX = isDragging.current ? 0 : mouseRef.current.y * 0.35;
    const hoverY = isDragging.current ? 0 : mouseRef.current.x * 0.45;

    // BASE_ROT_Y gives the resting 3/4 angle; drag + hover layer on top
    const targetX = dragRot.current.x + hoverX;
    const targetY = BASE_ROT_Y + dragRot.current.y + hoverY;

    meshRef.current.position.y = Math.sin(t * 1.25) * 0.065;
    meshRef.current.rotation.x += (targetX - meshRef.current.rotation.x) * 0.08;
    meshRef.current.rotation.y += (targetY - meshRef.current.rotation.y) * 0.08;

    // Subtle scale-up on hover
    const targetScale = isHovered.current ? 1.04 : 1.0;
    const cs = meshRef.current.scale.x;
    meshRef.current.scale.setScalar(cs + (targetScale - cs) * 0.1);

    holoRef.current.position.copy(meshRef.current.position);
    holoRef.current.rotation.copy(meshRef.current.rotation);
    holoRef.current.scale.copy(meshRef.current.scale);

    const tilt = Math.abs(meshRef.current.rotation.x) + Math.abs(meshRef.current.rotation.y - BASE_ROT_Y);
    holoMat.opacity = Math.min(tilt * 0.85, 0.5);
    holoTex.offset.set(Math.sin(t * 0.5) * 0.3, Math.cos(t * 0.4) * 0.3);
    holoTex.needsUpdate = true;
  });

  return (
    <group>
      <mesh ref={meshRef} material={materials}>
        <boxGeometry args={dims} />
      </mesh>
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
  className?: string;
  cameraZ?: number;
  lowQuality?: boolean;
}

export function PackModel({
  productType,
  setSlug,
  className = "",
  cameraZ,
  lowQuality = false,
}: PackModelProps) {
  const accent          = (SET_ACCENT[setSlug] ?? SET_ACCENT["default"])!;
  const dims            = (PACK_DIMS[productType] ?? PACK_DIMS["PACK"])!;
  const resolvedCameraZ = cameraZ ?? computeCameraZ(dims);
  const imgPath         = PRODUCT_IMAGE[setSlug]?.[productType] ?? FALLBACK_IMAGE;

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef     = useRef({ x: 0, y: 0 });
  const isDragging   = useRef(false);
  const dragRot      = useRef({ x: 0, y: 0 });
  const lastPointer  = useRef({ x: 0, y: 0 });
  const isHovered    = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
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
  }, []);

  const handlePointerEnter = useCallback(() => {
    isHovered.current = true;
  }, []);

  const handlePointerLeave = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    isHovered.current = false;
    mouseRef.current = { x: 0, y: 0 };
    // Don't cancel drag here — pointer capture keeps events flowing until pointerup
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
      <TextureErrorBoundary fallbackSrc={imgPath}>
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
          <ambientLight intensity={0.2} />
          <directionalLight position={[3, 5, 4]} intensity={0.9} />
          <pointLight position={[-1.5, 1.5, 1.5]} color="#a78bfa" intensity={2.0} />
          <pointLight position={[1.5, -1, 2]} color={accent.light} intensity={1.4} />
          <Suspense fallback={null}>
            <Pack
              productType={productType}
              setSlug={setSlug}
              mouseRef={mouseRef}
              isDragging={isDragging}
              dragRot={dragRot}
              isHovered={isHovered}
            />
          </Suspense>
        </Canvas>
      </TextureErrorBoundary>
    </div>
  );
}
