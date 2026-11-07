"""DAO de Processos Judiciais e Movimentações da MFV Advocacia."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from sqlalchemy import desc, or_, select

from backend.database import session_scope
from modelos.processo import LegalProcess


class ProcessoDAO:
    @staticmethod
    def listar(
        q: str = "", status: str = "", area: str = "", client_id: str = ""
    ) -> List[Dict[str, Any]]:
        with session_scope() as session:
            stmt = select(LegalProcess).order_by(desc(LegalProcess.updatedAt))
            if status and status != "TODOS":
                stmt = stmt.where(LegalProcess.status == status)
            if area and area != "TODAS":
                stmt = stmt.where(LegalProcess.area == area)
            if client_id:
                stmt = stmt.where(LegalProcess.clientId == client_id)
            if q.strip():
                like_q = f"%{q.strip()}%"
                stmt = stmt.where(
                    or_(
                        LegalProcess.numeroCnj.ilike(like_q),
                        LegalProcess.titulo.ilike(like_q),
                        LegalProcess.poloAtivo.ilike(like_q),
                        LegalProcess.poloPassivo.ilike(like_q),
                        LegalProcess.orgaoJulgador.ilike(like_q),
                        LegalProcess.vara.ilike(like_q),
                    )
                )
            return [
                p.to_dict(include_relations=True)
                for p in session.scalars(stmt).all()
            ]

    @staticmethod
    def buscar_por_id(process_id: str) -> Optional[Dict[str, Any]]:
        with session_scope() as session:
            proc = session.get(LegalProcess, process_id)
            return proc.to_dict(include_relations=True) if proc else None
