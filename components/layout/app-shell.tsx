"use client";

import React, { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  Briefcase,
  Calendar,
  FileText,
  FolderKanban,
  Home,
  LayoutDashboard,
  LogIn,
  Menu,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { FIRM_DATA } from "@/lib/firm-data";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { INSTITUTIONAL_PROFILES, useFirm } from "@/components/layout/firm-context";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Painel Executivo", icon: LayoutDashboard, badge: "Geral" },
  { href: "/clientes", label: "Clientes", icon: Users, badge: "PF / PJ" },
  { href: "/processos", label: "Processos & Prazos", icon: Briefcase, badge: "CNJ" },
  { href: "/agenda", label: "Agenda & Audiências", icon: Calendar, badge: "Pauta" },
  { href: "/documentos", label: "Documentos & Minutas", icon: FileText, badge: "Modelos" },
  { href: "/relatorios", label: "Relatórios", icon: FolderKanban, badge: "CSV / PDF" },
  { href: "/chat", label: "Comunicação Interna", icon: MessageSquare, badge: "Banca" },
  { href: "/config", label: "Administração & RBAC", icon: Settings, badge: "Acesso" },
];

const QUICK_COMMANDS = [
  { label: "Cadastrar Novo Cliente (PF ou PJ)", href: "/clientes/novo", section: "Ações Rápidas" },
  { label: "Autuar Novo Processo Judicial / Administrativo", href: "/processos/novo", section: "Ações Rápidas" },
  { label: "Emitir Procuração Ad Judicia (MFV Advocacia)", href: "/documentos", section: "Minutas Oficiais" },
  { label: "Emitir Contrato de Honorários Advocatícios", href: "/documentos", section: "Minutas Oficiais" },
  { label: "Consultar Pauta de Audiências (Sousa - PB)", href: "/agenda", section: "Navegação" },
  { label: "Exportar Relatório Gerencial em CSV / PDF", href: "/relatorios", section: "Navegação" },
  { label: "Abrir Despachos & Comunicação Interna", href: "/chat", section: "Navegação" },
  { label: "Ver Página Institucional MFV Advocacia", href: "/", section: "Institucional" },
];

