"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, FileCheck2, FileText, Printer, Save, Trash2, Upload } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useFirm } from "@/components/layout/firm-context";
import { DOCUMENT_TEMPLATES, FIRM_DATA } from "@/lib/firm-data";
import { formatDateBR, formatDateExtensoBR } from "@/lib/utils";

interface ClientOption {
  id: string;
  nome: string;
  documento: string;
  rgOuIe: string | null;
  estadoCivil: string | null;
  profissaoOuRamo: string | null;
  endereco: string | null;
  cidade: string;
  uf: string;
}

interface ProcessOption {
  id: string;
  numeroCnj: string;
  titulo: string;
  orgaoJulgador: string;
  vara: string;
  clientId: string;
}

interface StoredDocument {
  id: string;
  titulo: string;
  categoria: string;
  versao: number;
  nomeArquivo: string;
  tamanhoBytes: number;
  conteudoTexto: string | null;
  autorNome: string;
  createdAt: string;
  client?: { id: string; nome: string; documento: string } | null;
  process?: { id: string; numeroCnj: string; titulo: string } | null;
}

function DocumentosWorkspace() {
  const searchParams = useSearchParams();
  const { activeProfile } = useFirm();

  const initialClientId = searchParams.get("clientId") || "";
  const initialProcessId = searchParams.get("processId") || "";

  const [clientes, setClientes] = useState<ClientOption[]>([]);
  const [processos, setProcessos] = useState<ProcessOption[]>([]);
  const [documentos, setDocumentos] = useState<StoredDocument[]>([]);

  const [selectedTemplateId, setSelectedTemplateId] = useState(DOCUMENT_TEMPLATES[0].id);
  const [selectedClientId, setSelectedClientId] = useState(initialClientId);
  const [selectedProcessId, setSelectedProcessId] = useState(initialProcessId);
  const [valorHonorarios, setValorHonorarios] = useState("20% sobre o proveito econômico obtido");
  const [tituloDoc, setTituloDoc] = useState(DOCUMENT_TEMPLATES[0].titulo);
  const [conteudoTexto, setConteudoTexto] = useState("");
  const [saving, setSaving] = useState(false);

  const carregarDados = useCallback(async () => {
    const [cliRes, procRes, docRes] = await Promise.all([
      fetch("/api/clientes").then((r) => r.json()),
      fetch("/api/processos").then((r) => r.json()),
      fetch("/api/documentos").then((r) => r.json()),
    ]);
    if (Array.isArray(cliRes)) {
      setClientes(cliRes);
      if (!selectedClientId && cliRes.length > 0) setSelectedClientId(cliRes[0].id);
    }
    if (Array.isArray(procRes)) setProcessos(procRes);
    if (Array.isArray(docRes)) setDocumentos(docRes);
  }, [selectedClientId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Preenchimento automático da minuta selecionada com os dados reais da MFV Advocacia + Cliente + Processo
  useEffect(() => {
    const template =
      DOCUMENT_TEMPLATES.find((t) => t.id === selectedTemplateId) || DOCUMENT_TEMPLATES[0];
    const cli = clientes.find((c) => c.id === selectedClientId);
    const proc = processos.find((p) => p.id === selectedProcessId);

    setTituloDoc(
      `${template.titulo}${cli ? ` — ${cli.nome}` : ""}`
    );

    const texto = template.gerarConteudo({
      clienteNome: cli?.nome || "[NOME DO OUTORGANTE / CONTRATANTE]",
      clienteDocumento: cli?.documento || "[CPF/CNPJ DO CLIENTE]",
      clienteRgOuIe: cli?.rgOuIe || undefined,
      clienteEstadoCivil: cli?.estadoCivil || undefined,
      clienteProfissao: cli?.profissaoOuRamo || undefined,
      clienteEndereco: cli?.endereco || "endereço declarado nos autos",
      clienteCidadeUf: cli ? `${cli.cidade} – ${cli.uf}` : "Sousa – PB",
      processoNumero: proc?.numeroCnj,
      processoOrgao: proc ? `${proc.orgaoJulgador} (${proc.vara})` : "Comarca de Sousa – PB",
      processoObjeto: proc?.titulo,
      valorHonorarios,
      dataExtenso: formatDateExtensoBR(new Date()),
    });

    setConteudoTexto(texto);
  }, [selectedTemplateId, selectedClientId, selectedProcessId, valorHonorarios, clientes, processos]);

  const handleSaveDocument = async () => {
    if (!tituloDoc.trim() || !conteudoTexto.trim()) return;
    setSaving(true);
    try {
      const template =
        DOCUMENT_TEMPLATES.find((t) => t.id === selectedTemplateId) || DOCUMENT_TEMPLATES[0];
      const nomeArquivo = `${tituloDoc
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}.txt`;

      const res = await fetch("/api/documentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: tituloDoc,
          categoria: template.categoria,
          nomeArquivo,
          conteudoTexto,
          clientId: selectedClientId || null,
          processId: selectedProcessId || null,
          autorNome: activeProfile.name,
        }),
      });
      if (res.ok) {
        carregarDados();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text().catch(() => "");
    setTituloDoc(file.name.replace(/\.[^.]+$/, ""));
    if (text) setConteudoTexto(text);

    await fetch("/api/documentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: file.name.replace(/\.[^.]+$/, ""),
        categoria: "OUTRO",
        nomeArquivo: file.name,
        tamanhoBytes: file.size,
        mimeType: file.type || "application/octet-stream",
        conteudoTexto: text || `Arquivo anexado: ${file.name} (${file.size} bytes)`,
        clientId: selectedClientId || null,
        processId: selectedProcessId || null,
        autorNome: activeProfile.name,
      }),
    });
    carregarDados();
  };

  const handleDownloadTxt = (titulo: string, conteudo: string) => {
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/documentos?id=${id}`, { method: "DELETE" });
    carregarDados();
  };

  return (
    <div className="space-y-8">
      {/* 1. Gerador Automático de Minutas Oficiais da MFV Advocacia */}
      <div className="grid gap-8 lg:grid-cols-[1fr_1.35fr]">
        <div className="no-print rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 space-y-4 h-fit">
          <div className="border-b border-[#0a0a0a] pb-3">
            <p className="editorial-kicker">Preenchimento Automático Verificado</p>
            <h2 className="editorial-heading text-[26px] text-[#0a0a0a] mt-1">
              Parametrizar Minuta Oficial
            </h2>
          </div>

          <div>
            <label htmlFor="doc-template" className="block text-[12px] font-medium mb-1">
              Modelo de Documento (MFV Advocacia)
            </label>
            <select
              id="doc-template"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="input-editorial"
            >
              {DOCUMENT_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.titulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="doc-cli" className="block text-[12px] font-medium mb-1">
              Cliente Outorgante / Contratante
            </label>
            <select
              id="doc-cli"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="input-editorial"
            >
              <option value="">Preenchimento manual em branco</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.documento})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="doc-proc" className="block text-[12px] font-medium mb-1">
              Processo Vinculado (Opcional)
            </label>
            <select
              id="doc-proc"
              value={selectedProcessId}
              onChange={(e) => setSelectedProcessId(e.target.value)}
              className="input-editorial"
            >
              <option value="">Foro Geral — Comarca de Sousa/PB</option>
              {processos
                .filter((p) => !selectedClientId || p.clientId === selectedClientId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.numeroCnj} — {p.titulo}
                  </option>
                ))}
            </select>
          </div>

          {selectedTemplateId === "contrato-honorarios" && (
            <div>
              <label htmlFor="doc-hon" className="block text-[12px] font-medium mb-1">
                Cláusula de Honorários Pactuados
              </label>
              <input
                id="doc-hon"
                type="text"
                value={valorHonorarios}
                onChange={(e) => setValorHonorarios(e.target.value)}
                className="input-editorial"
              />
            </div>
          )}

          <div>
            <label htmlFor="doc-titulo" className="block text-[12px] font-medium mb-1">
              Título para Arquivamento e Versionamento
            </label>
            <input
              id="doc-titulo"
              type="text"
              value={tituloDoc}
              onChange={(e) => setTituloDoc(e.target.value)}
              className="input-editorial"
            />
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={handleSaveDocument}
              disabled={saving}
              className="btn-ink w-full"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Arquivando versão..." : "Salvar e Versionar no Repositório"}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDownloadTxt(tituloDoc, conteudoTexto)}
                className="btn-ghost-outline py-2 px-3 text-[12px]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Baixar .TXT</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-ghost-outline py-2 px-3 text-[12px]"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Imprimir / PDF</span>
              </button>
            </div>

            <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-dashed border-[#0a0a0a] bg-[#ebf5ed]/50 p-3 text-[12px] font-medium hover:bg-[#ebf5ed]">
              <Upload className="h-4 w-4" />
              <span>Anexar Peça / Arquivo Externo do Computador</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Folha de Papel Timbrado MFV Advocacia (Preview & Edição Ao Vivo) */}
        <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 sm:p-10 space-y-6">
          <div className="border-b-2 border-[#0a0a0a] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h3 className="editorial-heading text-[28px] text-[#0a0a0a]">
                {FIRM_DATA.nomeFantasia}
              </h3>
              <p className="text-[12px] text-[#444444]">{FIRM_DATA.razaoSocial}</p>
              <p className="font-mono text-[11px] text-[#6b6b6b]">
                CNPJ {FIRM_DATA.cnpj} · OAB/PB 19.571 · OAB/PB 19.503
              </p>
            </div>
            <div className="text-[11px] text-[#6b6b6b] sm:text-right">
              <p>{FIRM_DATA.endereco.logradouro}</p>
              <p>
                {FIRM_DATA.endereco.bairro}, {FIRM_DATA.endereco.cidade} – {FIRM_DATA.endereco.uf} · CEP{" "}
                {FIRM_DATA.endereco.cep}
              </p>
              <p>{FIRM_DATA.contatos.emailGeral}</p>
            </div>
          </div>

          <textarea
            aria-label="Editor da minuta jurídica"
            value={conteudoTexto}
            onChange={(e) => setConteudoTexto(e.target.value)}
            rows={22}
            className="w-full bg-transparent font-serif text-[15px] leading-relaxed text-[#0a0a0a] outline-none resize-y"
          />
        </div>
      </div>

      {/* 2. Repositório de Documentos Arquivados com Controle de Versão */}
      <div className="no-print rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6">
        <div className="flex items-center justify-between border-b border-[#0a0a0a] pb-4">
          <div>
            <p className="editorial-kicker">Acervo Documental com Controle de Versão</p>
            <h2 className="editorial-heading text-[26px] text-[#0a0a0a] mt-1">
              Documentos Arquivados ({documentos.length})
            </h2>
          </div>
        </div>

        {documentos.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-[#6b6b6b]">
            <FileText className="mx-auto h-7 w-7 text-[#0a0a0a] mb-2" />
            Nenhum documento salvo no repositório ainda. Clique em{" "}
            <strong>&ldquo;Salvar e Versionar no Repositório&rdquo;</strong> acima para arquivar a
            primeira minuta.
          </div>
        ) : (
          <div className="divide-y divide-[#0a0a0a]/15 mt-2">
            {documentos.map((doc) => (
              <div
                key={doc.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-[2px] border border-[#0a0a0a] bg-[#ebf5ed] px-2 py-0.5 text-[10px] font-medium uppercase">
                      {doc.categoria}
                    </span>
                    <span className="rounded-[2px] border border-[#0a0a0a] bg-[#bdd4f0] px-2 py-0.5 text-[10px] font-mono">
                      Versão v{doc.versao}
                    </span>
                    <span className="text-[11px] text-[#6b6b6b]">
                      {formatDateBR(doc.createdAt)} · por {doc.autorNome}
                    </span>
                  </div>
                  <p className="font-medium text-[15px] text-[#0a0a0a] mt-1">{doc.titulo}</p>
                  <p className="text-[12px] text-[#6b6b6b]">
                    {doc.client ? `Cliente: ${doc.client.nome}` : "Documento Institucional"}{" "}
                    {doc.process ? `· Autos nº ${doc.process.numeroCnj}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {doc.conteudoTexto && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setTituloDoc(doc.titulo);
                          setConteudoTexto(doc.conteudoTexto || "");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="rounded-[2px] border border-[#0a0a0a] px-3 py-1.5 text-[12px] hover:bg-[#ebf5ed]"
                      >
                        <FileCheck2 className="inline h-3.5 w-3.5 mr-1" />
                        Carregar no Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadTxt(doc.titulo, doc.conteudoTexto || "")}
                        className="rounded-[2px] border border-[#0a0a0a] px-3 py-1.5 text-[12px] hover:bg-[#bdd4f0]/50"
                      >
                        <Download className="inline h-3.5 w-3.5 mr-1" />
                        Baixar
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    aria-label="Excluir documento"
                    className="rounded-[2px] border border-[#0a0a0a] p-1.5 hover:bg-[#0a0a0a] hover:text-[#fefefc]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocumentosPage() {
  return (
    <AppShell
      kicker="Módulo 04 · Minutas Oficiais, Peças & Versionamento"
      title="Gerador de Documentos e Contratos"
      subtitle="Modelos jurídicos oficiais timbrados com os dados reais de Melo Fernandes & Vasconcelos - Advogados Associados (Sousa – PB)."
    >
      <Suspense fallback={<div className="p-8 text-[13px] text-[#6b6b6b]">Carregando editor...</div>}>
        <DocumentosWorkspace />
      </Suspense>
    </AppShell>
  );
}
