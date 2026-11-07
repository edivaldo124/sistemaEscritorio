"use client";

import React, { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  surface?: "parchment" | "verdigris" | "slate" | "dark";
}

const surfaceMap = {
  parchment: "bg-[#fefefc] text-[#0a0a0a] border border-[#0a0a0a]",
  verdigris: "bg-[#ebf5ed] text-[#0a0a0a] border border-[#0a0a0a]",
  slate: "bg-[#bdd4f0] text-[#0a0a0a] border border-[#0a0a0a]",
  dark: "bg-[#0a0a0a] text-[#fefefc] border border-[#0a0a0a]",
};

export function TiltCard({
  children,
  className,
  maxTilt = 6,
  surface = "parchment",
}: TiltCardProps) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), {
    stiffness: 220,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), {
    stiffness: 220,
    damping: 22,
  });

  const glareX = useTransform(x, (v) => v * 100);
  const glareY = useTransform(y, (v) => v * 100);
  const glare = useMotionTemplate`radial-gradient(320px circle at ${glareX}% ${glareY}%, rgba(235, 245, 237, 0.38), transparent 70%)`;

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }

  function handlePointerLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <div style={{ perspective: 950 }} className="h-full">
      <motion.div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={
          reduceMotion
            ? undefined
            : {
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }
        }
        className={cn(
          "relative h-full rounded-[8px] p-6 will-change-transform transition-colors",
          surfaceMap[surface],
          className
        )}
      >
        {surface !== "dark" && !reduceMotion && (
          <motion.div
            aria-hidden
            style={{ background: glare }}
            className="pointer-events-none absolute inset-0 rounded-[8px]"
          />
        )}
        <div className="relative z-10 h-full" style={reduceMotion ? undefined : { transform: "translateZ(16px)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
}

export function FlipCard({ front, back, className }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn("relative [perspective:1100px]", className)}
      onClick={() => setFlipped((prev) => !prev)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((prev) => !prev);
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label="Alternar visualização detalhada do cartão"
    >
      <motion.div
        animate={{ rotateY: reduceMotion ? 0 : flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 170, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative min-h-[290px] w-full cursor-pointer"
      >
        <div
          className={cn(
            " inset-0 h-full w-full rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 [backface-visibility:hidden]",
            reduceMotion && flipped ? "hidden" : "block"
          )}
        >
          {front}
        </div>
        <div
          className={cn(
            "inset-0 h-full w-full rounded-[8px] border border-[#0a0a0a] bg-[#ebf5ed] p-6 [backface-visibility:hidden]",
            reduceMotion
              ? flipped
                ? "block"
                : "hidden"
              : "absolute [transform:rotateY(180deg)]"
          )}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}

export function CountUp({
  to,
  format = (v: number) => Math.round(v).toLocaleString("pt-BR"),
}: {
  to: number;
  format?: (v: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      if (ref.current) ref.current.textContent = format(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.0,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(v);
      },
    });
    return () => controls.stop();
  }, [inView, to, format, reduceMotion]);

  return <span ref={ref}>{format(to)}</span>;
}
