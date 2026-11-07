"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Calendar,
  FileText,
  Gavel,
  MapPin,
  Phone,
  Scale,
  ShieldCheck,
  Users,
} from "lucide-react";
import { FIRM_DATA } from "@/lib/firm-data";
import { fadeUp, stagger } from "@/lib/motion";
import { FlipCard, TiltCard } from "@/components/ui/tilt-card";
import { LegalMonolithCanvas } from "@/components/three/legal-monolith-canvas";

const HERO_HEADLINES = [
  {
    eyebrow: "SOUSA · PARAÍBA · CNPJ 22.233.391/0001-27",
    title: ["Melo Fernandes", "& Vasconcelos."],
    detail:
      "Sociedade de advogados sediada no Centro de Sousa – PB, com atuação consultiva e contenciosa estratégica.",
  },
  {
    eyebrow: "DRA. BÁRBARA DE MELO FERNANDES (OAB/PB 19.571) · DR. HIGOR VASCONCELOS (OAB/PB 19.503)",
    title: ["Rigor técnico no", "Alto Sertão."],
    detail:
      "Assessoria Jurídica Empresarial, Direito Administrativo, Cível, Previdenciário, Tributário e Consumidor.",
  },
  {
    eyebrow: "COMARCA DE SOUSA (TJPB) · VARA DO TRABALHO (TRT-13) · SUBSEÇÃO FEDERAL (TRF-5)",
    title: ["Presença sólida", "nos Tribunais."],
    detail:
      "Acompanhamento processual integrado às unidades judiciárias estaduais, trabalhistas e federais de Sousa/PB.",
  },
  {
    eyebrow: "PLATAFORMA INTERNA DE GESTÃO JURÍDICA & DOCUMENTAL",
    title: ["Controle absoluto", "de cada prazo."],
    detail:
      "Gestão centralizada de clientes, autos CNJ, pauta de audiências, minutas oficiais e relatórios executivos.",
  },
];