export function AppShell({
  children,
  title,
  kicker,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title: string;
  kicker?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeProfile, setActiveProfile, commandOpen, setCommandOpen } = useFirm();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCommands = QUICK_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#fefefc] text-[#0a0a0a] flex flex-col lg:flex-row">
        {/* Sidebar Desktop (Legora Editorial Hairline Architecture) */}
        <aside className="no-print hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 border-r border-[#0a0a0a] bg-[#fefefc] z-30">
          <div className="p-6 border-b border-[#0a0a0a]">
            <Link href="/" className="group block">
              <p className="editorial-kicker">Sousa · Paraíba · Brasil</p>
              <h2 className="editorial-heading text-[26px] text-[#0a0a0a] mt-1">
                {FIRM_DATA.nomeFantasia}
              </h2>
              <p className="text-[11px] text-[#6b6b6b] mt-1 leading-snug">
                {FIRM_DATA.razaoSocial}
              </p>
              <p className="text-[11px] font-mono text-[#444444] mt-1">
                CNPJ {FIRM_DATA.cnpj}
              </p>
            </Link>
          </div>

          {/* Seletor de Perfil RBAC Real da Banca */}
          <div className="px-5 py-4 border-b border-[#0a0a0a] bg-[#ebf5ed]/55">
            <div className="flex items-center justify-between">
              <span className="editorial-kicker flex items-center gap-1.5 text-[#0a0a0a]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Sessão Ativa (RBAC)
              </span>
              <span className="rounded-[2px] border border-[#0a0a0a] bg-[#fefefc] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                {activeProfile.role}
              </span>
            </div>
            <label htmlFor="rbac-profile-select" className="sr-only">
              Alternar perfil de acesso da banca
            </label>
            <select
              id="rbac-profile-select"
              value={activeProfile.email}
              onChange={(e) => {
                const next = INSTITUTIONAL_PROFILES.find((p) => p.email === e.target.value);
                if (next) setActiveProfile(next);
              }}
              className="mt-2 w-full rounded-[2px] border border-[#0a0a0a] bg-[#fefefc] px-2.5 py-1.5 text-[12px] font-medium text-[#0a0a0a] outline-none"
            >
              {INSTITUTIONAL_PROFILES.map((profile) => (
                <option key={profile.email} value={profile.email}>
                  {profile.name} {profile.oab ? `(${profile.oab})` : ""}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-[#444444]">
              {activeProfile.cargo} · {activeProfile.oab || activeProfile.email}
            </p>
          </div>

          {/* Navegação Principal com Indicador Deslizante (Motion layoutId) */}
          <nav aria-label="Menu do Sistema Jurídico" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center justify-between px-3 py-2.5 text-[13px] rounded-[2px] transition-colors",
                    isActive
                      ? "text-[#0a0a0a] font-medium"
                      : "text-[#444444] hover:text-[#0a0a0a] hover:bg-[#ebf5ed]/50"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      transition={spring}
                      className="absolute inset-0 rounded-[2px] bg-[#ebf5ed] border border-[#0a0a0a]"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  <span className="relative z-10 text-[10px] uppercase tracking-wider text-[#6b6b6b]">
                    {item.badge}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Rodapé Institucional Real */}
          <div className="p-4 border-t border-[#0a0a0a] space-y-2 text-[11px] text-[#6b6b6b]">
            <p className="text-[#0a0a0a] font-medium">{FIRM_DATA.endereco.logradouro}</p>
            <p>
              {FIRM_DATA.endereco.bairro}, {FIRM_DATA.endereco.cidade} – {FIRM_DATA.endereco.uf} · CEP{" "}
              {FIRM_DATA.endereco.cep}
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-[#0a0a0a]/20">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-[#0a0a0a] hover:underline"
              >
                <Home className="h-3.5 w-3.5" />
                Portal Institucional
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-[#0a0a0a] hover:underline"
              >
                <LogIn className="h-3.5 w-3.5" />
                Credenciais
              </Link>
            </div>
          </div>
        </aside>

        {/* Área Principal */}
        <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
          {/* Header Superior */}
          <header className="no-print sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-[#0a0a0a] bg-[#fefefc]/95 px-4 sm:px-8 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menu de navegação"
                className="lg:hidden rounded-[2px] border border-[#0a0a0a] p-2 text-[#0a0a0a]"
              >
                <Menu className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCommandOpen(true)}
                className="flex items-center gap-3 rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] px-3.5 py-1.5 text-[13px] text-[#6b6b6b] hover:bg-[#ebf5ed] transition-colors"
              >
                <Search className="h-3.5 w-3.5 text-[#0a0a0a]" />
                <span>Buscar módulo, minuta ou comando rápido...</span>
                <kbd className="hidden sm:inline-block rounded-[2px] border border-[#0a0a0a] bg-[#fefefc] px-1.5 py-0.5 text-[10px] font-mono text-[#0a0a0a]">
                  ⌘K
                </kbd>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-[12px] font-medium text-[#0a0a0a]">{activeProfile.name}</p>
                <p className="text-[11px] text-[#6b6b6b]">
                  {activeProfile.oab ? `${activeProfile.oab} · Subseção Sousa/PB` : activeProfile.cargo}
                </p>
              </div>
              <Link href="/processos/novo" className="btn-ink text-[12px] py-2 px-4">
                + Novo Processo
              </Link>
            </div>
          </header>

          {/* Cabeçalho Editorial da Página */}
          <div className="border-b border-[#0a0a0a] bg-[#fefefc] px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-[1200px] flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                {kicker && <p className="editorial-kicker mb-2">{kicker}</p>}
                <h1 className="editorial-heading text-[34px] sm:text-[44px] text-[#0a0a0a]">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 max-w-2xl text-[15px] text-[#6b6b6b] leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && <div className="no-print flex flex-wrap items-center gap-3">{actions}</div>}
            </div>
          </div>

          {/* Conteúdo */}
          <main className="flex-1 px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-[1200px]">{children}</div>
          </main>

          {/* Rodapé */}
          <footer className="no-print border-t border-[#0a0a0a] bg-[#fefefc] px-4 py-6 sm:px-8 text-[12px] text-[#6b6b6b]">
            <div className="mx-auto max-w-[1200px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p>
                <strong className="text-[#0a0a0a] font-medium">{FIRM_DATA.razaoSocial}</strong> · CNPJ{" "}
                {FIRM_DATA.cnpj}
              </p>
              <p>
                {FIRM_DATA.endereco.completo} · {FIRM_DATA.contatos.telefonePrincipal}
              </p>
            </div>
          </footer>
        </div>

        {/* Drawer Mobile */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={spring}
                className="fixed inset-y-0 left-0 z-50 w-72 border-r border-[#0a0a0a] bg-[#fefefc] p-5 flex flex-col lg:hidden"
              >
                <div className="flex items-center justify-between pb-4 border-b border-[#0a0a0a]">
                  <div>
                    <p className="editorial-kicker">Sousa · PB</p>
                    <p className="editorial-heading text-2xl">{FIRM_DATA.nomeFantasia}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Fechar menu"
                    className="rounded-[2px] border border-[#0a0a0a] p-1.5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-[2px] px-3 py-2.5 text-[13px] text-[#0a0a0a] hover:bg-[#ebf5ed]"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Command Palette (⌘K) */}
        <AnimatePresence>
          {commandOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCommandOpen(false)}
                className="fixed inset-0 z-50 bg-black/55"
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Paleta de comandos rápidos"
                initial={{ opacity: 0, scale: 0.96, y: -12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -12 }}
                transition={spring}
                className="fixed left-1/2 top-20 z-50 w-[92vw] max-w-lg -translate-x-1/2 rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-4"
              >
                <div className="flex items-center gap-2 border-b border-[#0a0a0a] pb-3">
                  <Search className="h-4 w-4 text-[#0a0a0a]" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Digite um comando, página ou minuta..."
                    className="w-full bg-transparent text-[13px] text-[#0a0a0a] outline-none placeholder:text-[#98a7aa]"
                  />
                  <button
                    type="button"
                    onClick={() => setCommandOpen(false)}
                    className="rounded-[2px] border border-[#0a0a0a] px-2 py-0.5 text-[11px]"
                  >
                    ESC
                  </button>
                </div>
                <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-[#0a0a0a]/15">
                  {filteredCommands.map((cmd) => (
                    <button
                      key={cmd.label}
                      type="button"
                      onClick={() => {
                        setCommandOpen(false);
                        setSearchQuery("");
                        router.push(cmd.href);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left text-[13px] hover:bg-[#ebf5ed] transition-colors"
                    >
                      <span className="font-medium text-[#0a0a0a]">{cmd.label}</span>
                      <span className="text-[10px] uppercase tracking-wider text-[#6b6b6b]">
                        {cmd.section}
                      </span>
                    </button>
                  ))}
                  {filteredCommands.length === 0 && (
                    <p className="py-6 text-center text-[13px] text-[#6b6b6b]">
                      Nenhum comando encontrado para &ldquo;{searchQuery}&rdquo;.
                    </p>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
