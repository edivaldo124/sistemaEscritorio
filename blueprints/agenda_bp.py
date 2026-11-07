"""Blueprint de Agenda Forense (calendário e gestão de eventos/prazos)."""

from __future__ import annotations

from typing import Any

from flask import Blueprint, render_template, request

from config import FIRM_DATA
from dao.agenda_dao import AgendaDAO

agenda_bp = Blueprint("agenda", __name__)


@agenda_bp.get("/agenda")
@agenda_bp.get("/dashboard/agenda")
@agenda_bp.get("/agenda/calendario")
def calendario() -> Any:
    status = request.args.get("status", "")
    eventos = AgendaDAO.listar(status=status)
    return render_template(
        "agenda/calendario.html",
        escritorio=FIRM_DATA,
        eventos=eventos,
    )


@agenda_bp.get("/agenda/eventos")
def eventos() -> Any:
    eventos_lista = AgendaDAO.listar()
    return render_template(
        "agenda/eventos.html",
        escritorio=FIRM_DATA,
        eventos=eventos_lista,
    )
