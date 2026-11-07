"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  Briefcase,
  Building2,
  Calendar,
  FileText,
  Gavel,
  Plus,
  Scale,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CountUp, TiltCard } from "@/components/ui/tilt-card";
import { FIRM_DATA } from "@/lib/firm-data";
import { fadeUp, stagger } from "@/lib/motion";
import { formatCurrencyBRL, formatDateBR, formatDateTimeBR } from "@/lib/utils";

interface ResumoData {
  kpis: {
    totalClientes: number;
    totalProcessos: number;
    processosAtivos: number;
    processosUrgentes: number;
    totalDocumentos: number;
    eventosPendentes: number;
    valorTotalCausas: number;
  };
  distribuicao: {
    porArea: { nome: string; total: number }[];
    porOrgao: { nome: string; total: number }[];
    porStatus: { nome: string; total: number }[];
  };
  processosRecentes: {
    id: string;
    numeroCnj: string;
    titulo: string;
    area: string;
    orgaoJulgador: string;
    vara: string;
    status: string;
    valorCausa: number;
    proximoPrazo: string | null;
    client: { id: string; nome: string; documento: string };
    advogado: { id: string; name: string; oab: string | null };
  }[];
  proximosEventos: {
    id: string;
    titulo: string;
    tipo: string;
    dataInicio: string;
    local: string;
    process?: { id: string; numeroCnj: string; titulo: string } | null;
    client?: { id: string; nome: string } | null;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<ResumoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/resumo")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  const kpis = data?.kpis ?? {
    totalClientes: 0,
    totalProcessos: 0,
    processosAtivos: 0,
    processosUrgentes: 0,
    totalDocumentos: 0,
    eventosPendentes: 0,
    valorTotalCausas: 0,
  };

