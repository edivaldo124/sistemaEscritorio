"""DAO de Mensagens Internas e Despachos da Banca."""

from __future__ import annotations

from typing import Any, Dict, List

from sqlalchemy import desc, select

from backend.database import session_scope
from modelos.mensagem import InternalMessage


class MensagemDAO:
    @staticmethod
    def listar(canal: str = "", process_id: str = "") -> List[Dict[str, Any]]:
        with session_scope() as session:
            stmt = select(InternalMessage).order_by(
                desc(InternalMessage.fixada), desc(InternalMessage.createdAt)
            )
            if canal and canal != "TODOS":
                stmt = stmt.where(InternalMessage.canal == canal)
            if process_id:
                stmt = stmt.where(InternalMessage.processId == process_id)
            return [m.to_dict() for m in session.scalars(stmt).all()]
