"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, Gavel, Plus, Search, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useFirm } from "@/components/layout/firm-context";
import { FIRM_DATA } from "@/lib/firm-data";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";

interface ProcessListItem {
  id: string;
  numeroCnj: string;
  titulo: string;
  area: string;
  orgaoJulgador: string;
  vara: string;
  comarca: string;
  poloAtivo: string;
  poloPassivo: string;
  fase: string;
  status: string;
  prioridade: string;
  valorCausa: number;
  proximoPrazo: string | null;
  client: { id: string; nome: string; documento: string };
  advogado: { id: string; name: string; oab: string | null };
  _count: {
    movimentacoes: number;
    documentos: number;
    mensagens: number;
  };
}

export default function ProcessosPage() {
  const { activeProfile } = useFirm();
  const [processos, setProcessos] = useState<ProcessListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState("");

  const carregarProcessos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (area) params.set("area", area);
      if (status) params.set("status", status);
      const res = await fetch(`/api/processos?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setProcessos(data);
    } finally {
      setLoading(false);
    }
  }, [q, area, status]);

  useEffect(() => {
    carregarProcessos();
  }, [carregarProcessos]);

  const handleDelete = async (id: string, cnj: string) => {
    if (!window.confirm(`Confirma a exclusão do processo ${cnj}?`)) return;
    const res = await fetch(`/api/processos/${id}`, { method: "DELETE" });
    if (res.ok) carregarProcessos();
  };

  return (
    <AppShell
      kicker="Módulo 02 · Controle Processual & Prazos (CNJ)"
      title="Acervo de Processos"
      subtitle="Acompanhamento de demandas judiciais e administrativas na Comarca de Sousa (TJPB), Vara do Trabalho (TRT-13), Justiça Federal (TRF-5) e Tribunais Superiores."
      actions={
        <Link href="/processos/novo" className="btn-ink">
          <Plus className="h-4 w-4" />
          <span>Autuar Novo Processo</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Filtros */}
        <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-4 grid gap-4 md:grid-cols-[1fr_240px_180px]">
          <div className="relative">
            <Search className="h-4 w-4 text-[#6b6b6b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por número CNJ, título da ação, cliente ou parte contrária..."
              className="input-editorial pl-10"
            />
          </div>

          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            aria-label="Filtrar por área de atuação"
            className="input-editorial"
          >
            <option value="">Todas as Áreas do Direito</option>
            {FIRM_DATA.areasAtuacao.map((a) => (
              <option key={a.codigo} value={a.titulo}>
                {a.titulo}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filtrar por status processual"
            className="input-editorial"
          >
            <option value="">Todos os Status</option>
            <option value="ATIVO">Ativo</option>
            <option value="URGENTE">Urgente / Tutela</option>
            <option value="SUSPENSO">Suspenso</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="ARQUIVADO">Arquivado</option>
          </select>
        </div>

        {/* Lista de Processos */}
        <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[13px] text-[#6b6b6b]">
              Carregando acervo processual...
            </div>
          ) : processos.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Gavel className="mx-auto h-8 w-8 text-[#0a0a0a]" />
              <h3 className="editorial-heading text-[26px] text-[#0a0a0a]">
                Nenhum processo localizado
              </h3>
              <p className="mx-auto max-w-md text-[13px] text-[#6b6b6b]">
                Autue processos reais vinculados aos clientes da <strong>MFV Advocacia</strong> para
                controlar movimentações, prazos fatais e documentos.
              </p>
              <div className="pt-2">
                <Link href="/processos/novo" className="btn-ink">
                  Autuar Primeiro Processo
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#0a0a0a]/15">
              {processos.map((proc) => (
                <article
                  key={proc.id}
                  className="p-5 hover:bg-[#ebf5ed]/35 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[13px] font-medium text-[#0a0a0a]">
                        {proc.numeroCnj}
                      </span>
                      <span
                        className={`rounded-[2px] border border-[#0a0a0a] px-2 py-0.5 text-[10px] font-medium uppercase ${
                          proc.status === "URGENTE" ? "bg-[#bdd4f0]" : "bg-[#ebf5ed]"
                        }`}
                      >
                        {proc.status}
                      </span>
                      <span className="rounded-[2px] border border-[#0a0a0a]/40 px-2 py-0.5 text-[10px] uppercase text-[#444444]">
                        Fase: {proc.fase}
                      </span>
                      <span className="text-[11px] text-[#6b6b6b]">· {proc.area}</span>
                    </div>

                    <Link
                      href={`/processos/${proc.id}`}
                      className="block editorial-heading text-[24px] text-[#0a0a0a] hover:underline"
                    >
                      {proc.titulo}
                    </Link>

                    <p className="text-[13px] text-[#444444]">
                      <strong>Órgão Julgador:</strong> {proc.orgaoJulgador} ({proc.vara}) ·{" "}
                      <strong>Partes:</strong> {proc.poloAtivo} × {proc.poloPassivo}
                    </p>

                    <p className="text-[12px] text-[#6b6b6b]">
                      Constituinte:{" "}
                      <Link
                        href={`/clientes/${proc.client.id}`}
                        className="text-[#0a0a0a] font-medium underline"
                      >
                        {proc.client.nome}
                      </Link>{" "}
                      · Responsável: <strong className="text-[#0a0a0a]">{proc.advogado.name}</strong>{" "}
                      ({proc.advogado.oab})
                    </p>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#0a0a0a]/15">
                    <div className="lg:text-right">
                      <p className="text-[14px] font-medium text-[#0a0a0a]">
                        {formatCurrencyBRL(proc.valorCausa)}
                      </p>
                      <p className="text-[11px] text-[#6b6b6b] flex items-center lg:justify-end gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        Próximo prazo: <strong>{formatDateBR(proc.proximoPrazo)}</strong>
                      </p>
                      <p className="text-[11px] text-[#6b6b6b] mt-0.5">
                        {proc._count.movimentacoes} andamentos · {proc._count.documentos} peças
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/processos/${proc.id}`}
                        className="btn-ink py-1.5 px-3.5 text-[12px]"
                      >
                        <span>Timeline & Autos</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      {activeProfile.role !== "ASSISTENTE" && (
                        <button
                          type="button"
                          onClick={() => handleDelete(proc.id, proc.numeroCnj)}
                          aria-label={`Excluir processo ${proc.numeroCnj}`}
                          className="rounded-[2px] border border-[#0a0a0a] p-2 hover:bg-[#0a0a0a] hover:text-[#fefefc]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
