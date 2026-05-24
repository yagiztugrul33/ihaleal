import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

type Showcase3DProps = {
  className?: string;
  modelKey?: "tower" | "villa" | "campus";
  title?: string;
};

const MODEL_COLORS: Record<NonNullable<Showcase3DProps["modelKey"]>, string> = {
  tower: "#9FB7D9",
  villa: "#D4C6A0",
  campus: "#A8B8B0",
};

export function Showcase3D({ className, modelKey = "tower", title = "3D Vitrin" }: Showcase3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    setIsReady(false);
    setFallback(false);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let isDragging = false;
    let pointerX = 0;
    let pointerY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let scale = 1;
    let renderer: THREE.WebGLRenderer | null = null;
    let markedReady = false;

    try {
      const testCanvas = document.createElement("canvas");
      if (!testCanvas.getContext("webgl")) {
        setFallback(true);
        return;
      }
    } catch {
      setFallback(true);
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#F5F5F7");

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(3.2, 2.2, 4.2);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    root.appendChild(renderer.domElement);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(3.5, 64),
      new THREE.MeshStandardMaterial({ color: "#FAFAFC", roughness: 0.92, metalness: 0.05 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.65;
    scene.add(floor);

    const modelGroup = new THREE.Group();
    const baseColor = MODEL_COLORS[modelKey];
    const mat = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      roughness: 0.36,
      metalness: 0.22,
      clearcoat: 0.2,
      clearcoatRoughness: 0.4,
    });

    if (modelKey === "tower") {
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.5, 1.1), mat);
      b1.position.set(0, 0.65, 0);
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.7, 0.65), mat);
      b2.position.set(0.8, 0.25, 0.35);
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.62, 0.5, 20), mat);
      roof.position.set(0, 1.9, 0);
      modelGroup.add(b1, b2, roof);
    } else if (modelKey === "villa") {
      const main = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.2, 1.45), mat);
      main.position.y = -0.05;
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 1.15, 0.82, 4), mat);
      top.position.y = 0.82;
      top.rotation.y = Math.PI / 4;
      const annex = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.72), mat);
      annex.position.set(-1.08, -0.26, 0.52);
      modelGroup.add(main, top, annex);
    } else {
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.2, 1.1), mat);
      c1.position.set(-0.7, -0.05, 0);
      const c2 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.65, 1.2), mat);
      c2.position.set(0.82, 0.14, -0.1);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.54, 26, 22), mat);
      dome.position.set(0.82, 1.16, -0.1);
      modelGroup.add(c1, c2, dome);
    }

    modelGroup.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    scene.add(modelGroup);

    const hemi = new THREE.HemisphereLight("#FAFAFC", "#D6DCE8", 0.95);
    scene.add(hemi);
    const key = new THREE.DirectionalLight("#FAFAFC", 1.05);
    key.position.set(3.4, 5.6, 2.5);
    scene.add(key);

    const resize = () => {
      const width = root.clientWidth || 640;
      const height = root.clientHeight || 360;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer?.setSize(width, height, false);
    };
    resize();

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      pointerX = e.clientX;
      pointerY = e.clientY;
      root.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - pointerX;
      const dy = e.clientY - pointerY;
      pointerX = e.clientX;
      pointerY = e.clientY;
      velocityX = dx * 0.0024;
      velocityY = dy * 0.0016;
      modelGroup.rotation.y += velocityX;
      modelGroup.rotation.x = THREE.MathUtils.clamp(modelGroup.rotation.x + velocityY, -0.35, 0.35);
    };
    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      root.releasePointerCapture(e.pointerId);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      scale = THREE.MathUtils.clamp(scale + e.deltaY * -0.0008, 0.78, 1.32);
      modelGroup.scale.setScalar(scale);
    };

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    root.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", resize);

    const animate = () => {
      if (!prefersReduced && !isDragging) {
        modelGroup.rotation.y += 0.0045 + velocityX * 0.2;
      }
      if (!isDragging) {
        velocityX *= 0.93;
        velocityY *= 0.9;
        modelGroup.rotation.x = THREE.MathUtils.clamp(modelGroup.rotation.x + velocityY * 0.15, -0.35, 0.35);
      }
      renderer?.render(scene, camera);
      if (!markedReady) {
        markedReady = true;
        setIsReady(true);
      }
      raf = window.requestAnimationFrame(animate);
    };
    raf = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointercancel", onPointerUp);
      root.removeEventListener("wheel", onWheel);
      renderer?.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      root.innerHTML = "";
    };
  }, [modelKey]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-[#DFE5EF] bg-[radial-gradient(ellipse_at_top,_#FAFAFC_10%,_#F5F5F7_72%)]",
        className,
      )}
    >
      <div ref={containerRef} className="h-[280px] w-full md:h-[360px]" aria-label={`${title} etkileşimli önizleme`} />
      {fallback || !isReady ? (
        <div className="absolute inset-0 z-[2]">
          <img src="/images/auction-1.jpg" alt={`${title} fotoğraf önizleme`} className="h-[280px] w-full object-cover md:h-[360px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" />
        </div>
      ) : null}
      <div className="pointer-events-none absolute left-3 top-3 z-[3] rounded-full border border-[#CFE2FA] bg-card/90 px-3 py-1 text-[11px] font-semibold text-[#0071E3]">
        3D Görünüm
      </div>
      <p className="relative z-[3] border-t border-[#ECECF0] bg-background/80 px-3 py-2 text-[11px] text-[#6E6E73]">
        3D önizleme seçili vitrin mülkleri için demodur.
      </p>
    </div>
  );
}
