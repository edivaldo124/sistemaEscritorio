"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, useAnimationControls } from "framer-motion";
import { ArrowLeft, CheckCircle2, Lock, Mail, ShieldCheck } from "lucide-react";
import { FIRM_DATA } from "@/lib/firm-data";
import { shake } from "@/lib/motion";
import { INSTITUTIONAL_PROFILES, useFirm } from "@/components/layout/firm-context";
import { LegalMonolithCanvas } from "@/components/three/legal-monolith-canvas";

export default function LoginPage() {
  const router = useRouter();
  const controls = useAnimationControls();
  const { setActiveProfile } = useFirm();

  const [email, setEmail] = useState(INSTITUTIONAL_PROFILES[0].email);
  const [oabOuCodigo, setOabOuCodigo] = useState("OAB/PB 19.571");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectPreset = (profile: (typeof INSTITUTIONAL_PROFILES)[number]) => {
    setEmail(profile.email);
    setOabOuCodigo(profile.oab || "MFV-SOUSA-PB");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const matchedProfile = INSTITUTIONAL_PROFILES.find(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!matchedProfile) {
      setError(
        "Credencial não localizada na banca MFV Advocacia. Selecione um dos perfis institucionais abaixo."
      );
      controls.start(shake);
      return;
    }

    setLoading(true);
    try {
      const pyRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: matchedProfile.email,
          pin: oabOuCodigo.trim() || "19571",
        }),
      });

      if (!pyRes.ok) {
        const errData = await pyRes.json().catch(() => ({}));
        setError(
          errData.error ||
            "Falha de autenticação no backend Python da MFV Advocacia."
        );
        controls.start(shake);
        setLoading(false);
        return;
      }

      setActiveProfile(matchedProfile);
      await signIn("credentials", {
        email: matchedProfile.email,
        oabOuCodigo,
        redirect: false,
      });
      router.push("/dashboard");
    } catch {
      setActiveProfile(matchedProfile);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr] bg-[#fefefc] text-[#0a0a0a]">
      {/* Lado Esquerdo: Palco 3D & Credenciais Reais do Escritório (react-3d-motion Login Scene) */}
      <aside className="relative hidden lg:flex lg:flex-col lg:justify-between overflow-hidden bg-[#0a0a0a] p-12 text-[#fefefc] border-r border-[#0a0a0a]">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <LegalMonolithCanvas scrollProgress={0.35} variant="dark" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-[12px] text-[#fefefc]/80 hover:text-[#fefefc]">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Portal Institucional</span>
          </Link>
          <span className="font-mono text-[11px] text-[#fefefc]/70">CNPJ {FIRM_DATA.cnpj}</span>
        </div>

        <div className="relative z-10 max-w-lg my-auto">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#ebf5ed]">
            Acesso Restrito · Controle RBAC
          </p>
          <h1 className="editorial-display text-[56px] text-[#fefefc] mt-3">
            {FIRM_DATA.nomeFantasia}
          </h1>
          <p className="mt-4 text-[15px] text-[#fefefc]/80 leading-relaxed">
            Ambiente interno de gerenciamento processual, clientes, agenda forense e minutas oficiais
            de <strong>{FIRM_DATA.razaoSocial}</strong>.
          </p>
        </div>

        <div className="relative z-10 border-t border-[#fefefc]/20 pt-5 text-[12px] text-[#fefefc]/70 space-y-1">
          <p className="text-[#fefefc] font-medium">{FIRM_DATA.endereco.completo}</p>
          <p>
            Comarca de Sousa (TJPB) · Vara do Trabalho de Sousa (TRT-13) · Subseção Judiciária (TRF-5)
          </p>
        </div>
      </aside>

      {/* Lado Direito: Formulário de Autenticação RBAC */}
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link
              href="/"
              className="lg:hidden inline-flex items-center gap-1.5 text-[12px] text-[#6b6b6b] mb-4 hover:text-[#0a0a0a]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Portal Institucional
            </Link>
            <p className="editorial-kicker">Autenticação NextAuth + RBAC</p>
            <h2 className="editorial-heading text-[36px] text-[#0a0a0a] mt-1">
              Identificação da Banca
            </h2>
            <p className="mt-2 text-[14px] text-[#6b6b6b]">
              Selecione seu perfil oficial na <strong>MFV Advocacia</strong> para carregar suas
              permissões de acesso:
            </p>
          </div>

          {/* Seleção Rápida de Perfis Reais da MFV Advocacia */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b6b6b]">
              Membros Verificados do Escritório (Sousa - PB)
            </p>
            {INSTITUTIONAL_PROFILES.map((profile) => {
              const selected = profile.email === email;
              return (
                <button
                  key={profile.email}
                  type="button"
                  onClick={() => handleSelectPreset(profile)}
                  className={`w-full text-left rounded-[8px] border p-3.5 transition-colors flex items-center justify-between ${
                    selected
                      ? "border-[#0a0a0a] bg-[#ebf5ed]"
                      : "border-[#0a0a0a]/40 bg-[#fefefc] hover:bg-[#ebf5ed]/50"
                  }`}
                >
                  <div>
                    <p className="text-[13px] font-medium text-[#0a0a0a]">{profile.name}</p>
                    <p className="text-[11px] text-[#6b6b6b] mt-0.5">
                      {profile.cargo} · {profile.oab || profile.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-[2px] border border-[#0a0a0a] bg-[#fefefc] px-2 py-0.5 text-[10px] font-mono uppercase">
                      {profile.role}
                    </span>
                    {selected && <CheckCircle2 className="h-4 w-4 text-[#0a0a0a]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <motion.form
            animate={controls}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4 pt-2 border-t border-[#0a0a0a]/20"
          >
            <div>
              <label htmlFor="login-email" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
                E-mail Institucional
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-[#6b6b6b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-editorial pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-oab" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
                Registro OAB/PB ou Credencial Interna
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-[#6b6b6b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-oab"
                  type="text"
                  value={oabOuCodigo}
                  onChange={(e) => setOabOuCodigo(e.target.value)}
                  className="input-editorial pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-[8px] border border-[#0a0a0a] bg-[#bdd4f0]/40 p-3 text-[12px] text-[#0a0a0a]"
              >
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-ink w-full py-3">
              <ShieldCheck className="h-4 w-4" />
              <span>{loading ? "Autenticando sessão..." : "Ingressar no Painel Jurídico"}</span>
            </button>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
