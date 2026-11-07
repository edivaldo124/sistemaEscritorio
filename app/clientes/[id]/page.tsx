"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Briefcase, FileText, Gavel, MapPin, Phone, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";

interface ClientDetail {
  id: string;
  nome: string;
  tipoPessoa: string;
  documento: string;
  rgOuIe: string | null;
  email: string | null;
  telefone: string;
  endereco: string | null;
  cidade: string;
  uf: string;
  cep: string;
  profissaoOuRamo: string | null;
  estadoCivil: string | null;
  observacoes: string | null;
  status: string;
  createdAt: string;
  processos: {
    id: string;
    numeroCnj: string;
    titulo: string;
    area: string;
    orgaoJulgador: string;
    vara: string;
    status: string;
    valorCausa: number;
    proximoPrazo: string | null;
    advogado: { name: string; oab: string | null };
  }[];
  documentos: {
    id: string;
    titulo: string;
    categoria: string;
    versao: number;
    createdAt: string;
  }[];
}

export default function ClienteDetalhePage() {
  const params = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadClient = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clientes/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data);
      }
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  if (loading) {
    return (
      <AppShell title="Ficha Cadastral do Cliente" kicker="Consultando registro...">
        <p className="text-[14px] text-[#6b6b6b]">Carregando informações do constituinte...</p>
      </AppShell>
    );
  }

  if (!client) {
    return (
      <AppShell title="Cliente não localizado" kicker="Erro 404">
        <div className="rounded-[8px] border border-[#0a0a0a] p-6">
          <p className="text-[14px] text-[#6b6b6b]">O registro solicitado não foi encontrado.</p>
          <Link href="/clientes" className="mt-4 inline-flex btn-ink">
            Voltar para Clientes
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      kicker={`Ficha Cadastral · ${client.tipoPessoa === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}`}
      title={client.nome}
      subtitle={`Documento: ${client.documento} · Localidade: ${client.cidade} – ${client.uf}`}
      actions={
        <>
          <Link href="/clientes" className="btn-ghost-outline">
            <ArrowLeft className="h-4 w-4" />
            <span>Lista de Clientes</span>
          </Link>
          <Link href={`/documentos?clientId=${client.id}`} className="btn-ghost-outline">
            <FileText className="h-4 w-4" />
            <span>Emitir Procuração / Contrato</span>
          </Link>
          <Link href={`/processos/novo?clientId=${client.id}`} className="btn-ink">
            <Gavel className="h-4 w-4" />
            <span>Autuar Processo para este Cliente</span>
          </Link>
        </>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.45fr]">
        {/* Coluna Esquerda: Qualificação Completa */}
        <div className="space-y-6">
          <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#0a0a0a] pb-3">
              <h2 className="editorial-heading text-[24px] text-[#0a0a0a]">Qualificação Civil</h2>
              <span className="rounded-[2px] border border-[#0a0a0a] bg-[#ebf5ed] px-2.5 py-0.5 text-[11px] font-medium uppercase">
                {client.status}
              </span>
            </div>

            <dl className="space-y-2.5 text-[13px]">
              <div className="flex justify-between border-b border-[#0a0a0a]/10 pb-2">
                <dt className="text-[#6b6b6b]">CPF / CNPJ:</dt>
                <dd className="font-mono font-medium">{client.documento}</dd>
              </div>
              {client.rgOuIe && (
                <div className="flex justify-between border-b border-[#0a0a0a]/10 pb-2">
                  <dt className="text-[#6b6b6b]">RG / Inscrição Estadual:</dt>
                  <dd className="font-medium">{client.rgOuIe}</dd>
                </div>
              )}
              {client.estadoCivil && (
                <div className="flex justify-between border-b border-[#0a0a0a]/10 pb-2">
                  <dt className="text-[#6b6b6b]">Estado Civil:</dt>
                  <dd className="font-medium">{client.estadoCivil}</dd>
                </div>
              )}
              {client.profissaoOuRamo && (
                <div className="flex justify-between border-b border-[#0a0a0a]/10 pb-2">
                  <dt className="text-[#6b6b6b]">Profissão / Ramo:</dt>
                  <dd className="font-medium">{client.profissaoOuRamo}</dd>
                </div>
              )}
              <div className="flex justify-between border-b border-[#0a0a0a]/10 pb-2">
                <dt className="text-[#6b6b6b]">Telefone:</dt>
                <dd className="font-medium flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {client.telefone}
                </dd>
              </div>
              {client.email && (
                <div className="flex justify-between border-b border-[#0a0a0a]/10 pb-2">
                  <dt className="text-[#6b6b6b]">E-mail:</dt>
                  <dd className="font-medium">{client.email}</dd>
                </div>
              )}
              <div className="pt-1">
                <dt className="text-[#6b6b6b] flex items-center gap-1 mb-1">
                  <MapPin className="h-3.5 w-3.5" /> Endereço Completo:
                </dt>
                <dd className="font-medium text-[#0a0a0a]">
                  {client.endereco || "Endereço não especificado"} · {client.cidade} – {client.uf} (CEP{" "}
                  {client.cep})
                </dd>
              </div>
            </dl>

            {client.observacoes && (
              <div className="rounded-[8px] bg-[#ebf5ed] border border-[#0a0a0a] p-3.5 text-[12px]">
                <p className="font-medium text-[#0a0a0a] mb-1">Observações de Atendimento:</p>
                <p className="text-[#444444]">{client.observacoes}</p>
              </div>
            )}
          </div>

          {/* Documentos Emitidos do Cliente */}
          <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#0a0a0a] pb-3">
              <h2 className="editorial-heading text-[24px] text-[#0a0a0a]">Peças & Procurações</h2>
              <Link
                href={`/documentos?clientId=${client.id}`}
                className="text-[12px] underline text-[#0a0a0a]"
              >
                + Emitir Minuta
              </Link>
            </div>
            {client.documentos.length === 0 ? (
              <p className="text-[13px] text-[#6b6b6b]">
                Nenhum documento arquivado para este cliente ainda.
              </p>
            ) : (
              <ul className="divide-y divide-[#0a0a0a]/15 text-[13px]">
                {client.documentos.map((doc) => (
                  <li key={doc.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#0a0a0a]">{doc.titulo}</p>
                      <p className="text-[11px] text-[#6b6b6b]">
                        {doc.categoria} · Versão v{doc.versao}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#6b6b6b]">{formatDateBR(doc.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Coluna Direita: Processos Vinculados */}
        <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6">
          <div className="flex items-center justify-between border-b border-[#0a0a0a] pb-4">
            <div>
              <p className="editorial-kicker">Acervo Processual do Constituinte</p>
              <h2 className="editorial-heading text-[26px] text-[#0a0a0a] mt-1">
                Processos Vinculados ({client.processos.length})
              </h2>
            </div>
            <Link
              href={`/processos/novo?clientId=${client.id}`}
              className="btn-ink py-1.5 px-3 text-[12px]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Novo Processo</span>
            </Link>
          </div>

          {client.processos.length === 0 ? (
            <div className="my-8 rounded-[8px] border border-dashed border-[#0a0a0a]/50 bg-[#ebf5ed]/35 p-8 text-center">
              <Briefcase className="mx-auto h-7 w-7 text-[#0a0a0a]" />
              <p className="mt-3 font-medium text-[15px] text-[#0a0a0a]">
                Este cliente ainda não possui processos autuados
              </p>
              <p className="mt-1 text-[13px] text-[#6b6b6b]">
                Clique abaixo para registrar um processo perante o TJPB, TRT-13 ou TRF-5 (Sousa/PB).
              </p>
              <Link
                href={`/processos/novo?clientId=${client.id}`}
                className="mt-4 inline-flex btn-ink text-[12px]"
              >
                Autuar Processo Agora
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#0a0a0a]/15 mt-2">
              {client.processos.map((proc) => (
                <div key={proc.id} className="py-4 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[12px] font-medium">{proc.numeroCnj}</span>
                    <span className="rounded-[2px] border border-[#0a0a0a] bg-[#ebf5ed] px-2 py-0.5 text-[10px] uppercase">
                      {proc.status}
                    </span>
                  </div>
                  <Link
                    href={`/processos/${proc.id}`}
                    className="block font-medium text-[16px] text-[#0a0a0a] hover:underline"
                  >
                    {proc.titulo}
                  </Link>
                  <p className="text-[12px] text-[#6b6b6b]">
                    {proc.orgaoJulgador} · {proc.vara} · Área: {proc.area}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[12px]">
                    <span>
                      Advogado(a): <strong>{proc.advogado.name}</strong> ({proc.advogado.oab})
                    </span>
                    <span className="font-medium">{formatCurrencyBRL(proc.valorCausa)}</span>
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
