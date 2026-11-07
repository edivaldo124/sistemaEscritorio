"use client";

import React, { useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { FIRM_DATA } from "@/lib/firm-data";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";

interface ReportProcess {
  id: string;
  numeroCnj: string;
  titulo: string;
  area: string;
  orgaoJulgador: string;
  vara: string;
  status: string;
  fase: string;
  valorCausa: number;
  proximoPrazo: string | null;
  client: { nome: string; documento: string };
  advogado: { name: string; oab: string | null };
}

export default function RelatoriosPage() {
  const [processos, setProcessos] = useState<ReportProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroArea, setFiltroArea] = useState("");

  useEffect(() => {
    fetch("/api/processos")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setProcessos(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtrados = processos.filter((p) => {
    if (filtroStatus && p.status !== filtroStatus) return false;
    if (filtroArea && p.area !== filtroArea) return false;
    return true;
  });

  const somaValores = filtrados.reduce((acc, p) => acc + (p.valorCausa || 0), 0);

  const handleExportCSV = () => {
    const headers = [
      "Numero_CNJ",
      "Titulo_Acao",
      "Cliente",
      "CPF_CNPJ_Cliente",
      "Advogado_Responsavel",
      "OAB",
      "Area_Direito",
      "Orgao_Julgador",
      "Vara",
      "Status",
      "Fase",
      "Valor_Causa_BRL",
      "Proximo_Prazo",
    ];

    const rows = filtrados.map((p) => [
      p.numeroCnj,
      p.titulo,
      p.client.nome,
      p.client.documento,
      p.advogado.name,
      p.advogado.oab || "",
      p.area,
      p.orgaoJulgador,
      p.vara,
      p.status,
      p.fase,
      String(p.valorCausa || 0),
      formatDateBR(p.proximoPrazo),
    ]);

    const csvContent =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-mfv-advocacia-sousa-pb-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell
      kicker="Módulo 06 · Inteligência Processual & Auditoria"
      title="Relatórios Gerenciais e Exportação"
      subtitle="Consolidação de processos por status, área de atuação, tribunal em Sousa – PB e advogado responsável, com exportação nativa em CSV e PDF."
      actions={
        <>
          <button type="button" onClick={() => window.print()} className="btn-ghost-outline">
            <Printer className="h-4 w-4" />
            <span>Imprimir / Exportar PDF</span>
          </button>
          <button type="button" onClick={handleExportCSV} className="btn-ink">
            <Download className="h-4 w-4" />
            <span>Exportar Planilha CSV</span>
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Filtros de Parâmetros */}
        <div className="no-print rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="rel-area" className="block text-[11px] uppercase tracking-wider text-[#6b6b6b] mb-1">
              Filtrar por Área do Direito
            </label>
            <select
              id="rel-area"
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              className="input-editorial"
            >
              <option value="">Todas as Áreas</option>
              {FIRM_DATA.areasAtuacao.map((a) => (
                <option key={a.codigo} value={a.titulo}>
                  {a.titulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="rel-status" className="block text-[11px] uppercase tracking-wider text-[#6b6b6b] mb-1">
              Filtrar por Status
            </label>
            <select
              id="rel-status"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="input-editorial"
            >
              <option value="">Todos os Status</option>
              <option value="ATIVO">Ativo</option>
              <option value="URGENTE">Urgente</option>
              <option value="SUSPENSO">Suspenso</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>
          </div>

          <div className="rounded-[8px] bg-[#ebf5ed] border border-[#0a0a0a] p-3 flex flex-col justify-center">
            <span className="text-[11px] uppercase tracking-wider text-[#444444]">
              Total Consolidado no Relatório ({filtrados.length} processos)
            </span>
            <span className="editorial-heading text-[26px] text-[#0a0a0a]">
              {formatCurrencyBRL(somaValores)}
            </span>
          </div>
        </div>

        {/* Relatório Imprimível */}
        <div className="rounded-[8px] border border-[#0a0a0a] bg-[#fefefc] p-6 space-y-6">
          <div className="border-b border-[#0a0a0a] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="editorial-kicker">{FIRM_DATA.razaoSocial}</p>
              <h2 className="editorial-heading text-[28px] text-[#0a0a0a]">
                Relatório Analítico de Carteira Processual
              </h2>
            </div>
            <p className="text-[12px] text-[#6b6b6b]">
              CNPJ {FIRM_DATA.cnpj} · Emitido em {formatDateBR(new Date())}
            </p>
          </div>

          {loading ? (
            <p className="py-10 text-center text-[13px] text-[#6b6b6b]">Gerando demonstrativo...</p>
          ) : filtrados.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-[#6b6b6b]">
              Nenhum processo registrado para os parâmetros selecionados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#0a0a0a] bg-[#ebf5ed] uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Autos CNJ</th>
                    <th className="py-3 px-3">Ação / Objeto</th>
                    <th className="py-3 px-3">Cliente</th>
                    <th className="py-3 px-3">Juízo (Sousa/PB)</th>
                    <th className="py-3 px-3">Advogado(a)</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Valor da Causa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0a0a0a]/15">
                  {filtrados.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 px-3 font-mono">{p.numeroCnj}</td>
                      <td className="py-3 px-3 font-medium">{p.titulo}</td>
                      <td className="py-3 px-3">{p.client.nome}</td>
                      <td className="py-3 px-3">
                        {p.orgaoJulgador} ({p.vara})
                      </td>
                      <td className="py-3 px-3">{p.advogado.name}</td>
                      <td className="py-3 px-3">{p.status}</td>
                      <td className="py-3 px-3 text-right font-mono">
                        {formatCurrencyBRL(p.valorCausa)}
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
