"""
Blueprint de Clientes (listagem, cadastro e dossiê individual).
Organização limpa de templates para o escritório de advocacia.
"""

from __future__ import annotations

from typing import Any

from flask import Blueprint, abort, render_template, request

from config import FIRM_DATA
from dao.cliente_dao import ClienteDAO

clientes_bp = Blueprint("clientes", __name__)


@clientes_bp.get("/clientes")
@clientes_bp.get("/dashboard/clientes")
def listar_clientes() -> Any:
    q = request.args.get("q", "")
    status = request.args.get("status", "")
    tipo = request.args.get("tipoPessoa", "")
    clientes = ClienteDAO.listar(q=q, status=status, tipo_pessoa=tipo)
    return render_template(
        "clientes/lista.html",
        escritorio=FIRM_DATA,
        clientes=clientes,
        filtro_q=q,
        filtro_status=status,
    )


@clientes_bp.get("/clientes/novo")
def novo_cliente() -> Any:
    return render_template("clientes/novo.html", escritorio=FIRM_DATA)


@clientes_bp.get("/clientes/<client_id>")
def detalhe_cliente(client_id: str) -> Any:
    cliente = ClienteDAO.buscar_por_id(client_id)
    if cliente is None:
        abort(404)
    return render_template(
        "clientes/detalhe.html",
        escritorio=FIRM_DATA,
        cliente=cliente,
    )
