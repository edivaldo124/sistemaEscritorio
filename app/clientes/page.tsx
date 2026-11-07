"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Search, Trash2, UserCheck, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useFirm } from "@/components/layout/firm-context";
import { formatDateBR } from "@/lib/utils";

interface ClientItem {
  id: string;
  nome: string;
  tipoPessoa: string;
  documento: string;
  email: string | null;
  telefone: string;
  cidade: string;
  uf: string;
  profissaoOuRamo: string | null;
  status: string;
  createdAt: string;
  _count: {
    processos: number;
    documentos: number;
  };
}

export default function ClientesPage() {
  const { activeProfile } = useFirm();
  const [clientes, setClientes] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("");
  const [status, setStatus] = useState("");

  const carregarClientes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (tipo) params.set("tipo", tipo);
      if (status) params.set("status", status);
      const res = await fetch(`/api/clientes?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setClientes(data);
    } finally {
      setLoading(false);
    }
  }, [q, tipo, status]);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  const handleDelete = async (id: string, nome: string) => {
    if (activeProfile.role === "CLIENTE") return;
    if (!window.confirm(`Confirma a remoção do cadastro de "${nome}"?`)) return;
    const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    if (res.ok) carregarClientes();
  };

  return (
    <AppShell
      kicker="Módulo 01 · Gestão de Constituintes (PF & PJ)"
      title="Diretório de Clientes"
      subtitle="Cadastro completo de pessoas físicas e jurídicas atendidas pela MFV Advocacia em Sousa – PB e região."
      actions={
        <Link href="/clientes/novo" className="btn-ink">
          <Plus className="h-4 w-4" />
          <span>Cadastrar Cliente</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Barra de Busca e Filtros */}
        <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-4 grid gap-4 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="h-4 w-4 text-[#6b6b6b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, razão social, CPF/CNPJ ou cidade..."
              className="input-editorial pl-10"
            />
          </div>

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            aria-label="Filtrar por tipo de pessoa"
            className="input-editorial"
          >
            <option value="">Todas as Naturezas (PF/PJ)</option>
            <option value="PF">Pessoa Física (PF)</option>
            <option value="PJ">Pessoa Jurídica (PJ)</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filtrar por status do cliente"
            className="input-editorial"
          >
            <option value="">Todos os Status</option>
            <option value="ATIVO">Ativo</option>
            <option value="PROSPECTO">Consultivo / Prospecto</option>
            <option value="ARQUIVADO">Arquivado</option>
          </select>
        </div>

        {/* Tabela Editorial de Clientes */}
        <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-[13px] text-[#6b6b6b]">
              Carregando clientes cadastrados...
            </div>
          ) : clientes.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Users className="mx-auto h-8 w-8 text-[#0a0a0a]" />
              <h3 className="editorial-heading text-[26px] text-[#0a0a0a]">
                Nenhum cliente registrado com os filtros atuais
              </h3>
              <p className="mx-auto max-w-md text-[13px] text-[#6b6b6b]">
                Cadastre um constituinte (Pessoa Física ou Empresa) para vincular processos e emitir
                procurações ou contratos de honorários da MFV Advocacia.
              </p>
              <div className="pt-2">
                <Link href="/clientes/novo" className="btn-ink">
                  Cadastrar Primeiro Cliente
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#0a0a0a] bg-[#ebf5ed] text-[11px] uppercase tracking-wider text-[#0a0a0a]">
                    <th className="py-3.5 px-4 font-medium">Nome / Razão Social</th>
                    <th className="py-3.5 px-4 font-medium">CPF / CNPJ</th>
                    <th className="py-3.5 px-4 font-medium">Contato</th>
                    <th className="py-3.5 px-4 font-medium">Localidade</th>
                    <th className="py-3.5 px-4 font-medium">Vínculos</th>
                    <th className="py-3.5 px-4 font-medium">Status</th>
                    <th className="py-3.5 px-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0a0a0a]/15 text-[13px]">
                  {clientes.map((c) => (
                    <tr key={c.id} className="hover:bg-[#ebf5ed]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/clientes/${c.id}`}
                          className="font-medium text-[#0a0a0a] hover:underline block"
                        >
                          {c.nome}
                        </Link>
                        <span className="text-[11px] text-[#6b6b6b]">
                          {c.tipoPessoa === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"}{" "}
                          {c.profissaoOuRamo ? `· ${c.profissaoOuRamo}` : ""}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[12px]">{c.documento}</td>
                      <td className="py-3.5 px-4">
                        <p>{c.telefone}</p>
                        {c.email && <p className="text-[11px] text-[#6b6b6b]">{c.email}</p>}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.cidade} – {c.uf}
                        <p className="text-[11px] text-[#6b6b6b]">
                          Desde {formatDateBR(c.createdAt)}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-[2px] border border-[#0a0a0a]/40 px-2 py-0.5 text-[11px]">
                          {c._count.processos} proc · {c._count.documentos} doc
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-[2px] border border-[#0a0a0a] bg-[#ebf5ed] px-2 py-0.5 text-[10px] font-medium uppercase">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/clientes/${c.id}`}
                          className="inline-flex items-center gap-1 rounded-[2px] border border-[#0a0a0a] px-2.5 py-1 text-[11px] hover:bg-[#ebf5ed]"
                        >
                          <UserCheck className="h-3 w-3" />
                          Ficha
                        </Link>
                        <Link
                          href={`/documentos?clientId=${c.id}`}
                          className="inline-flex items-center gap-1 rounded-[2px] border border-[#0a0a0a] px-2.5 py-1 text-[11px] hover:bg-[#bdd4f0]/50"
                        >
                          <FileText className="h-3 w-3" />
                          Procuração
                        </Link>
                        {activeProfile.role !== "ASSISTENTE" && (
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id, c.nome)}
                            aria-label={`Excluir cliente ${c.nome}`}
                            className="inline-flex items-center rounded-[2px] border border-[#0a0a0a] p-1 text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-[#fefefc]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
