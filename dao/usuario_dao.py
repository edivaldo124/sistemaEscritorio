"""DAO de Usuários Institucionais e Advogados da MFV Advocacia."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from sqlalchemy import select

from backend.database import ensure_institutional_users, session_scope
from modelos.usuario import User


class UsuarioDAO:
    @staticmethod
    def listar_todos(apenas_ativos: bool = False) -> List[Dict[str, Any]]:
        with session_scope() as session:
            ensure_institutional_users(session)
            stmt = select(User).order_by(User.createdAt.asc())
            if apenas_ativos:
                stmt = stmt.where(User.ativo.is_(True))
            return [u.to_dict(include_counts=True) for u in session.scalars(stmt).all()]

    @staticmethod
    def buscar_por_email(email: str) -> Optional[Dict[str, Any]]:
        with session_scope() as session:
            ensure_institutional_users(session)
            user = session.scalar(
                select(User).where(User.email == email.strip().lower())
            )
            return user.to_dict(include_counts=True) if user else None

    @staticmethod
    def buscar_por_id(user_id: str) -> Optional[Dict[str, Any]]:
        with session_scope() as session:
            ensure_institutional_users(session)
            user = session.get(User, user_id)
            return user.to_dict(include_counts=True) if user else None
