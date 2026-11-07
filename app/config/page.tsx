"use client";

import React, { useEffect, useState } from "react";
import { Building2, Plus, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useFirm } from "@/components/layout/firm-context";
import { FIRM_DATA } from "@/lib/firm-data";

interface MemberUser {
  id: string;
  name: string;
  email: string;
  oab: string | null;
  role: string;
  cargo: string;
  especialidade: string;
  telefone: string | null;
  ativo: boolean;
  _count: {
    processos: number;
    eventos: number;
  };
}

export default function ConfigPage() {
  const { activeProfile } = useFirm();
  const [usuarios, setUsuarios] = useState<MemberUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oab, setOab] = useState("");
  const [role, setRole] = useState("ADVOGADO");
  const [cargo, setCargo] = useState("Advogado(a) Associado(a)");
  const [especialidade, setEspecialidade] = useState("Contencioso Cível e Empresarial");
  const [telefone, setTelefone] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const carregarUsuarios = async () => {
    const res = await fetch("/api/usuarios");
    const data = await res.json();
    if (Array.isArray(data)) setUsuarios(data);
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        oab: oab || null,
        role,
        cargo,
        especialidade,
        telefone,
      }),
    });
    if (res.ok) {
      setName("");
      setEmail("");
      setOab("");
      setTelefone("");
      setMsg("Membro cadastrado com sucesso na banca MFV Advocacia.");
      carregarUsuarios();
    } else {
      const err = await res.json();
      setMsg(err.error || "Erro ao cadastrar membro.");
    }
  };

  return (
    <AppShell
      kicker="Módulo 07 · Governança Societária & Controle de Acesso (RBAC)"
      title="Administração e Membros da Banca"
      subtitle="Parâmetros institucionais verificados de Melo Fernandes & Vasconcelos - Advogados Associados (Sousa – PB) e gestão de papéis RBAC."
    >
      <div className="space-y-8">
        {/* Dados Oficiais do Escritório */}
        <section className="rounded-[8px] border border-[#0a0a0a] bg-[#ebf5ed] p-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="editorial-kicker text-[#0a0a0a] flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Registro Institucional Verificado
            </p>
            <h2 className="editorial-heading text-[28px] text-[#0a0a0a] mt-1">
              {FIRM_DATA.razaoSocial}
            </h2>
            <p className="text-[13px] text-[#444444] mt-2 space-y-1">
              <strong>Nome de Fantasia:</strong> {FIRM_DATA.nomeFantasia}
              <br />
              <strong>CNPJ:</strong> {FIRM_DATA.cnpj}
              <br />
              <strong>Sede:</strong> {FIRM_DATA.endereco.completo}
              <br />
              <strong>E-mails Oficiais:</strong> {FIRM_DATA.contatos.emailGeral} /{" "}
              {FIRM_DATA.contatos.emailSocia}
              <br />
              <strong>Telefones:</strong> {FIRM_DATA.contatos.telefonePrincipal} /{" "}
              {FIRM_DATA.contatos.telefoneSecundario}
            </p>
          </div>

          <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-5 space-y-2 text-[13px]">
            <p className="editorial-kicker flex items-center gap-1.5 text-[#0a0a0a]">
              <ShieldCheck className="h-4 w-4" /> Matriz de Controle de Acesso (RBAC)
            </p>
            <ul className="space-y-1.5 pt-2 text-[12px] text-[#444444]">
              <li>
                <strong className="text-[#0a0a0a]">SOCIO (Sócios-Fundadores):</strong> Acesso total
                a métricas financeiras, exclusão de registros, gestão de membros e relatórios.
              </li>
              <li>
                <strong className="text-[#0a0a0a]">ADVOGADO (Associados):</strong> Autuação e
                movimentação de processos, prazos, agenda e emissão de peças.
              </li>
              <li>
                <strong className="text-[#0a0a0a]">ASSISTENTE (Secretaria/Atendimento):</strong>{" "}
                Cadastro de clientes, marcação de consultas e geração de documentos padrão.
              </li>
            </ul>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          {/* Quadro de Membros Cadastrados */}
          <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 space-y-4">
            <h2 className="editorial-heading text-[26px] text-[#0a0a0a] border-b border-[#0a0a0a] pb-3">
              Corpo Jurídico e Administrativo ({usuarios.length})
            </h2>
            <div className="divide-y divide-[#0a0a0a]/15">
              {usuarios.map((u) => (
                <div key={u.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[15px] text-[#0a0a0a]">{u.name}</span>
                      {u.oab && (
                        <span className="rounded-[2px] border border-[#0a0a0a] bg-[#ebf5ed] px-2 py-0.5 text-[10px] font-mono">
                          {u.oab}
                        </span>
                      )}
                      <span className="rounded-[2px] border border-[#0a0a0a] bg-[#bdd4f0] px-2 py-0.5 text-[10px] uppercase">
                        {u.role}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#444444] mt-1">
                      {u.cargo} · {u.especialidade}
                    </p>
                    <p className="text-[11px] text-[#6b6b6b]">
                      {u.email} {u.telefone ? `· ${u.telefone}` : ""}
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-[#6b6b6b] shrink-0">
                    <p>{u._count?.processos || 0} processos</p>
                    <p>{u._count?.eventos || 0} eventos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adicionar Novo Advogado Associado ou Assistente */}
          <form
            onSubmit={handleAddMember}
            className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 space-y-4 h-fit"
          >
            <h2 className="editorial-heading text-[24px] text-[#0a0a0a] border-b border-[#0a0a0a] pb-3">
              Credenciar Membro na Banca
            </h2>

            {activeProfile.role !== "SOCIO" && (
              <p className="rounded-[8px] border border-[#0a0a0a] bg-[#bdd4f0]/40 p-3 text-[12px]">
                Nota RBAC: Alterne para o perfil de Sócio (Dra. Bárbara ou Dr. Higor) na barra
                lateral para gerenciar credenciais societárias.
              </p>
            )}

            <div>
              <label htmlFor="usr-nome" className="block text-[12px] font-medium mb-1">
                Nome Completo *
              </label>
              <input
                id="usr-nome"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-editorial"
                required
              />
            </div>

            <div>
              <label htmlFor="usr-email" className="block text-[12px] font-medium mb-1">
                E-mail Institucional *
              </label>
              <input
                id="usr-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@mfv.adv.br"
                className="input-editorial"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="usr-oab" className="block text-[12px] font-medium mb-1">
                  Inscrição OAB/PB
                </label>
                <input
                  id="usr-oab"
                  type="text"
                  value={oab}
                  onChange={(e) => setOab(e.target.value)}
                  placeholder="OAB/PB 00.000"
                  className="input-editorial font-mono"
                />
              </div>
              <div>
                <label htmlFor="usr-role" className="block text-[12px] font-medium mb-1">
                  Papel RBAC
                </label>
                <select
                  id="usr-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-editorial"
                >
                  <option value="ADVOGADO">ADVOGADO</option>
                  <option value="ASSISTENTE">ASSISTENTE</option>
                  <option value="SOCIO">SOCIO</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="usr-cargo" className="block text-[12px] font-medium mb-1">
                Cargo na Sociedade *
              </label>
              <input
                id="usr-cargo"
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="input-editorial"
                required
              />
            </div>

            <div>
              <label htmlFor="usr-esp" className="block text-[12px] font-medium mb-1">
                Área de Especialidade
              </label>
              <input
                id="usr-esp"
                type="text"
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                className="input-editorial"
              />
            </div>

            {msg && (
              <p className="rounded-[8px] border border-[#0a0a0a] bg-[#ebf5ed] p-3 text-[12px]">
                {msg}
              </p>
            )}

            <button
              type="submit"
              disabled={activeProfile.role !== "SOCIO"}
              className="btn-ink w-full"
            >
              <Plus className="h-4 w-4" />
              <span>Credenciar Membro</span>
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
