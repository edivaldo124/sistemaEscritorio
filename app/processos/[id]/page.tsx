"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  MessageSquare,
  Plus,
  Send,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useFirm } from "@/components/layout/firm-context";
import { spring } from "@/lib/motion";
import { formatCurrencyBRL, formatDateBR, formatDateTimeBR } from "@/lib/utils";

interface ProcessDetail {
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
  descricaoObjeto: string | null;
  client: { id: string; nome: string; documento: string; telefone: string };
  advogado: { id: string; name: string; oab: string | null; email: string };
  movimentacoes: {
    id: string;
    tipo: string;
    titulo: string;
    descricao: string;
    dataOcorrencia: string;
    prazoFatal: string | null;
    concluido: boolean;
    responsavelNome: string;
  }[];
  documentos: {
    id: string;
    titulo: string;
    categoria: string;
    versao: number;
    nomeArquivo: string;
    createdAt: string;
  }[];
  mensagens: {
    id: string;
    conteudo: string;
    autorNome: string;
    autorOab: string | null;
    createdAt: string;
  }[];
}

const TABS = [
  { id: "timeline", label: "Timeline & Prazos" },
  { id: "detalhes", label: "Partes & Juízo" },
  { id: "documentos", label: "Peças & Documentos" },
  { id: "comentarios", label: "Despachos Internos" },
] as const;

