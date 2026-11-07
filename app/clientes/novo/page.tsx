"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useAnimationControls } from "framer-motion";
import { ArrowLeft, Check, Save } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { shake } from "@/lib/motion";
import { maskCpfCnpj, maskPhoneBR } from "@/lib/utils";

export default function NovoClientePage() {
  const router = useRouter();
  const controls = useAnimationControls();

  const [tipoPessoa, setTipoPessoa] = useState<"PF" | "PJ">("PF");
  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [rgOuIe, setRgOuIe] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("Sousa");
  const [uf, setUf] = useState("PB");
  const [cep, setCep] = useState("58800-000");
  const [profissaoOuRamo, setProfissaoOuRamo] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("Solteiro(a)");
  const [status, setStatus] = useState<"ATIVO" | "PROSPECTO" | "ARQUIVADO">("ATIVO");
  const [observacoes, setObservacoes] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nome.trim() || !documento.trim() || !telefone.trim()) {
      setError("Preencha obrigatoriamente o Nome/Razão Social, CPF/CNPJ e Telefone.");
      controls.start(shake);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          tipoPessoa,
          documento,
          rgOuIe,
          email,
          telefone,
          whatsapp,
          endereco,
          cidade,
          uf,
          cep,
          profissaoOuRamo,
          estadoCivil: tipoPessoa === "PF" ? estadoCivil : null,
          status,
          observacoes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Não foi possível salvar o cliente.");
        controls.start(shake);
        return;
      }

      router.push(`/clientes/${data.id}`);
    } catch {
      setError("Erro de conexão ao salvar o cadastro.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      kicker="Cadastro de Constituinte · MFV Advocacia"
      title="Novo Cliente (PF ou PJ)"
      subtitle="Os dados informados alimentam automaticamente a qualificação civil nas procurações, declarações e contratos de honorários do escritório."
      actions={
        <Link href="/clientes" className="btn-ghost-outline">
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Lista</span>
        </Link>
      }
    >
      <motion.form
        animate={controls}
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto max-w-3xl rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 sm:p-8 space-y-6"
      >
        {/* Seletor PF / PJ */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0a0a0a] pb-5">
          <div>
            <p className="editorial-kicker">Natureza Jurídica</p>
            <p className="text-[14px] text-[#0a0a0a] mt-1 font-medium">
              Selecione o tipo de constituinte:
            </p>
          </div>
          <div className="flex gap-2">
            {(["PF", "PJ"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipoPessoa(t)}
                className={`rounded-[2px] border border-[#0a0a0a] px-4 py-2 text-[12px] font-medium transition-colors ${
                  tipoPessoa === t
                    ? "bg-[#000000] text-[#fefefc]"
                    : "bg-[#fefefc] text-[#0a0a0a] hover:bg-[#ebf5ed]"
                }`}
              >
                {t === "PF" ? "Pessoa Física (CPF)" : "Pessoa Jurídica / Empresa (CNPJ)"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="cli-nome" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              {tipoPessoa === "PF" ? "Nome Completo *" : "Razão Social / Nome Empresarial *"}
            </label>
            <input
              id="cli-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={
                tipoPessoa === "PF"
                  ? "Informe o nome completo conforme documento oficial"
                  : "Informe a razão social completa da empresa"
              }
              className="input-editorial"
              required
            />
          </div>

          <div>
            <label htmlFor="cli-doc" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              {tipoPessoa === "PF" ? "CPF *" : "CNPJ *"}
            </label>
            <input
              id="cli-doc"
              type="text"
              value={documento}
              onChange={(e) => setDocumento(maskCpfCnpj(e.target.value))}
              placeholder={tipoPessoa === "PF" ? "000.000.000-00" : "00.000.000/0001-00"}
              className="input-editorial font-mono"
              required
            />
          </div>

          <div>
            <label htmlFor="cli-rg" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              {tipoPessoa === "PF" ? "RG / Órgão Expedidor" : "Inscrição Estadual / NIRE"}
            </label>
            <input
              id="cli-rg"
              type="text"
              value={rgOuIe}
              onChange={(e) => setRgOuIe(e.target.value)}
              placeholder={tipoPessoa === "PF" ? "Ex.: 0.000.000 SSP/PB" : "Opcional"}
              className="input-editorial"
            />
          </div>

          <div>
            <label htmlFor="cli-prof" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              {tipoPessoa === "PF" ? "Profissão / Ocupação" : "Ramo de Atividade Empresarial"}
            </label>
            <input
              id="cli-prof"
              type="text"
              value={profissaoOuRamo}
              onChange={(e) => setProfissaoOuRamo(e.target.value)}
              placeholder={
                tipoPessoa === "PF"
                  ? "Ex.: Servidor(a) Público(a), Agricultor(a), Empresário(a)"
                  : "Ex.: Comércio Varejista, Agronegócio, Saúde"
              }
              className="input-editorial"
            />
          </div>

          {tipoPessoa === "PF" ? (
            <div>
              <label htmlFor="cli-civil" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
                Estado Civil
              </label>
              <select
                id="cli-civil"
                value={estadoCivil}
                onChange={(e) => setEstadoCivil(e.target.value)}
                className="input-editorial"
              >
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="União Estável">União Estável</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="cli-status" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
                Status do Contrato
              </label>
              <select
                id="cli-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "ATIVO" | "PROSPECTO" | "ARQUIVADO")}
                className="input-editorial"
              >
                <option value="ATIVO">Ativo (Assessoria / Contencioso)</option>
                <option value="PROSPECTO">Prospecto / Consultivo Inicial</option>
                <option value="ARQUIVADO">Arquivado</option>
              </select>
            </div>
          )}

          <div>
            <label htmlFor="cli-tel" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Telefone Principal / WhatsApp *
            </label>
            <input
              id="cli-tel"
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(maskPhoneBR(e.target.value))}
              placeholder="(83) 99999-9999"
              className="input-editorial"
              required
            />
          </div>

          <div>
            <label htmlFor="cli-email" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              E-mail para Notificações
            </label>
            <input
              id="cli-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@email.com.br"
              className="input-editorial"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="cli-end" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Logradouro, Número e Bairro (Para qualificação na Procuração)
            </label>
            <input
              id="cli-end"
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, complemento e bairro"
              className="input-editorial"
            />
          </div>

          <div>
            <label htmlFor="cli-cidade" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Município / Comarca
            </label>
            <input
              id="cli-cidade"
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="input-editorial"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cli-uf" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
                UF
              </label>
              <input
                id="cli-uf"
                type="text"
                maxLength={2}
                value={uf}
                onChange={(e) => setUf(e.target.value.toUpperCase())}
                className="input-editorial uppercase"
              />
            </div>
            <div>
              <label htmlFor="cli-cep" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
                CEP
              </label>
              <input
                id="cli-cep"
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className="input-editorial font-mono"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="cli-obs" className="block text-[12px] font-medium text-[#0a0a0a] mb-1.5">
              Histórico / Resumo do Caso ou Demanda Consultiva
            </label>
            <textarea
              id="cli-obs"
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Anotações preliminares de atendimento na sede de Sousa/PB..."
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
          <Link href="/clientes" className="btn-ghost-outline">
            Cancelar
          </Link>
          <button type="submit" disabled={submitting} className="btn-ink">
            {submitting ? (
              <span>Salvando cadastro...</span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Concluir Cadastro do Cliente</span>
              </>
            )}
          </button>
        </div>
      </motion.form>
    </AppShell>
  );
}
