"""DAO de Clientes (PF / PJ) da MFV Advocacia."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from sqlalchemy import desc, or_, select

from backend.database import session_scope
from modelos.cliente import Client


class ClienteDAO:
    @staticmethod
    def listar(
        q: str = "", status: str = "", tipo_pessoa: str = ""
    ) -> List[Dict[str, Any]]:
        with session_scope() as session:
            stmt = select(Client).order_by(desc(Client.createdAt))
            if status and status != "TODOS":
                stmt = stmt.where(Client.status == status)
            if tipo_pessoa and tipo_pessoa != "TODOS":
                stmt = stmt.where(Client.tipoPessoa == tipo_pessoa)
            if q.strip():
                like_q = f"%{q.strip()}%"
                stmt = stmt.where(
                    or_(
                        Client.nome.ilike(like_q),
                        Client.documento.ilike(like_q),
                        Client.email.ilike(like_q),
                        Client.telefone.ilike(like_q),
                        Client.cidade.ilike(like_q),
                    )
                )
            return [
                c.to_dict(include_relations=False)
                for c in session.scalars(stmt).all()
            ]

    @staticmethod
    def buscar_por_id(client_id: str) -> Optional[Dict[str, Any]]:
        with session_scope() as session:
            cliente = session.get(Client, client_id)
            return cliente.to_dict(include_relations=True) if cliente else None
