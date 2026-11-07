"use client";

import React, { useEffect, useRef } from "react";

interface LegalMonolithCanvasProps {
  scrollProgress?: number;
  variant?: "dark" | "light";
  className?: string;
}

/**
 * Cena 3D Procedural em Canvas (react-3d-motion Nível 2 — Geometria Arquitetônica & Balança de Precisão)
 * Renderiza um monólito arquitetônico em perspectiva 3D real com amortecimento dependente de delta,
 * resposta suave ao ponteiro e ao progresso do scroll (Framerate), DPR limitado a 1.75 e respeito
 * integral a prefers-reduced-motion.
 */
export function LegalMonolithCanvas({
  scrollProgress = 0,
  variant = "dark",
  className = "",
}: LegalMonolithCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef(scrollProgress);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    let animationFrameId = 0;
    let lastTime = performance.now();
    let angleY = 0.42;
    let angleX = 0.18;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const onPointerMove = (e: PointerEvent) => {
      if (reducedMotion || e.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
      pointerRef.current.targetX = nx * 0.28;
      pointerRef.current.targetY = ny * 0.18;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Projeção 3D em perspectiva (FOV controlado estilo lente editorial)
    const project = (
      x: number,
      y: number,
      z: number,
      rotX: number,
      rotY: number,
      cx: number,
      cy: number,
      scale: number
    ) => {
      // Rotação Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;

      // Rotação X
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;

      const cameraDist = 4.6;
      const factor = cameraDist / (cameraDist + z2);
      return {
        x: cx + x1 * scale * factor,
        y: cy + y2 * scale * factor,
        z: z2,
        factor,
      };
    };

    const drawBoxWireframe = (
      hx: number,
      hy: number,
      hz: number,
      offsetY: number,
      rotX: number,
      rotY: number,
      cx: number,
      cy: number,
      scale: number,
      strokeColor: string,
      fillColor?: string
    ) => {
      const vertices = [
        [-hx, -hy + offsetY, -hz],
        [hx, -hy + offsetY, -hz],
        [hx, hy + offsetY, -hz],
        [-hx, hy + offsetY, -hz],
        [-hx, -hy + offsetY, hz],
        [hx, -hy + offsetY, hz],
        [hx, hy + offsetY, hz],
        [-hx, hy + offsetY, hz],
      ].map(([vx, vy, vz]) => project(vx, vy, vz, rotX, rotY, cx, cy, scale));

      const edges = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ];

      if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        ctx.lineTo(vertices[1].x, vertices[1].y);
        ctx.lineTo(vertices[2].x, vertices[2].y);
        ctx.lineTo(vertices[3].x, vertices[3].y);
        ctx.closePath();
        ctx.fill();
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const [a, b] of edges) {
        ctx.moveTo(vertices[a].x, vertices[a].y);
        ctx.lineTo(vertices[b].x, vertices[b].y);
      }
      ctx.stroke();
    };

    const render = (now: number) => {
      const delta = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      ctx.clearRect(0, 0, width, height);

      // Amortecimento suave (damp) conforme skill react-3d-motion
      const damp = 1 - Math.exp(-6 * delta);
      pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * damp;
      pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * damp;

      if (!reducedMotion) {
        angleY += delta * 0.22;
      }

      const effectiveRotY = angleY + scrollRef.current * Math.PI * 0.85 + pointerRef.current.x;
      const effectiveRotX = angleX + pointerRef.current.y + Math.sin(scrollRef.current * Math.PI) * 0.12;

      const cx = width * 0.68;
      const cy = height * 0.5;
      const baseScale = Math.min(width, height) * 0.27;

      const primaryStroke =
        variant === "dark" ? "rgba(254, 254, 252, 0.28)" : "rgba(10, 10, 10, 0.25)";
      const accentStroke =
        variant === "dark" ? "rgba(235, 245, 237, 0.58)" : "rgba(10, 10, 10, 0.65)";
      const subtleFill =
        variant === "dark" ? "rgba(235, 245, 237, 0.035)" : "rgba(189, 212, 240, 0.14)";

      // Grade orbital editorial de fundo
      ctx.strokeStyle =
        variant === "dark" ? "rgba(254, 254, 252, 0.07)" : "rgba(10, 10, 10, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, baseScale * 1.38, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, baseScale * 0.96, 0, Math.PI * 2);
      ctx.stroke();

      // Três pilares arquitetônicos (Consultivo, Contencioso, Governança)
      drawBoxWireframe(
        0.52,
        1.18,
        0.52,
        0,
        effectiveRotX,
        effectiveRotY,
        cx,
        cy,
        baseScale,
        accentStroke,
        subtleFill
      );

      drawBoxWireframe(
        1.05,
        0.14,
        0.36,
        -0.72,
        effectiveRotX,
        effectiveRotY * 0.85,
        cx,
        cy,
        baseScale,
        primaryStroke
      );

      drawBoxWireframe(
        0.88,
        0.88,
        0.88,
        0,
        -effectiveRotX * 0.6,
        -effectiveRotY * 0.55,
        cx,
        cy,
        baseScale * 0.78,
        primaryStroke
      );

      if (!reducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none block h-full w-full ${className}`}
    />
  );
}
