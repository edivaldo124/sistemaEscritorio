"""Serviço de Relatórios e Indicadores Executivos da MFV Advocacia."""

from __future__ import annotations

from typing import Any, Dict

from sqlalchemy import desc, func, or_, select

from backend.database import ensure_institutional_users, session_scope
from modelos import CalendarEvent, Client, Document, LegalProcess, User


def obter_resumo_executivo() -> Dict[str, Any]:
    with session_scope() as session:
        ensure_institutional_users(session)

        total_clientes = session.scalar(select(func.count(Client.id))) or 0
        total_processos = session.scalar(select(func.count(LegalProcess.id))) or 0
        processos_ativos = (
            session.scalar(
                select(func.count(LegalProcess.id)).where(
                    LegalProcess.status.in_(["ATIVO", "URGENTE"])
                )
            )
            or 0
        )
        processos_urgentes = (
            session.scalar(
                select(func.count(LegalProcess.id)).where(
                    or_(
                        LegalProcess.status == "URGENTE",
                        LegalProcess.prioridade.in_(["ALTA", "CRITICA"]),
                    )
                )
            )
            or 0
        )
        eventos_pendentes = (
            session.scalar(
                select(func.count(CalendarEvent.id)).where(
                    CalendarEvent.status == "PENDENTE"
                )
            )
            or 0
        )
        total_documentos = session.scalar(select(func.count(Document.id))) or 0
        valor_total_causas = (
            session.scalar(select(func.coalesce(func.sum(LegalProcess.valorCausa), 0.0)))
            or 0.0
        )

        all_processes = session.scalars(
            select(LegalProcess).order_by(desc(LegalProcess.updatedAt))
        ).all()

        area_counts: Dict[str, Dict[str, Any]] = {}
        orgao_counts: Dict[str, int] = {}
        for proc in all_processes:
            area_entry = area_counts.setdefault(
                proc.area, {"area": proc.area, "total": 0, "valorTotal": 0.0}
            )
            area_entry["total"] += 1
            area_entry["valorTotal"] += float(proc.valorCausa or 0.0)
            orgao_counts[proc.orgaoJulgador] = (
                orgao_counts.get(proc.orgaoJulgador, 0) + 1
            )

        proximos_eventos = session.scalars(
            select(CalendarEvent)
            .where(CalendarEvent.status == "PENDENTE")
            .order_by(CalendarEvent.dataInicio.asc())
            .limit(8)
        ).all()

        clientes_recentes = session.scalars(
            select(Client).order_by(desc(Client.createdAt)).limit(6)
        ).all()

        advogados = session.scalars(
            select(User).where(User.ativo.is_(True)).order_by(User.name.asc())
        ).all()

        return {
            "backend": "python",
            "metricas": {
                "totalClientes": int(total_clientes),
                "totalProcessos": int(total_processos),
                "processosAtivos": int(processos_ativos),
                "processosUrgentes": int(processos_urgentes),
                "eventosPendentes": int(eventos_pendentes),
                "totalDocumentos": int(total_documentos),
                "valorTotalCausas": float(valor_total_causas),
            },
            "porArea": list(area_counts.values()),
            "porOrgao": [
                {"orgao": orgao, "total": total}
                for orgao, total in orgao_counts.items()
            ],
            "processosRecentes": [
                p.to_dict(include_relations=False) for p in all_processes[:6]
            ],
            "proximosEventos": [e.to_dict() for e in proximos_eventos],
            "clientesRecentes": [
                c.to_dict(include_relations=False) for c in clientes_recentes
            ],
            "advogados": [u.to_dict(include_counts=True) for u in advogados],
        }