  return (
    <AppShell
      kicker="Visão Executiva · Melo Fernandes & Vasconcelos (Sousa - PB)"
      title="Painel de Controle Jurídico"
      subtitle="Indicadores em tempo real da banca MFV Advocacia. Base íntegra sem dados fictícios: todos os números refletem os registros reais cadastrados no sistema."
      actions={
        <>
          <Link href="/clientes/novo" className="btn-ghost-outline">
            <Plus className="h-4 w-4" />
            <span>Novo Cliente</span>
          </Link>
          <Link href="/processos/novo" className="btn-ink">
            <Gavel className="h-4 w-4" />
            <span>Autuar Processo</span>
          </Link>
        </>
      }
    >
      <div className="space-y-10">
        {/* 1. KPIs com Tilt 3D & CountUp (react-3d-motion + frontend-react-motion) */}
        <motion.section
          variants={stagger(0.06)}
          initial="hidden"
          animate="show"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={fadeUp}>
            <TiltCard surface="parchment">
              <div className="flex items-center justify-between">
                <span className="editorial-kicker">Clientes Cadastrados</span>
                <Users className="h-4 w-4 text-[#0a0a0a]" />
              </div>
              <p className="editorial-heading text-[44px] text-[#0a0a0a] mt-3 tabular-nums">
                <CountUp to={kpis.totalClientes} />
              </p>
              <div className="mt-3 pt-3 border-t border-[#0a0a0a]/15 flex items-center justify-between text-[12px] text-[#6b6b6b]">
                <span>Pessoas Físicas e Jurídicas</span>
                <Link href="/clientes" className="text-[#0a0a0a] underline">
                  Ver lista →
                </Link>
              </div>
            </TiltCard>
          </motion.div>

          <motion.div variants={fadeUp}>
            <TiltCard surface="verdigris">
              <div className="flex items-center justify-between">
                <span className="editorial-kicker text-[#0a0a0a]">Processos Ativos</span>
                <Briefcase className="h-4 w-4 text-[#0a0a0a]" />
              </div>
              <p className="editorial-heading text-[44px] text-[#0a0a0a] mt-3 tabular-nums">
                <CountUp to={kpis.processosAtivos} />
              </p>
              <div className="mt-3 pt-3 border-t border-[#0a0a0a]/15 flex items-center justify-between text-[12px] text-[#444444]">
                <span>Total autuado: {kpis.totalProcessos}</span>
                <Link href="/processos" className="text-[#0a0a0a] underline">
                  Abrir autos →
                </Link>
              </div>
            </TiltCard>
          </motion.div>

          <motion.div variants={fadeUp}>
            <TiltCard surface="slate">
              <div className="flex items-center justify-between">
                <span className="editorial-kicker text-[#0a0a0a]">Pauta & Prazos</span>
                <Calendar className="h-4 w-4 text-[#0a0a0a]" />
              </div>
              <p className="editorial-heading text-[44px] text-[#0a0a0a] mt-3 tabular-nums">
                <CountUp to={kpis.eventosPendentes} />
              </p>
              <div className="mt-3 pt-3 border-t border-[#0a0a0a]/15 flex items-center justify-between text-[12px] text-[#444444]">
                <span>Urgentes/Críticos: {kpis.processosUrgentes}</span>
                <Link href="/agenda" className="text-[#0a0a0a] underline">
                  Ver pauta →
                </Link>
              </div>
            </TiltCard>
          </motion.div>

          <motion.div variants={fadeUp}>
            <TiltCard surface="parchment">
              <div className="flex items-center justify-between">
                <span className="editorial-kicker">Valor Sob Patrocínio</span>
                <Scale className="h-4 w-4 text-[#0a0a0a]" />
              </div>
              <p className="editorial-heading text-[32px] text-[#0a0a0a] mt-4 tabular-nums">
                {formatCurrencyBRL(kpis.valorTotalCausas)}
              </p>
              <div className="mt-3 pt-3 border-t border-[#0a0a0a]/15 flex items-center justify-between text-[12px] text-[#6b6b6b]">
                <span>Documentos: {kpis.totalDocumentos}</span>
                <Link href="/relatorios" className="text-[#0a0a0a] underline">
                  Relatórios →
                </Link>
              </div>
            </TiltCard>
          </motion.div>
        </motion.section>

        {/* 2. Grade Principal: Processos Recentes & Próximos Compromissos Forenses */}
        <section className="grid gap-8 lg:grid-cols-[1.45fr_1fr]">
          {/* Coluna Esquerda: Processos */}
          <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6">
            <div className="flex items-center justify-between border-b border-[#0a0a0a] pb-4">
              <div>
                <p className="editorial-kicker">Acervo Contencioso & Consultivo</p>
                <h2 className="editorial-heading text-[26px] text-[#0a0a0a] mt-1">
                  Processos Movimentados Recentemente
                </h2>
              </div>
              <Link href="/processos" className="btn-ghost-outline py-1.5 px-3 text-[12px]">
                Ver Todos
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-[13px] text-[#6b6b6b]">
                Consultando base de dados local...
              </div>
            ) : data?.processosRecentes && data.processosRecentes.length > 0 ? (
              <div className="divide-y divide-[#0a0a0a]/15">
                {data.processosRecentes.map((proc) => (
                  <div
                    key={proc.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[12px] font-medium text-[#0a0a0a]">
                          {proc.numeroCnj}
                        </span>
                        <span className="rounded-[2px] border border-[#0a0a0a] bg-[#ebf5ed] px-2 py-0.5 text-[10px] uppercase">
                          {proc.status}
                        </span>
                        <span className="rounded-[2px] border border-[#0a0a0a]/40 px-2 py-0.5 text-[10px] text-[#444444]">
                          {proc.area}
                        </span>
                      </div>
                      <Link
                        href={`/processos/${proc.id}`}
                        className="mt-1.5 block font-medium text-[15px] text-[#0a0a0a] hover:underline"
                      >
                        {proc.titulo}
                      </Link>
                      <p className="text-[12px] text-[#6b6b6b] mt-0.5">
                        Cliente: <strong className="text-[#0a0a0a]">{proc.client.nome}</strong> ·{" "}
                        {proc.orgaoJulgador} ({proc.vara})
                      </p>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <p className="text-[12px] font-medium text-[#0a0a0a]">
                        {formatCurrencyBRL(proc.valorCausa)}
                      </p>
                      <p className="text-[11px] text-[#6b6b6b]">
                        Prazo: {formatDateBR(proc.proximoPrazo)}
                      </p>
                      <Link
                        href={`/processos/${proc.id}`}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#0a0a0a] underline"
                      >
                        Abrir autos <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="my-6 rounded-[8px] border border-dashed border-[#0a0a0a]/50 bg-[#ebf5ed]/35 p-8 text-center">
                <Gavel className="mx-auto h-7 w-7 text-[#0a0a0a]" />
                <h3 className="editorial-heading text-[24px] text-[#0a0a0a] mt-3">
                  Nenhum processo autuado até o momento
                </h3>
                <p className="mx-auto mt-2 max-w-md text-[13px] text-[#6b6b6b] leading-relaxed">
                  Seguindo a diretriz de integridade de dados, o sistema inicia sem processos
                  fictícios. Cadastre um cliente real e autue o primeiro processo da{" "}
                  <strong>MFV Advocacia</strong>.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Link href="/clientes/novo" className="btn-ghost-outline text-[12px]">
                    1. Cadastrar Cliente
                  </Link>
                  <Link href="/processos/novo" className="btn-ink text-[12px]">
                    2. Autuar Processo
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Coluna Direita: Agenda Forense & Prazos */}
          <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6">
            <div className="flex items-center justify-between border-b border-[#0a0a0a] pb-4">
              <div>
                <p className="editorial-kicker">Agenda Forense · Sousa/PB</p>
                <h2 className="editorial-heading text-[26px] text-[#0a0a0a] mt-1">
                  Próximos Prazos e Audiências
                </h2>
              </div>
              <Link href="/agenda" className="btn-ghost-outline py-1.5 px-3 text-[12px]">
                Agenda
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-[13px] text-[#6b6b6b]">
                Carregando compromissos...
              </div>
            ) : data?.proximosEventos && data.proximosEventos.length > 0 ? (
              <div className="divide-y divide-[#0a0a0a]/15">
                {data.proximosEventos.map((ev) => (
                  <div key={ev.id} className="py-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="rounded-[2px] border border-[#0a0a0a] bg-[#bdd4f0] px-2 py-0.5 text-[10px] font-medium uppercase">
                        {ev.tipo.replace("_", " ")}
                      </span>
                      <span className="font-mono text-[11px] text-[#0a0a0a]">
                        {formatDateTimeBR(ev.dataInicio)}
                      </span>
                    </div>
                    <p className="font-medium text-[14px] text-[#0a0a0a] pt-1">{ev.titulo}</p>
                    <p className="text-[12px] text-[#6b6b6b]">{ev.local}</p>
                    {ev.process && (
                      <Link
                        href={`/processos/${ev.process.id}`}
                        className="block text-[11px] text-[#0a0a0a] underline"
                      >
                        Autos nº {ev.process.numeroCnj}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="my-6 rounded-[8px] border border-dashed border-[#0a0a0a]/50 bg-[#bdd4f0]/25 p-6 text-center">
                <Calendar className="mx-auto h-6 w-6 text-[#0a0a0a]" />
                <p className="mt-2 font-medium text-[14px] text-[#0a0a0a]">
                  Sem audiências ou prazos pendentes na pauta
                </p>
                <p className="mt-1 text-[12px] text-[#6b6b6b]">
                  Agende audiências no Fórum de Sousa (TJPB), Vara do Trabalho (TRT-13) ou Vara
                  Federal (TRF-5).
                </p>
                <Link href="/agenda" className="mt-4 inline-flex btn-ink text-[12px] py-2 px-4">
                  Agendar Compromisso
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 3. Quadro Institucional Verificado do Escritório e Sócios (Sousa - PB) */}
        <section className="rounded-[8px] border border-[#0a0a0a] bg-[#ebf5ed] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div>
              <p className="editorial-kicker text-[#0a0a0a]">Registro Societário Oficial</p>
              <h3 className="editorial-heading text-[28px] text-[#0a0a0a] mt-1">
                {FIRM_DATA.razaoSocial}
              </h3>
              <p className="mt-2 text-[13px] text-[#444444]">
                <strong>Nome Fantasia:</strong> {FIRM_DATA.nomeFantasia}
                <br />
                <strong>CNPJ:</strong> {FIRM_DATA.cnpj}
                <br />
                <strong>Endereço:</strong> {FIRM_DATA.endereco.completo}
                <br />
                <strong>Contato:</strong> {FIRM_DATA.contatos.telefonePrincipal} ·{" "}
                {FIRM_DATA.contatos.emailGeral}
              </p>
            </div>

            {FIRM_DATA.sociosFundadores.map((socio) => (
              <div
                key={socio.id}
                className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="editorial-kicker">{socio.cargo}</span>
                    <span className="rounded-[2px] border border-[#0a0a0a] bg-[#ebf5ed] px-2 py-0.5 text-[11px] font-mono">
                      {socio.oab}
                    </span>
                  </div>
                  <p className="font-serif text-[22px] text-[#0a0a0a] mt-2">{socio.nome}</p>
                  <p className="mt-2 text-[12px] text-[#6b6b6b] leading-relaxed">
                    {socio.atuacaoInstitucional}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#0a0a0a]/15 flex items-center justify-between text-[12px]">
                  <span>{socio.email}</span>
                  <span>{socio.telefone}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
