"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface ActiveProfile {
  id: string;
  name: string;
  email: string;
  oab: string | null;
  role: "SOCIO" | "ADVOGADO" | "ASSISTENTE" | "CLIENTE";
  cargo: string;
}

export const INSTITUTIONAL_PROFILES: ActiveProfile[] = [
  {
    id: "barbara-mfv",
    name: "Dra. Bárbara de Melo Fernandes Vasconcelos",
    email: "barbara@mfv.adv.br",
    oab: "OAB/PB 19.571",
    role: "SOCIO",
    cargo: "Sócia-Fundadora",
  },
  {
    id: "higor-mfv",
    name: "Dr. Higor Vasconcelos de Almeida",
    email: "higor@mfv.adv.br",
    oab: "OAB/PB 19.503",
    role: "SOCIO",
    cargo: "Sócio-Fundador",
  },
  {
    id: "secretaria-mfv",
    name: "Secretaria & Atendimento — MFV Advocacia",
    email: "contato@mfv.adv.br",
    oab: null,
    role: "ASSISTENTE",
    cargo: "Coordenação Administrativa (Sousa/PB)",
  },
];

interface FirmContextValue {
  activeProfile: ActiveProfile;
  setActiveProfile: (profile: ActiveProfile) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
}

const FirmContext = createContext<FirmContextValue | undefined>(undefined);

export function FirmProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfileState] = useState<ActiveProfile>(INSTITUTIONAL_PROFILES[0]);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("mfv_active_profile_email");
      if (savedEmail) {
        const found = INSTITUTIONAL_PROFILES.find((p) => p.email === savedEmail);
        if (found) setActiveProfileState(found);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const setActiveProfile = (profile: ActiveProfile) => {
    setActiveProfileState(profile);
    try {
      localStorage.setItem("mfv_active_profile_email", profile.email);
    } catch {
      // ignore storage errors
    }
  };

  return (
    <FirmContext.Provider
      value={{
        activeProfile,
        setActiveProfile,
        commandOpen,
        setCommandOpen,
      }}
    >
      {children}
    </FirmContext.Provider>
  );
}

export function useFirm() {
  const ctx = useContext(FirmContext);
  if (!ctx) {
    throw new Error("useFirm deve ser utilizado dentro de um FirmProvider");
  }
  return ctx;
}
