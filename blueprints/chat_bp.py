"""Blueprint de Comunicação Interna da Banca (Mural / Chat Jurídico)."""

from __future__ import annotations

from typing import Any

from flask import Blueprint, render_template, request

from config import FIRM_DATA
from dao.mensagem_dao import MensagemDAO

chat_bp = Blueprint("chat", __name__)


@chat_bp.get("/chat")
def mural() -> Any:
    canal = request.args.get("canal", "")
    mensagens = MensagemDAO.listar(canal=canal)
    return render_template(
        "chat/mural.html",
        escritorio=FIRM_DATA,
        mensagens=mensagens,
        canal_ativo=canal or "TODOS",
    )
