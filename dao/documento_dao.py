"""DAO de Documentos Jurídicos e Minutas Versionadas."""

from __future__ import annotations

from typing import Any, Dict, List

from sqlalchemy import desc, select

from backend.database import session_scope
from modelos.documento import Document


class DocumentoDAO:
    @staticmethod
    def listar(
        categoria: str = "", client_id: str = "", process_id: str = ""
    ) -> List[Dict[str, Any]]:
        with session_scope() as session:
            stmt = select(Document).order_by(desc(Document.createdAt))
            if categoria and categoria != "TODAS":
                stmt = stmt.where(Document.categoria == categoria)
            if client_id:
                stmt = stmt.where(Document.clientId == client_id)
            if process_id:
                stmt = stmt.where(Document.processId == process_id)
            return [d.to_dict() for d in session.scalars(stmt).all()]
