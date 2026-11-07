"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useFirm } from "@/components/layout/firm-context";
import { formatDateTimeBR } from "@/lib/utils";

const CANAIS = [
  { id: "GERAL", nome: "# Geral — Banca MFV Advocacia", desc: "Avisos gerais e pauta diária da sede em Sousa/PB" },
  { id: "SOCIETARIO", nome: "# Assessoria Empresarial & Societário", desc: "Demandas consultivas e contratos empresariais" },
  { id: "CONTENCIOSO", nome: "# Contencioso — TJPB / TRT-13 / TRF-5", desc: "Prazos fatais, audiências e diligências forenses" },
];

interface ChatMsg {
  id: string;
  canal: string;
  conteudo: string;
  autorNome: string;
  autorOab: string | null;
  createdAt: string;
  process?: { id: string; numeroCnj: string; titulo: string } | null;
}

export default function ChatPage() {
  const { activeProfile } = useFirm();
  const [canalAtivo, setCanalAtivo] = useState("GERAL");
  const [mensagens, setMensagens] = useState<ChatMsg[]>([]);
  const [processos, setProcessos] = useState<{ id: string; numeroCnj: string; titulo: string }[]>([]);
  const [processId, setProcessId] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(true);

  const carregarMensagens = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/chat?canal=${canalAtivo}`);
      const data = await res.json();
      if (Array.isArray(data)) setMensagens(data);
    } finally {
      setLoading(false);
    }
  }, [canalAtivo]);

  useEffect(() => {
    carregarMensagens();
  }, [carregarMensagens]);

  useEffect(() => {
    fetch("/api/processos")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setProcessos(d);
      });
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conteudo.trim()) return;
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        canal: canalAtivo,
        conteudo,
        processId: processId || null,
        autorNome: activeProfile.name,
        autorOab: activeProfile.oab,
      }),
    });
    if (res.ok) {
      setConteudo("");
      setProcessId("");
      carregarMensagens();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/chat?id=${id}`, { method: "DELETE" });
    carregarMensagens();
  };

  return (
    <AppShell
      kicker="Módulo 05 · Comunicação Interna & Despachos"
      title="Mural de Comunicação da Banca"
      subtitle="Troca rápida de despachos internos entre os sócios e a coordenação administrativa da MFV Advocacia."
    >
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Canais */}
        <aside className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-4 space-y-2 h-fit">
          <p className="editorial-kicker px-2 py-1">Canais Internos</p>
          {CANAIS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCanalAtivo(c.id)}
              className={`w-full text-left rounded-[2px] p-3 transition-colors border ${
                canalAtivo === c.id
                  ? "border-[#0a0a0a] bg-[#ebf5ed]"
                  : "border-transparent hover:bg-[#ebf5ed]/40"
              }`}
            >
              <p className="text-[13px] font-medium text-[#0a0a0a]">{c.nome}</p>
              <p className="text-[11px] text-[#6b6b6b] mt-0.5">{c.desc}</p>
            </button>
          ))}
        </aside>

        {/* Área de Mensagens */}
        <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 flex flex-col justify-between min-h-[520px]">
          <div>
            <div className="border-b border-[#0a0a0a] pb-3 flex items-center justify-between">
              <h2 className="editorial-heading text-[24px] text-[#0a0a0a]">
                {CANAIS.find((c) => c.id === canalAtivo)?.nome}
              </h2>
              <span className="text-[11px] text-[#6b6b6b]">
                Conectado como <strong>{activeProfile.name}</strong>
              </span>
            </div>

            <div className="my-6 space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {loading ? (
                <p className="text-[13px] text-[#6b6b6b]">Carregando despachos...</p>
              ) : mensagens.length === 0 ? (
                <div className="rounded-[8px] border border-dashed border-[#0a0a0a]/40 bg-[#ebf5ed]/30 p-8 text-center">
                  <MessageSquare className="mx-auto h-6 w-6 text-[#0a0a0a]" />
                  <p className="mt-2 font-medium text-[14px] text-[#0a0a0a]">
                    Nenhuma mensagem publicada neste canal ainda
                  </p>
                  <p className="mt-1 text-[12px] text-[#6b6b6b]">
                    Envie uma mensagem abaixo para registrar orientações internas entre os membros da
                    MFV Advocacia.
                  </p>
                </div>
              ) : (
                mensagens.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-[8px] border border-[#0a0a0a] bg-[#ebf5ed]/45 p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#6b6b6b]">
                      <span>
                        <strong className="text-[#0a0a0a]">{m.autorNome}</strong>{" "}
                        {m.autorOab ? `(${m.autorOab})` : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{formatDateTimeBR(m.createdAt)}</span>
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          aria-label="Remover mensagem"
                          className="text-[#6b6b6b] hover:text-[#0a0a0a]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-[14px] text-[#0a0a0a] leading-relaxed">{m.conteudo}</p>
                    {m.process && (
                      <Link
                        href={`/processos/${m.process.id}`}
                        className="inline-block rounded-[2px] border border-[#0a0a0a] bg-[#fefefc] px-2 py-0.5 text-[11px] font-mono"
                      >
                        Ref. Autos nº {m.process.numeroCnj} — {m.process.titulo}
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleSend} className="border-t border-[#0a0a0a] pt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-[240px_1fr]">
              <select
                value={processId}
                onChange={(e) => setProcessId(e.target.value)}
                aria-label="Vincular mensagem a um processo"
                className="input-editorial"
              >
                <option value="">Sem processo vinculado</option>
                {processos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.numeroCnj} — {p.titulo}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Escreva um despacho ou comunicado interno..."
                  className="input-editorial flex-1"
                />
                <button type="submit" className="btn-ink shrink-0">
                  <Send className="h-4 w-4" />
                  <span>Enviar</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