export default function ProcessoDetalhePage() {
  const params = useParams<{ id: string }>();
  const { activeProfile } = useFirm();

  const [proc, setProc] = useState<ProcessDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("timeline");

  // Novo andamento/prazo
  const [movTipo, setMovTipo] = useState("ANDAMENTO");
  const [movTitulo, setMovTitulo] = useState("");
  const [movDesc, setMovDesc] = useState("");
  const [movPrazo, setMovPrazo] = useState("");
  const [savingMov, setSavingMov] = useState(false);

  // Novo comentário no processo
  const [comentario, setComentario] = useState("");

  const carregarProcesso = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/processos/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProc(data);
      }
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    carregarProcesso();
  }, [carregarProcesso]);

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movTitulo.trim() || !movDesc.trim()) return;
    setSavingMov(true);
    try {
      const res = await fetch(`/api/processos/${params.id}/movimentacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: movTipo,
          titulo: movTitulo,
          descricao: movDesc,
          prazoFatal: movPrazo || null,
          responsavelNome: activeProfile.name,
        }),
      });
      if (res.ok) {
        setMovTitulo("");
        setMovDesc("");
        setMovPrazo("");
        carregarProcesso();
      }
    } finally {
      setSavingMov(false);
    }
  };

  const handleToggleMovConcluido = async (movementId: string, concluido: boolean) => {
    await fetch(`/api/processos/${params.id}/movimentacoes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movementId, concluido: !concluido }),
    });
    carregarProcesso();
  };

  const handleStatusChange = async (newStatus: string) => {
    await fetch(`/api/processos/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    carregarProcesso();
  };

  const handleAddComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim()) return;
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        canal: "PROCESSO",
        processId: params.id,
        conteudo: comentario,
        autorNome: activeProfile.name,
        autorOab: activeProfile.oab,
      }),
    });
    if (res.ok) {
      setComentario("");
      carregarProcesso();
    }
  };

  if (loading) {
    return (
      <AppShell title="Autos Eletrônicos" kicker="Carregando processo...">
        <p className="text-[14px] text-[#6b6b6b]">Carregando informações e timeline do processo...</p>
      </AppShell>
    );
  }

  if (!proc) {
    return (
      <AppShell title="Processo não localizado" kicker="Erro 404">
        <Link href="/processos" className="btn-ink">
          Voltar para Acervo Processual
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell
      kicker={`${proc.orgaoJulgador} · ${proc.vara} · Autos nº ${proc.numeroCnj}`}
      title={proc.titulo}
      subtitle={`Constituinte: ${proc.client.nome} (${proc.client.documento}) · Advogado Responsável: ${proc.advogado.name} (${proc.advogado.oab || "MFV"})`}
      actions={
        <>
          <Link href="/processos" className="btn-ghost-outline">
            <ArrowLeft className="h-4 w-4" />
            <span>Acervo</span>
          </Link>
          <Link
            href={`/documentos?clientId=${proc.client.id}&processId=${proc.id}`}
            className="btn-ink"
          >
            <FileText className="h-4 w-4" />
            <span>Emitir Peça / Procuração nestes Autos</span>
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        {/* Faixa de Resumo Processual */}
        <div className="rounded-[8px] border border-[#0a0a0a] bg-[#ebf5ed] p-4 grid gap-4 sm:grid-cols-4 text-[13px]">
          <div>
            <p className="editorial-kicker text-[#0a0a0a]">Número CNJ / Protocolo</p>
            <p className="font-mono font-medium text-[14px] mt-1">{proc.numeroCnj}</p>
          </div>
          <div>
            <p className="editorial-kicker text-[#0a0a0a]">Partes da Demanda</p>
            <p className="font-medium mt-1">
              {proc.poloAtivo} × {proc.poloPassivo}
            </p>
          </div>
          <div>
            <p className="editorial-kicker text-[#0a0a0a]">Valor da Causa</p>
            <p className="font-medium text-[15px] mt-1">{formatCurrencyBRL(proc.valorCausa)}</p>
          </div>
          <div>
            <p className="editorial-kicker text-[#0a0a0a]">Status Processual</p>
            <select
              value={proc.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              aria-label="Status do processo"
              className="mt-1 w-full rounded-[2px] border border-[#0a0a0a] bg-[#fefefc] px-2.5 py-1 text-[12px] font-medium"
            >
              <option value="ATIVO">ATIVO</option>
              <option value="URGENTE">URGENTE</option>
              <option value="SUSPENSO">SUSPENSO</option>
              <option value="CONCLUIDO">CONCLUÍDO</option>
              <option value="ARQUIVADO">ARQUIVADO</option>
            </select>
          </div>
        </div>

        {/* Abas Deslizantes (Motion layoutId) */}
        <div className="flex flex-wrap gap-2 border-b border-[#0a0a0a] pb-3">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className="relative px-4 py-2 text-[13px] font-medium text-[#0a0a0a]"
              >
                {active && (
                  <motion.span
                    layoutId="process-tab-indicator"
                    transition={spring}
                    className="absolute inset-0 rounded-[2px] border border-[#0a0a0a] bg-[#bdd4f0]"
                  />
                )}
                <span className="relative z-10">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Conteúdo da Aba 1: Timeline de Movimentações & Prazos */}
        {activeTab === "timeline" && (
          <div className="grid gap-8 lg:grid-cols-[1fr_1.35fr]">
            {/* Formulário de Novo Andamento / Prazo */}
            <form
              onSubmit={handleAddMovement}
              className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 space-y-4 h-fit"
            >
              <h2 className="editorial-heading text-[24px] text-[#0a0a0a]">
                Registrar Movimentação ou Prazo
              </h2>
              <p className="text-[12px] text-[#6b6b6b]">
                Todo prazo fatal informado abaixo é automaticamente sincronizado na Agenda Forense da
                MFV Advocacia.
              </p>

              <div>
                <label htmlFor="mov-tipo" className="block text-[12px] font-medium mb-1">
                  Natureza do Evento
                </label>
                <select
                  id="mov-tipo"
                  value={movTipo}
                  onChange={(e) => setMovTipo(e.target.value)}
                  className="input-editorial"
                >
                  <option value="ANDAMENTO">Andamento Processual (PJe)</option>
                  <option value="PUBLICACAO_DJE">Publicação no DJe / Intimação</option>
                  <option value="PRAZO">Abertura de Prazo Fatal</option>
                  <option value="PETICAO">Protocolo de Petição / Recurso</option>
                  <option value="DECISAO">Decisão Interlocutória / Sentença</option>
                  <option value="AUDIENCIA">Designação de Audiência</option>
                </select>
              </div>

              <div>
                <label htmlFor="mov-titulo" className="block text-[12px] font-medium mb-1">
                  Título Resumido *
                </label>
                <input
                  id="mov-titulo"
                  type="text"
                  value={movTitulo}
                  onChange={(e) => setMovTitulo(e.target.value)}
                  placeholder="Ex.: Intimação para Réplica em 15 dias úteis"
                  className="input-editorial"
                  required
                />
              </div>

              <div>
                <label htmlFor="mov-prazo" className="block text-[12px] font-medium mb-1">
                  Data/Hora do Prazo Fatal ou Audiência (Opcional)
                </label>
                <input
                  id="mov-prazo"
                  type="datetime-local"
                  value={movPrazo}
                  onChange={(e) => setMovPrazo(e.target.value)}
                  className="input-editorial font-mono"
                />
              </div>

              <div>
                <label htmlFor="mov-desc" className="block text-[12px] font-medium mb-1">
                  Teor do Andamento / Providência *
                </label>
                <textarea
                  id="mov-desc"
                  rows={3}
                  value={movDesc}
                  onChange={(e) => setMovDesc(e.target.value)}
                  placeholder="Descreva o despacho judicial ou providência adotada pela banca..."
                  className="input-editorial"
                  required
                />
              </div>

              <button type="submit" disabled={savingMov} className="btn-ink w-full">
                <Plus className="h-4 w-4" />
                <span>{savingMov ? "Registrando..." : "Inserir na Timeline do Processo"}</span>
              </button>
            </form>

            {/* Linha do Tempo */}
            <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6">
              <h2 className="editorial-heading text-[24px] text-[#0a0a0a] border-b border-[#0a0a0a] pb-3">
                Linha do Tempo ({proc.movimentacoes.length})
              </h2>

              <ol className="relative mt-6 border-l border-[#0a0a0a] ml-3 space-y-6">
                {proc.movimentacoes.map((mov) => (
                  <li key={mov.id} className="ml-6">
                    <span
                      className={`absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full border border-[#0a0a0a] ${
                        mov.concluido ? "bg-[#ebf5ed]" : "bg-[#000000]"
                      }`}
                    />
                    <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-4 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-[2px] border border-[#0a0a0a] bg-[#ebf5ed] px-2 py-0.5 text-[10px] font-medium uppercase">
                          {mov.tipo.replace("_", " ")}
                        </span>
                        <span className="font-mono text-[11px] text-[#6b6b6b]">
                          {formatDateTimeBR(mov.dataOcorrencia)}
                        </span>
                      </div>
                      <h3 className="font-medium text-[15px] text-[#0a0a0a]">{mov.titulo}</h3>
                      <p className="text-[13px] text-[#444444] leading-relaxed">{mov.descricao}</p>

                      <div className="pt-2 border-t border-[#0a0a0a]/15 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="text-[#6b6b6b]">Responsável: {mov.responsavelNome}</span>
                        {mov.prazoFatal && (
                          <button
                            type="button"
                            onClick={() => handleToggleMovConcluido(mov.id, mov.concluido)}
                            className={`inline-flex items-center gap-1 rounded-[2px] border border-[#0a0a0a] px-2 py-0.5 font-medium ${
                              mov.concluido ? "bg-[#ebf5ed]" : "bg-[#bdd4f0]"
                            }`}
                          >
                            {mov.concluido ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" /> Prazo Cumprido (
                                {formatDateBR(mov.prazoFatal)})
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3" /> Prazo Fatal:{" "}
                                {formatDateBR(mov.prazoFatal)} (Marcar cumprido)
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 2: Detalhes e Partes */}
        {activeTab === "detalhes" && (
          <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 space-y-6">
            <h2 className="editorial-heading text-[26px] text-[#0a0a0a] border-b border-[#0a0a0a] pb-3">
              Dados Completos da Autuação
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 text-[13px]">
              <div className="space-y-2">
                <p>
                  <strong>Órgão Julgador:</strong> {proc.orgaoJulgador}
                </p>
                <p>
                  <strong>Vara / Juízo:</strong> {proc.vara}
                </p>
                <p>
                  <strong>Comarca / Jurisdição:</strong> {proc.comarca}
                </p>
                <p>
                  <strong>Área do Direito:</strong> {proc.area}
                </p>
                <p>
                  <strong>Fase Atual:</strong> {proc.fase}
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>Polo Ativo:</strong> {proc.poloAtivo}
                </p>
                <p>
                  <strong>Polo Passivo:</strong> {proc.poloPassivo}
                </p>
                <p>
                  <strong>Cliente Constituinte:</strong>{" "}
                  <Link href={`/clientes/${proc.client.id}`} className="underline">
                    {proc.client.nome} ({proc.client.documento})
                  </Link>
                </p>
                <p>
                  <strong>Advogado Responsável:</strong> {proc.advogado.name} ({proc.advogado.oab})
                </p>
              </div>
            </div>
            {proc.descricaoObjeto && (
              <div className="rounded-[8px] border border-[#0a0a0a] bg-[#ebf5ed] p-4">
                <p className="editorial-kicker text-[#0a0a0a] mb-1">Objeto & Síntese da Demanda</p>
                <p className="text-[13px] text-[#0a0a0a] leading-relaxed">{proc.descricaoObjeto}</p>
              </div>
            )}
          </div>
        )}

        {/* Conteúdo da Aba 3: Documentos vinculados */}
        {activeTab === "documentos" && (
          <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#0a0a0a] pb-3">
              <h2 className="editorial-heading text-[24px] text-[#0a0a0a]">
                Peças, Procurações e Contratos dos Autos ({proc.documentos.length})
              </h2>
              <Link
                href={`/documentos?clientId=${proc.client.id}&processId=${proc.id}`}
                className="btn-ink py-1.5 px-3 text-[12px]"
              >
                + Gerar ou Anexar Documento
              </Link>
            </div>
            {proc.documentos.length === 0 ? (
              <p className="py-6 text-[13px] text-[#6b6b6b]">
                Nenhuma peça vinculada a este processo ainda. Utilize o gerador de minutas oficiais
                da MFV Advocacia.
              </p>
            ) : (
              <ul className="divide-y divide-[#0a0a0a]/15 text-[13px]">
                {proc.documentos.map((doc) => (
                  <li key={doc.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#0a0a0a]">{doc.titulo}</p>
                      <p className="text-[11px] text-[#6b6b6b]">
                        {doc.categoria} · Versão v{doc.versao} · {doc.nomeArquivo}
                      </p>
                    </div>
                    <Link href="/documentos" className="text-[12px] underline">
                      Abrir no Repositório →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Conteúdo da Aba 4: Comentários e Despachos Internos */}
        {activeTab === "comentarios" && (
          <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 space-y-6">
            <h2 className="editorial-heading text-[24px] text-[#0a0a0a] border-b border-[#0a0a0a] pb-3">
              Despachos Internos da Banca sobre estes Autos
            </h2>

            <form onSubmit={handleAddComentario} className="flex gap-3">
              <input
                type="text"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder={`Registrar despacho interno como ${activeProfile.name}...`}
                className="input-editorial flex-1"
              />
              <button type="submit" className="btn-ink shrink-0">
                <Send className="h-4 w-4" />
                <span>Publicar</span>
              </button>
            </form>

            {proc.mensagens.length === 0 ? (
              <p className="text-[13px] text-[#6b6b6b]">
                Nenhum comentário interno registrado nestes autos.
              </p>
            ) : (
              <div className="space-y-3">
                {proc.mensagens.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-[8px] border border-[#0a0a0a] bg-[#ebf5ed]/50 p-4 text-[13px]"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#6b6b6b] mb-1">
                      <strong className="text-[#0a0a0a]">
                        {msg.autorNome} {msg.autorOab ? `(${msg.autorOab})` : ""}
                      </strong>
                      <span>{formatDateTimeBR(msg.createdAt)}</span>
                    </div>
                    <p className="text-[#0a0a0a]">{msg.conteudo}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
