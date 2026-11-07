"""DAO de Agenda Forense, Audiências e Prazos Fatais."""

from __future__ import annotations

from typing import Any, Dict, List

from sqlalchemy import select

from backend.database import session_scope
from modelos.agenda import CalendarEvent


class AgendaDAO:
    @staticmethod
    def listar(status: str = "", tipo: str = "") -> List[Dict[str, Any]]:
        with session_scope() as session:
            stmt = select(CalendarEvent).order_by(CalendarEvent.dataInicio.asc())
            if status and status != "TODOS":
                stmt = stmt.where(CalendarEvent.status == status)
            if tipo and tipo != "TODOS":
                stmt = stmt.where(CalendarEvent.tipo == tipo)
            return [e.to_dict() for e in session.scalars(stmt).all()]
