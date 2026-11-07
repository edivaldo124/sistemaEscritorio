import type { Variants, Transition } from "framer-motion";

export const ease = [0.22, 1, 0.36, 1] as const;
export const expoOut = [0.16, 1, 0.3, 1] as const;

export const spring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const softSpring: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 22,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, ease },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: spring,
  },
};

export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)", y: 10 },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.55, ease },
  },
};

export const slideX: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 36 : -36, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: spring },
  exit: (dir: number) => ({
    x: dir > 0 ? -36 : 36,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

export const shake = {
  x: [0, -8, 8, -6, 6, -3, 3, 0],
  transition: { duration: 0.42 },
};

export const stagger = (delay = 0.07): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: delay,
    },
  },
});
