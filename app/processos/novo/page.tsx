"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useAnimationControls } from "framer-motion";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { FIRM_DATA } from "@/lib/firm-data";
import { shake } from "@/lib/motion";
import { maskCnj, maskCpfCnpj, maskPhoneBR } from "@/lib/utils";

interface SimpleClient {
  id: string;
  nome: string;
  documento: string;
}

interface SimpleUser {
  id: string;
  name: string;
  oab: string | null;
  role: string;
}

function NovoProcessoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const controls = useAnimationControls();

  const preselectedClientId = searchParams.get("clientId") || "";
  const preselectedArea = searchParams.get("area") || FIRM_DATA.areasAtuacao[0].titulo;

  const [clientes, setClientes] = useState<SimpleClient[]>([]);
  const [advogados, setAdvogados] = useState<SimpleUser[]>([]);

  const [numeroCnj, setNumeroCnj] = useState("");
  const [titulo, setTitulo] = useState("");
  const [area, setArea] = useState(preselectedArea);
  const [orgaoIndex, setOrgaoIndex] = useState(0);
  const [vara, setVara] = useState(FIRM_DATA.orgaosJudiciariosSousa[0].varas[0]);
  const [comarca, setComarca] = useState("Sousa - PB");
  const [poloAtivo, setPoloAtivo] = useState("");
  const [poloPassivo, setPoloPassivo] = useState("");
  const [fase, setFase] = useState("CONHECIMENTO");
  const [status, setStatus] = useState("ATIVO");
  const [prioridade, setPrioridade] = useState("NORMAL");
  const [valorCausa, setValorCausa] = useState("0");
  const [proximoPrazo, setProximoPrazo] = useState("");
  const [descricaoObjeto, setDescricaoObjeto] = useState("");
  const [clientId, setClientId] = useState(preselectedClientId);
  const [advogadoId, setAdvogadoId] = useState("");

  // Modal rápido de novo cliente caso não haja cliente cadastrado
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [quickNome, setQuickNome] = useState("");
  const [quickDoc, setQuickDoc] = useState("");
  const [quickTel, setQuickTel] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/clientes").then((r) => r.json()), fetch("/api/usuarios").then((r) => r.json())]).then(
      ([cliData, usrData]) => {
        if (Array.isArray(cliData)) {
          setClientes(cliData);
          if (!preselectedClientId && cliData.length > 0) {
            setClientId(cliData[0].id);
            setPoloAtivo(cliData[0].nome);
          } else if (preselectedClientId) {
            const found = cliData.find((c: SimpleClient) => c.id === preselectedClientId);
            if (found) setPoloAtivo(found.nome);
          }
        }
        if (Array.isArray(usrData)) {
          const lawyers = usrData.filter((u: SimpleUser) => u.oab);
          setAdvogados(lawyers.length > 0 ? lawyers : usrData);
          if (lawyers.length > 0) setAdvogadoId(lawyers[0].id);
        }
      }
    );
  }, [preselectedClientId]);

  const handleOrgaoChange = (idx: number) => {
    setOrgaoIndex(idx);
    const selectedOrgao = FIRM_DATA.orgaosJudiciariosSousa[idx];
    if (selectedOrgao && selectedOrgao.varas.length > 0) {
      setVara(selectedOrgao.varas[0]);
    }
  };

  const handleCreateQuickClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNome.trim() || !quickDoc.trim() || !quickTel.trim()) return;
    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: quickNome,
        tipoPessoa: quickDoc.replace(/\D/g, "").length > 11 ? "PJ" : "PF",
        documento: quickDoc,
        telefone: quickTel,
        cidade: "Sousa",
        uf: "PB",
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setClientes((prev) => [created, ...prev]);
      setClientId(created.id);
      setPoloAtivo(created.nome);
      setQuickClientOpen(false);
      setQuickNome("");
      setQuickDoc("");
      setQuickTel("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clientId) {
      setError("Selecione ou cadastre o cliente constituinte antes de autuar o processo.");
      controls.start(shake);
      return;
    }

    if (!numeroCnj.trim() || !titulo.trim() || !poloAtivo.trim() || !poloPassivo.trim()) {
      setError("Preencha o Número CNJ/Protocolo, Título da Ação, Polo Ativo e Polo Passivo.");
      controls.start(shake);
      return;
    }

    setSubmitting(true);
    try {
      const orgaoJulgador = FIRM_DATA.orgaosJudiciariosSousa[orgaoIndex].sigla;
      const res = await fetch("/api/processos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroCnj,
          titulo,
          area,
          orgaoJulgador,
          vara,
          comarca,
          poloAtivo,
          poloPassivo,
          fase,
          status,
          prioridade,
          valorCausa: Number(valorCausa || 0),
          proximoPrazo: proximoPrazo || null,
          descricaoObjeto,
          clientId,
          advogadoId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível autuar o processo.");
        controls.start(shake);
        return;
      }

      router.push(`/processos/${data.id}`);
    } catch {
      setError("Falha ao comunicar com o servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {quickClientOpen && (
        <form
          onSubmit={handleCreateQuickClient}
          className="rounded-[8px] border border-[#0a0a0a] bg-[#ebf5ed] p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="editorial-heading text-[22px] text-[#0a0a0a]">
              Cadastro Rápido de Cliente (Sousa - PB)
            </h3>
            <button
              type="button"
              onClick={() => setQuickClientOpen(false)}
              className="text-[12px] underline"
            >
              Fechar
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Nome ou Razão Social *"
              value={quickNome}
              onChange={(e) => setQuickNome(e.target.value)}
              className="input-editorial"
              required
            />
            <input
              type="text"
              placeholder="CPF ou CNPJ *"
              value={quickDoc}
              onChange={(e) => setQuickDoc(maskCpfCnpj(e.target.value))}
              className="input-editorial font-mono"
              required
            />
            <input
              type="text"
              placeholder="Telefone (83) *"
              value={quickTel}
              onChange={(e) => setQuickTel(maskPhoneBR(e.target.value))}
              className="input-editorial"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-ink py-1.5 px-4 text-[12px]">
              Salvar e Selecionar Cliente
            </button>
          </div>
        </form>
      )}

      <motion.form
        animate={controls}
        onSubmit={handleSubmit}
        noValidate
        className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 sm:p-8 space-y-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Cliente Constituinte */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="proc-cliente" className="text-[12px] font-medium text-[#0a0a0a]">
                Cliente Constituinte (MFV Advocacia) *
              </label>
              <button
                type="button"
                onClick={() => setQuickClientOpen(true)}
                className="inline-flex items-center gap-1 text-[12px] text-[#0a0a0a] underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Cadastrar novo cliente rapidamente
              </button>
            </div>
            <select
              id="proc-cliente"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                const found = clientes.find((c) => c.id === e.target.value);
                if (found && !poloAtivo) setPoloAtivo(found.nome);
              }}
              className="input-editorial"
              required
            >
              <option value="">Selecione um cliente cadastrado...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} — {c.documento}
                </option>
              ))}
            </select>
          </div>

          {/* Número CNJ */}
          <div>
            <label htmlFor="proc-cnj" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Número dos Autos (Padrão CNJ ou Protocolo) *
            </label>
            <input
              id="proc-cnj"
              type="text"
              value={numeroCnj}
              onChange={(e) => setNumeroCnj(maskCnj(e.target.value))}
              placeholder="0800000-00.2026.8.15.0370"
              className="input-editorial font-mono"
              required
            />
          </div>

          {/* Advogado Responsável */}
          <div>
            <label htmlFor="proc-adv" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Sócio / Advogado Responsável *
            </label>
            <select
              id="proc-adv"
              value={advogadoId}
              onChange={(e) => setAdvogadoId(e.target.value)}
              className="input-editorial"
              required
            >
              {advogados.map((adv) => (
                <option key={adv.id} value={adv.id}>
                  {adv.name} {adv.oab ? `(${adv.oab})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Título / Natureza da Ação */}
          <div className="sm:col-span-2">
            <label htmlFor="proc-titulo" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Título / Classe Judicial da Ação *
            </label>
            <input
              id="proc-titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Ação Ordinária de Revisão / Execução Contra a Fazenda Pública / Reclamação Trabalhista"
              className="input-editorial"
              required
            />
          </div>

          {/* Área do Direito */}
          <div>
            <label htmlFor="proc-area" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Área de Atuação *
            </label>
            <select
              id="proc-area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="input-editorial"
            >
              {FIRM_DATA.areasAtuacao.map((a) => (
                <option key={a.codigo} value={a.titulo}>
                  {a.titulo}
                </option>
              ))}
            </select>
          </div>

          {/* Órgão Julgador Real de Sousa-PB */}
          <div>
            <label htmlFor="proc-orgao" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Tribunal / Órgão Julgador (Sousa - PB) *
            </label>
            <select
              id="proc-orgao"
              value={orgaoIndex}
              onChange={(e) => handleOrgaoChange(Number(e.target.value))}
              className="input-editorial"
            >
              {FIRM_DATA.orgaosJudiciariosSousa.map((orgao, idx) => (
                <option key={orgao.sigla} value={idx}>
                  {orgao.sigla} ({orgao.esfera})
                </option>
              ))}
            </select>
          </div>

          {/* Vara */}
          <div>
            <label htmlFor="proc-vara" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Vara / Juízo Competente *
            </label>
            <select
              id="proc-vara"
              value={vara}
              onChange={(e) => setVara(e.target.value)}
              className="input-editorial"
            >
              {FIRM_DATA.orgaosJudiciariosSousa[orgaoIndex]?.varas.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Comarca */}
          <div>
            <label htmlFor="proc-comarca" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Comarca / Subseção
            </label>
            <input
              id="proc-comarca"
              type="text"
              value={comarca}
              onChange={(e) => setComarca(e.target.value)}
              className="input-editorial"
            />
          </div>

          {/* Partes */}
          <div>
            <label htmlFor="proc-ativo" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Polo Ativo (Autor / Exequente / Reclamante) *
            </label>
            <input
              id="proc-ativo"
              type="text"
              value={poloAtivo}
              onChange={(e) => setPoloAtivo(e.target.value)}
              className="input-editorial"
              required
            />
          </div>

          <div>
            <label htmlFor="proc-passivo" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Polo Passivo (Réu / Executado / Reclamado) *
            </label>
            <input
              id="proc-passivo"
              type="text"
              value={poloPassivo}
              onChange={(e) => setPoloPassivo(e.target.value)}
              placeholder="Ex.: Município de Sousa, INSS, União, Empresa X..."
              className="input-editorial"
              required
            />
          </div>

          {/* Fase, Status, Valor e Prazo */}
          <div>
            <label htmlFor="proc-fase" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Fase Processual
            </label>
            <select
              id="proc-fase"
              value={fase}
              onChange={(e) => setFase(e.target.value)}
              className="input-editorial"
            >
              <option value="CONHECIMENTO">Fase de Conhecimento</option>
              <option value="CUMPRIMENTO_DE_SENTENCA">Cumprimento de Sentença</option>
              <option value="EXECUCAO">Execução / RPV / Precatório</option>
              <option value="RECURSAL">Fase Recursal (2º Grau / Tribunais)</option>
              <option value="CONSULTIVO">Consultivo / Extrajudicial</option>
            </select>
          </div>

          <div>
            <label htmlFor="proc-status" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Status & Prioridade
            </label>
            <select
              id="proc-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                if (e.target.value === "URGENTE") setPrioridade("CRITICA");
              }}
              className="input-editorial"
            >
              <option value="ATIVO">Ativo — Tramitação Regular</option>
              <option value="URGENTE">Urgente — Tutela / Prazo Fatal</option>
              <option value="SUSPENSO">Suspenso / Sobrestado</option>
              <option value="CONCLUIDO">Concluído / Trânsito em Julgado</option>
            </select>
          </div>

          <div>
            <label htmlFor="proc-valor" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Valor da Causa / Proveito Econômico (R$)
            </label>
            <input
              id="proc-valor"
              type="number"
              step="0.01"
              min="0"
              value={valorCausa}
              onChange={(e) => setValorCausa(e.target.value)}
              className="input-editorial font-mono"
            />
          </div>

          <div>
            <label htmlFor="proc-prazo" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Próximo Prazo Fatal ou Audiência (Sincroniza com Agenda)
            </label>
            <input
              id="proc-prazo"
              type="datetime-local"
              value={proximoPrazo}
              onChange={(e) => setProximoPrazo(e.target.value)}
              className="input-editorial font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="proc-desc" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Objeto da Demanda e Estratégia Processual
            </label>
            <textarea
              id="proc-desc"
              rows={3}
              value={descricaoObjeto}
              onChange={(e) => setDescricaoObjeto(e.target.value)}
              placeholder="Síntese fática, pedidos principais e observações estratégicas da banca..."
              className="input-editorial"
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-[8px] border border-[#0a0a0a] bg-[#bdd4f0]/40 p-3 text-[13px] text-[#0a0a0a]"
          >
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0a0a0a]">
          <Link href="/processos" className="btn-ghost-outline">
            Cancelar
          </Link>
          <button type="submit" disabled={submitting} className="btn-ink">
            <Save className="h-4 w-4" />
            <span>{submitting ? "Autuando..." : "Confirmar Autuação do Processo"}</span>
          </button>
        </div>
      </motion.form>
    </div>
  );
}

export default function NovoProcessoPage() {
  return (
    <AppShell
      kicker="Autuação Processual · MFV Advocacia (Sousa - PB)"
      title="Registrar Novo Processo"
      subtitle="Vincule o constituinte, selecione o juízo competente em Sousa – PB (TJPB, TRT-13 ou TRF-5) e defina o primeiro prazo na timeline."
      actions={
        <Link href="/processos" className="btn-ghost-outline">
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar ao Acervo</span>
        </Link>
      }
    >
      <Suspense fallback={<div className="p-8 text-[13px] text-[#6b6b6b]">Carregando formulário...</div>}>
        <NovoProcessoForm />
      </Suspense>
    </AppShell>
  );
}