export default function HomePage() {
  const heroTrackRef = useRef<HTMLElement | null>(null);
  const meterFillRef = useRef<HTMLSpanElement | null>(null);
  const meterValueRef = useRef<HTMLSpanElement | null>(null);
  const headlineIndexRef = useRef(0);

  const [activeHeadline, setActiveHeadline] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [lgpdAccepted, setLgpdAccepted] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("mfv_lgpd_consent") === "1") {
        setLgpdAccepted(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const track = heroTrackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const totalScrollable = Math.max(1, rect.height - window.innerHeight);
      const rawProgress = -rect.top / totalScrollable;
      const clamped = Math.min(1, Math.max(0, rawProgress));

      setScrollProgress(clamped);
      setScrolledPastHero(rect.bottom <= 80);

      // Atualização direta no DOM do medidor Framerate (zero re-render por frame)
      const pct = Math.round(clamped * 100);
      if (meterFillRef.current) {
        meterFillRef.current.style.height = `${Math.max(4, pct)}%`;
      }
      if (meterValueRef.current) {
        meterValueRef.current.textContent = String(pct).padStart(2, "0");
      }

      const nextIndex = Math.min(
        HERO_HEADLINES.length - 1,
        Math.floor(clamped / (1 / HERO_HEADLINES.length))
      );
      if (nextIndex !== headlineIndexRef.current) {
        headlineIndexRef.current = nextIndex;
        setActiveHeadline(nextIndex);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#fefefc] text-[#0a0a0a]">
        {/* Top Navigation Bar (design-system.md: black-filled over dark hero, transitions to parchment on scroll) */}
        <header
          className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 border-b ${
            scrolledPastHero
              ? "bg-[#fefefc]/95 text-[#0a0a0a] border-[#0a0a0a]"
              : "bg-[#0a0a0a]/90 text-[#fefefc] border-[#fefefc]/15"
          } backdrop-blur-sm`}
        >
          <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="font-serif text-[22px] font-light tracking-tight">
                {FIRM_DATA.nomeFantasia}
              </span>
              <span
                className={`hidden sm:inline-block text-[10px] uppercase tracking-[0.14em] ${
                  scrolledPastHero ? "text-[#6b6b6b]" : "text-[#fefefc]/65"
                }`}
              >
                Sousa · PB
              </span>
            </Link>

            <nav aria-label="Navegação Institucional" className="hidden md:flex items-center gap-7 text-[13px]">
              <a href="#atuacao" className="hover:opacity-75 transition-opacity">
                Áreas de Atuação
              </a>
              <a href="#socios" className="hover:opacity-75 transition-opacity">
                Sócios-Fundadores
              </a>
              <a href="#jurisdicao" className="hover:opacity-75 transition-opacity">
                Jurisdição em Sousa/PB
              </a>
              <Link href="/clientes" className="hover:opacity-75 transition-opacity">
                Clientes
              </Link>
              <Link href="/processos" className="hover:opacity-75 transition-opacity">
                Processos
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className={`hidden sm:inline-flex items-center rounded-[2px] border px-3.5 py-1.5 text-[12px] transition-colors ${
                  scrolledPastHero
                    ? "border-[#0a0a0a] text-[#0a0a0a] hover:bg-[#ebf5ed]"
                    : "border-[#fefefc]/40 text-[#fefefc] hover:bg-[#fefefc]/10"
                }`}
              >
                Autenticação
              </Link>
              <Link
                href="/dashboard"
                className={`inline-flex items-center gap-1.5 rounded-[2px] px-4 py-2 text-[12px] font-medium transition-colors ${
                  scrolledPastHero
                    ? "bg-[#000000] text-[#fefefc] hover:bg-[#0a0a0a]"
                    : "bg-[#ebf5ed] text-[#0a0a0a] hover:bg-[#fefefc]"
                }`}
              >
                <span>Acessar Sistema</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* 1. Cinematic Scrollytelling Hero (Framerate + Legora 88px Whisper-Weight Serif + 3D Monolith) */}
        <section
          ref={heroTrackRef}
          aria-label="Apresentação institucional MFV Advocacia em Sousa - PB"
          className="hero-scroll-track"
        >
          <div className="hero-sticky-stage">
            {/* Camada 3D Procedural reativa ao scroll e ponteiro */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-85">
              <LegalMonolithCanvas scrollProgress={scrollProgress} variant="dark" />
            </div>

            {/* Topo do Stage */}
            <div className="relative z-10 pt-14 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-[#fefefc]/70">
              <span>{FIRM_DATA.razaoSocial}</span>
              <span>RUA LAFAYETTE PIRES FERREIRA, 35 · CENTRO · SOUSA/PB</span>
            </div>

            {/* Pilha de Manchetes Framerate com Reveal por Máscara */}
            <div className="relative z-10 my-auto flex flex-col justify-center">
              <div className="headline-stack" aria-live="polite">
                {HERO_HEADLINES.map((item, index) => {
                  const stateClass =
                    index === activeHeadline
                      ? "is-active"
                      : index < activeHeadline
                      ? "is-before"
                      : "is-after";
                  return (
                    <div
                      key={item.title.join("-")}
                      aria-hidden={index !== activeHeadline}
                      className={`headline-state ${stateClass}`}
                    >
                      <p className="mb-4 flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#fefefc]/75">
                        <span
                          className="inline-block h-2 w-2 rounded-full bg-[#ebf5ed]"
                          aria-hidden="true"
                        />
                        <span>{item.eyebrow}</span>
                      </p>

                      <h1 className="editorial-display text-[48px] sm:text-[68px] lg:text-[88px] text-[#fefefc]">
                        {item.title.map((line) => (
                          <span key={line} className="headline-line">
                            <span>{line}</span>
                          </span>
                        ))}
                      </h1>

                      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 max-w-2xl">
                        <p className="text-[15px] sm:text-[16px] text-[#fefefc]/80 leading-relaxed max-w-md">
                          {item.detail}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 rounded-[2px] bg-[#000000] border border-[#fefefc] px-6 py-2.5 text-[14px] text-[#fefefc] hover:bg-[#fefefc] hover:text-[#000000] transition-colors"
                          >
                            Abrir Painel Jurídico
                          </Link>
                          <a href="#atuacao" className="circle-arrow-link">
                            <span>Explorar</span>
                            <span className="circle-arrow" aria-hidden="true">
                              ↓
                            </span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Base do Stage + Medidor de Scroll 00-100 (Framerate) */}
            <div className="relative z-10 flex items-end justify-between gap-4 border-t border-[#fefefc]/15 pt-4">
              <div className="flex flex-wrap items-center gap-6 text-[11px] text-[#fefefc]/70">
                <span>OAB/PB 19.571 · Dra. Bárbara de Melo Fernandes</span>
                <span>OAB/PB 19.503 · Dr. Higor Vasconcelos de Almeida</span>
                <span>{FIRM_DATA.contatos.telefonePrincipal}</span>
              </div>

              <div className="scroll-meter" aria-label="Progresso de leitura da abertura">
                <div className="scroll-meter-track">
                  <span ref={meterFillRef} className="scroll-meter-fill" />
                </div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#fefefc]/70">
                  <p className="text-[#fefefc] font-mono text-[13px]">
                    <span ref={meterValueRef}>00</span> / 100
                  </p>
                  <p className="mt-0.5">Role para avançar</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Faixa de Órgãos Judiciários Reais de Sousa - PB (Partner Logo Bar style from design-system.md) */}
        <section className="border-b border-[#0a0a0a] bg-[#fefefc] py-8 px-4 sm:px-6">
          <div className="mx-auto max-w-[1200px]">
            <p className="editorial-kicker text-center mb-5">
              Órgãos Judiciários e Institucionais de Atuação Direta em Sousa – PB
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {FIRM_DATA.orgaosJudiciariosSousa.map((orgao) => (
                <div key={orgao.sigla} className="opacity-75 hover:opacity-100 transition-opacity">
                  <p className="font-serif text-[20px] font-light text-[#0a0a0a]">{orgao.sigla}</p>
                  <p className="text-[11px] text-[#6b6b6b] mt-0.5">{orgao.esfera}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Manifesto Editorial Centralizado (design-system.md + apple-design) */}
        <section className="py-[80px] px-4 sm:px-6 border-b border-[#0a0a0a]">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="editorial-kicker">Identidade Institucional Verificada · Sousa / PB</p>
            <h2 className="editorial-heading mx-auto mt-4 max-w-3xl text-[36px] sm:text-[52px] text-[#0a0a0a]">
              Advocacia empresarial e contenciosa pautada pela precisão técnica.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-[16px] text-[#6b6b6b] leading-relaxed">
              Fundado pelos sócios{" "}
              <strong className="font-medium text-[#0a0a0a]">
                Dra. Bárbara de Melo Fernandes Vasconcelos (OAB/PB 19.571)
              </strong>{" "}
              e{" "}
              <strong className="font-medium text-[#0a0a0a]">
                Dr. Higor Vasconcelos de Almeida (OAB/PB 19.503)
              </strong>
              , o escritório{" "}
              <strong className="font-medium text-[#0a0a0a]">{FIRM_DATA.razaoSocial}</strong>{" "}
              (CNPJ {FIRM_DATA.cnpj}) atua a partir de sua sede no Centro de Sousa – PB na defesa de
              empresas, servidores públicos e cidadãos do Alto Sertão Paraibano.
            </p>

            {/* Acesso Direto aos Módulos do Sistema */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
              <Link
                href="/clientes"
                className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-4 hover:bg-[#ebf5ed] transition-colors"
              >
                <Users className="h-4 w-4 text-[#0a0a0a]" />
                <p className="mt-2 font-medium text-[14px] text-[#0a0a0a]">Gestão de Clientes</p>
                <p className="text-[12px] text-[#6b6b6b] mt-0.5">Pessoas Físicas e Jurídicas</p>
              </Link>
              <Link
                href="/processos"
                className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-4 hover:bg-[#ebf5ed] transition-colors"
              >
                <Gavel className="h-4 w-4 text-[#0a0a0a]" />
                <p className="mt-2 font-medium text-[14px] text-[#0a0a0a]">Controle Processual</p>
                <p className="text-[12px] text-[#6b6b6b] mt-0.5">TJPB, TRT-13 e TRF-5</p>
              </Link>
              <Link
                href="/agenda"
                className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-4 hover:bg-[#ebf5ed] transition-colors"
              >
                <Calendar className="h-4 w-4 text-[#0a0a0a]" />
                <p className="mt-2 font-medium text-[14px] text-[#0a0a0a]">Pauta & Prazos</p>
                <p className="text-[12px] text-[#6b6b6b] mt-0.5">Audiências e diligências</p>
              </Link>
              <Link
                href="/documentos"
                className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-4 hover:bg-[#ebf5ed] transition-colors"
              >
                <FileText className="h-4 w-4 text-[#0a0a0a]" />
                <p className="mt-2 font-medium text-[14px] text-[#0a0a0a]">Minutas Oficiais</p>
                <p className="text-[12px] text-[#6b6b6b] mt-0.5">Procurações e Contratos</p>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. Grade de Áreas de Atuação com Superfícies Pastel & CSS 3D Tilt (design-system.md + react-3d-motion) */}
        <section id="atuacao" className="py-[80px] px-4 sm:px-6 border-b border-[#0a0a0a]">
          <div className="mx-auto max-w-[1200px]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <p className="editorial-kicker">Especialidades Reais do Escritório</p>
                <h2 className="editorial-heading text-[32px] sm:text-[44px] text-[#0a0a0a] mt-2">
                  Áreas de Atuação Jurídica
                </h2>
              </div>
              <p className="max-w-md text-[14px] text-[#6b6b6b]">
                Cada área abaixo está integrada ao cadastro de processos, geração de minutas e
                relatórios analíticos do sistema.
              </p>
            </div>

            <motion.div
              variants={stagger(0.08)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {FIRM_DATA.areasAtuacao.map((area, idx) => {
                const surfaceType =
                  idx % 3 === 0 ? "verdigris" : idx % 3 === 1 ? "slate" : "parchment";
                return (
                  <motion.div key={area.codigo} variants={fadeUp}>
                    <TiltCard surface={surfaceType} className="flex flex-col justify-between">
                      <div>
                        <span className="inline-block rounded-[2px] border border-[#0a0a0a] bg-[#fefefc] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#0a0a0a]">
                          {area.esfera}
                        </span>
                        <h3 className="editorial-heading text-[26px] text-[#0a0a0a] mt-4">
                          {area.titulo}
                        </h3>
                        <p className="mt-3 text-[14px] text-[#444444] leading-relaxed">
                          {area.descricao}
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-[#0a0a0a]/20 flex items-center justify-between text-[12px]">
                        <span className="font-medium text-[#0a0a0a]">MFV Advocacia · Sousa/PB</span>
                        <Link
                          href={`/processos/novo?area=${encodeURIComponent(area.titulo)}`}
                          className="underline hover:opacity-75"
                        >
                          Autuar nesta área →
                        </Link>
                      </div>
                    </TiltCard>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* 5. Sócios-Fundadores com FlipCard 3D (Frente & Verso de Credenciais OAB/PB) */}
        <section id="socios" className="py-[80px] px-4 sm:px-6 border-b border-[#0a0a0a]">
          <div className="mx-auto max-w-[1200px]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <p className="editorial-kicker">Corpo Diretivo · Inscrições Oficiais OAB/PB</p>
                <h2 className="editorial-heading text-[32px] sm:text-[44px] text-[#0a0a0a] mt-2">
                  Sócios-Fundadores da Banca
                </h2>
              </div>
              <p className="text-[13px] text-[#6b6b6b]">
                Clique em qualquer cartão para girar (3D Flip) e inspecionar as credenciais e áreas de
                coordenação.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {FIRM_DATA.sociosFundadores.map((socio) => (
                <FlipCard
                  key={socio.id}
                  front={
                    <div className="flex h-full flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="editorial-kicker">{socio.cargo}</span>
                          <span className="rounded-[2px] border border-[#0a0a0a] bg-[#ebf5ed] px-2.5 py-1 text-[11px] font-mono font-medium">
                            {socio.oab}
                          </span>
                        </div>
                        <h3 className="editorial-heading text-[30px] text-[#0a0a0a] mt-4">
                          {socio.nome}
                        </h3>
                        <p className="mt-3 text-[14px] text-[#6b6b6b] leading-relaxed">
                          {socio.atuacaoInstitucional}
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-[#0a0a0a]/20 flex items-center justify-between text-[12px] text-[#444444]">
                        <span>{socio.email}</span>
                        <span className="underline">Virar cartão para áreas de foco ↻</span>
                      </div>
                    </div>
                  }
                  back={
                    <div className="flex h-full flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="editorial-kicker text-[#0a0a0a]">
                            Áreas Sob Coordenação Direta
                          </span>
                          <span className="font-mono text-[11px] font-medium">{socio.oab}</span>
                        </div>
                        <p className="font-serif text-[22px] text-[#0a0a0a] mt-2">
                          {socio.nomeCurto}
                        </p>
                        <ul className="mt-4 space-y-2 text-[13px] text-[#0a0a0a]">
                          {socio.areasFoco.map((foco) => (
                            <li key={foco} className="flex items-center gap-2">
                              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                              <span>{foco}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#0a0a0a]/25 flex items-center justify-between text-[12px]">
                        <span>Tel: {socio.telefone}</span>
                        <span className="underline">Voltar para frente ↺</span>
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        </section>

        {/* 6. Seção Assimétrica 55/45 — Jurisdição Forense em Sousa/PB (design-system.md Two-Column Text+Image Feature) */}
        <section id="jurisdicao" className="py-[80px] px-4 sm:px-6 border-b border-[#0a0a0a]">
          <div className="mx-auto max-w-[1200px] grid gap-12 lg:grid-cols-[1.2fr_1fr] items-start">
            {/* Painel Slate Mist de Preview Forense */}
            <div className="rounded-[8px] bg-[#bdd4f0] p-6 sm:p-8 border border-[#0a0a0a]">
              <div className="rounded-[8px] bg-[#fefefc] border border-[#0a0a0a] p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-[#0a0a0a] pb-4">
                  <div>
                    <p className="editorial-kicker">Mapa Forense Pré-Configurado</p>
                    <h3 className="editorial-heading text-[26px] text-[#0a0a0a] mt-1">
                      Unidades Judiciárias de Sousa – PB
                    </h3>
                  </div>
                  <Scale className="h-6 w-6 text-[#0a0a0a]" />
                </div>

                <div className="space-y-4">
                  {FIRM_DATA.orgaosJudiciariosSousa.map((orgao) => (
                    <div
                      key={orgao.sigla}
                      className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-[14px] text-[#0a0a0a]">{orgao.nome}</p>
                        <span className="rounded-[2px] bg-[#ebf5ed] border border-[#0a0a0a] px-2 py-0.5 text-[10px] uppercase">
                          {orgao.esfera}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[12px] text-[#6b6b6b]">{orgao.localizacao}</p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {orgao.varas.map((v) => (
                          <span
                            key={v}
                            className="rounded-[2px] border border-[#0a0a0a]/40 px-2 py-0.5 text-[11px] text-[#444444]"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna de Texto Editorial */}
            <div className="space-y-6 lg:pt-4">
              <p className="editorial-kicker">Arquitetura Sem Dados Fictícios</p>
              <h2 className="editorial-heading text-[32px] sm:text-[40px] text-[#0a0a0a]">
                Construído sobre os dados reais da advocacia sousense.
              </h2>
              <p className="text-[16px] text-[#6b6b6b] leading-relaxed">
                Todo o sistema foi parametrizado com as informações oficiais do escritório{" "}
                <strong className="text-[#0a0a0a] font-medium">
                  Melo Fernandes & Vasconcelos - Advogados Associados
                </strong>{" "}
                e com a estrutura judiciária real da cidade de Sousa – PB (TJPB, TRT da 13ª Região e
                Justiça Federal da 5ª Região).
              </p>

              <div className="rounded-[8px] border border-[#0a0a0a] bg-[#ebf5ed] p-5 space-y-2.5 text-[13px]">
                <div className="flex items-start gap-2.5">
                  <Building2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Razão Social:</strong> {FIRM_DATA.razaoSocial} (CNPJ {FIRM_DATA.cnpj})
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Sede:</strong> {FIRM_DATA.endereco.completo}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Contatos:</strong> {FIRM_DATA.contatos.telefonePrincipal} ·{" "}
                    {FIRM_DATA.contatos.telefoneSecundario} · {FIRM_DATA.contatos.emailGeral}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link href="/dashboard" className="btn-ink">
                  Entrar no Painel de Gestão
                </Link>
                <Link href="/documentos" className="btn-ghost-outline">
                  Gerar Procuração / Contrato
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Fechamento Editorial a 88px (design-system.md: ending with a full-bleed closing statement at 88px serif) */}
        <section className="py-[80px] px-4 sm:px-6 bg-[#fefefc]">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="editorial-kicker mb-4">Sistema Web Integrado · MFV Advocacia</p>
            <h2 className="editorial-display text-[44px] sm:text-[68px] lg:text-[88px] text-[#0a0a0a] max-w-4xl mx-auto">
              Ordem processual e clareza editorial.
            </h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-ink">
                Acessar Painel Executivo
              </Link>
              <Link href="/clientes/novo" className="btn-ghost-outline">
                Cadastrar Primeiro Cliente
              </Link>
            </div>
          </div>
        </section>

        {/* Cookie / LGPD Consent Card (design-system.md Cookie Banner component) */}
        {!lgpdAccepted && (
          <aside
            aria-label="Aviso de privacidade e sigilo profissional"
            className="fixed bottom-5 right-5 z-50 max-w-sm rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-4"
          >
            <p className="text-[13px] text-[#0a0a0a] leading-snug">
              <strong>Sigilo Advocatício & LGPD:</strong> Este sistema opera localmente sob controle de
              acesso baseado em papéis (RBAC) para proteção dos dados de clientes e processos da{" "}
              {FIRM_DATA.nomeFantasia}.
            </p>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setLgpdAccepted(true);
                  try {
                    localStorage.setItem("mfv_lgpd_consent", "1");
                  } catch {
                    // ignore
                  }
                }}
                className="btn-ink py-1.5 px-4 text-[12px]"
              >
                Okay
              </button>
            </div>
          </aside>
        )}
      </div>
    </MotionConfig>
  );
}
