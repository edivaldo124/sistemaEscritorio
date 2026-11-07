"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, CheckCircle2, ExternalLink, MapPin, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { formatDateTimeBR } from "@/lib/utils";

const LOCAIS_FORENSES_SOUSA = [
  "Fórum Dr. José Mariz — Comarca de Sousa/PB (TJPB)",
  "Fórum José Facundo — Rua José Facundo de Lira, 30, Gato Preto, Sousa/PB (Vara do Trabalho TRT-13)",
  "Fórum Des. Fed. Paulo de Tarso B. Gadelha — Rua Francisco Vieira da Costa, 20, Maria Rachel, Sousa/PB (TRF-5)",
  "Sede MFV Advocacia — Rua Lafayette Pires Ferreira, 35, Centro, Sousa/PB",
  "Videoconferência PJe / Balcão Virtual",
];

interface AgendaEvent {
  id: string;
  titulo: string;
  tipo: string;
  descricao: string | null;
  dataInicio: string;
  local: string;
  status: string;
  process?: { id: string; numeroCnj: string; titulo: string } | null;
  client?: { id: string; nome: string } | null;
  user?: { id: string; name: string; oab: string | null } | null;
}

export default function AgendaPage() {
  const [eventos, setEventos] = useState<AgendaEvent[]>([]);
  const [processos, setProcessos] = useState<{ id: string; numeroCnj: string; titulo: string }[]>([]);
  const [usuarios, setUsuarios] = useState<{ id: string; name: string; oab: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("AUDIENCIA");
  const [dataInicio, setDataInicio] = useState("");
  const [local, setLocal] = useState(LOCAIS_FORENSES_SOUSA[0]);
  const [processId, setProcessId] = useState("");
  const [userId, setUserId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const carregarAgenda = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroStatus) params.set("status", filtroStatus);
      const res = await fetch(`/api/agenda?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setEventos(data);
    } finally {
      setLoading(false);
    }
  }, [filtroStatus]);

  useEffect(() => {
    carregarAgenda();
    Promise.all([
      fetch("/api/processos").then((r) => r.json()),
      fetch("/api/usuarios").then((r) => r.json()),
    ]).then(([procData, usrData]) => {
      if (Array.isArray(procData)) setProcessos(procData);
      if (Array.isArray(usrData)) {
        setUsuarios(usrData);
        if (usrData.length > 0) setUserId(usrData[0].id);
      }
    });
  }, [carregarAgenda]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !dataInicio) return;
    setSaving(true);
    try {
      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          tipo,
          dataInicio,
          local,
          processId: processId || null,
          userId: userId || null,
          descricao,
        }),
      });
      if (res.ok) {
        setTitulo("");
        setDataInicio("");
        setDescricao("");
        carregarAgenda();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConcluir = async (id: string, atual: string) => {
    await fetch("/api/agenda", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: atual === "CONCLUIDO" ? "PENDENTE" : "CONCLUIDO",
      }),
    });
    carregarAgenda();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/agenda?id=${id}`, { method: "DELETE" });
    carregarAgenda();
  };

  const gerarGoogleCalendarUrl = (ev: AgendaEvent) => {
    const start = new Date(ev.dataInicio);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `[MFV Advocacia] ${ev.titulo}`,
      dates: `${fmt(start)}/${fmt(end)}`,
      details: ev.descricao || "Compromisso jurídico agendado no sistema MFV Advocacia (Sousa - PB).",
      location: ev.local,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <AppShell
      kicker="Módulo 03 · Pauta Forense & Compromissos"
      title="Agenda de Audiências e Prazos"
      subtitle="Controle de audiências, sustentações orais, reuniões e prazos fatais nos fóruns de Sousa – PB e videoconferências PJe."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.45fr]">
        {/* Formulário de Novo Compromisso */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 space-y-4 h-fit"
        >
          <h2 className="editorial-heading text-[24px] text-[#0a0a0a] border-b border-[#0a0a0a] pb-3">
            Agendar Audiência ou Prazo
          </h2>

          <div>
            <label htmlFor="ag-tipo" className="block text-[12px] font-medium mb-1">
              Tipo de Compromisso *
            </label>
            <select
              id="ag-tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="input-editorial"
            >
              <option value="AUDIENCIA">Audiência Judicial (Conciliação / Instrução)</option>
              <option value="PRAZO_FATAL">Prazo Processual Fatal</option>
              <option value="REUNIAO_CLIENTE">Atendimento / Reunião na Sede (Sousa/PB)</option>
              <option value="SESSAO_JULGAMENTO">Sessão de Julgamento / Sustentação Oral</option>
              <option value="DILIGENCIA">Diligência Externa / Cartório / INSS</option>
            </select>
          </div>

          <div>
            <label htmlFor="ag-titulo" className="block text-[12px] font-medium mb-1">
              Descrição / Título na Pauta *
            </label>
            <input
              id="ag-titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Audiência de Instrução — 2ª Vara Mista de Sousa"
              className="input-editorial"
              required
            />
          </div>

          <div>
            <label htmlFor="ag-data" className="block text-[12px] font-medium mb-1">
              Data e Horário *
            </label>
            <input
              id="ag-data"
              type="datetime-local"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="input-editorial font-mono"
              required
            />
          </div>

          <div>
            <label htmlFor="ag-local" className="block text-[12px] font-medium mb-1">
              Local / Fórum em Sousa – PB *
            </label>
            <select
              id="ag-local"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              className="input-editorial"
            >
              {LOCAIS_FORENSES_SOUSA.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ag-proc" className="block text-[12px] font-medium mb-1">
              Vincular a Processo (Opcional)
            </label>
            <select
              id="ag-proc"
              value={processId}
              onChange={(e) => setProcessId(e.target.value)}
              className="input-editorial"
            >
              <option value="">Sem vínculo processual específico</option>
              {processos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.numeroCnj} — {p.titulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ag-adv" className="block text-[12px] font-medium mb-1">
              Membro Responsável
            </label>
            <select
              id="ag-adv"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="input-editorial"
            >
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.oab ? `(${u.oab})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ag-obs" className="block text-[12px] font-medium mb-1">
              Pauta / Documentos Necessários
            </label>
            <textarea
              id="ag-obs"
              rows={2}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Link da sala virtual PJe ou orientações para testemunhas..."
              className="input-editorial"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-ink w-full">
            <Plus className="h-4 w-4" />
            <span>{saving ? "Registrando..." : "Incluir na Pauta da Banca"}</span>
          </button>
        </form>

        {/* Lista da Pauta */}
        <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0a0a0a] pb-4">
            <div>
              <p className="editorial-kicker">Compromissos Agendados</p>
              <h2 className="editorial-heading text-[26px] text-[#0a0a0a] mt-1">
                Calendário Forense ({eventos.length})
              </h2>
            </div>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              aria-label="Filtrar compromissos por status"
              className="input-editorial w-auto py-1.5 text-[12px]"
            >
              <option value="">Todos os Status</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="CONCLUIDO">Concluídos</option>
            </select>
          </div>

          {loading ? (
            <p className="py-12 text-center text-[13px] text-[#6b6b6b]">Carregando agenda...</p>
          ) : eventos.length === 0 ? (
            <div className="my-6 rounded-[8px] border border-dashed border-[#0a0a0a]/50 bg-[#ebf5ed]/35 p-8 text-center">
              <Calendar className="mx-auto h-7 w-7 text-[#0a0a0a]" />
              <p className="mt-3 font-medium text-[15px] text-[#0a0a0a]">
                Nenhum evento agendado na pauta
              </p>
              <p className="mt-1 text-[13px] text-[#6b6b6b]">
                Utilize o formulário ao lado para agendar audiências nos fóruns de Sousa – PB ou
                registre prazos diretamente nos processos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {eventos.map((ev) => (
                <div
                  key={ev.id}
                  className={`rounded-[8px] border border-[#0a0a0a] p-4 space-y-2 ${
                    ev.status === "CONCLUIDO" ? "bg-[#ebf5ed]/50 opacity-80" : "bg-[#fefefc]"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-[2px] border border-[#0a0a0a] bg-[#bdd4f0] px-2 py-0.5 text-[10px] font-medium uppercase">
                        {ev.tipo.replace("_", " ")}
                      </span>
                      <span className="rounded-[2px] border border-[#0a0a0a]/40 px-2 py-0.5 text-[10px] uppercase">
                        {ev.status}
                      </span>
                    </div>
                    <span className="font-mono text-[12px] font-medium text-[#0a0a0a]">
                      {formatDateTimeBR(ev.dataInicio)}
                    </span>
                  </div>

                  <h3 className="font-medium text-[16px] text-[#0a0a0a]">{ev.titulo}</h3>

                  <p className="text-[12px] text-[#444444] flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{ev.local}</span>
                  </p>

                  {ev.descricao && <p className="text-[12px] text-[#6b6b6b]">{ev.descricao}</p>}

                  <div className="pt-2 border-t border-[#0a0a0a]/15 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="space-x-3">
                      {ev.user && (
                        <span>
                          Responsável: <strong>{ev.user.name}</strong>
                        </span>
                      )}
                      {ev.process && (
                        <Link href={`/processos/${ev.process.id}`} className="underline">
                          Autos nº {ev.process.numeroCnj}
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={gerarGoogleCalendarUrl(ev)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-[2px] border border-[#0a0a0a] px-2 py-1 hover:bg-[#ebf5ed]"
                      >
                        <span>Google Calendar</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleConcluir(ev.id, ev.status)}
                        className="inline-flex items-center gap-1 rounded-[2px] border border-[#0a0a0a] bg-[#ebf5ed] px-2.5 py-1 font-medium"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{ev.status === "CONCLUIDO" ? "Reabrir" : "Concluir"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ev.id)}
                        aria-label="Excluir compromisso"
                        className="rounded-[2px] border border-[#0a0a0a] p-1 hover:bg-[#0a0a0a] hover:text-[#fefefc]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
