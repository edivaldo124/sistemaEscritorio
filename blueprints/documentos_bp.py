"""Blueprint de Documentos e Minutas Jurídicas (lista e upload/geração)."""

from __future__ import annotations

from typing import Any

from flask import Blueprint, render_template, request

from config import FIRM_DATA
from dao.cliente_dao import ClienteDAO
from dao.documento_dao import DocumentoDAO
from dao.processo_dao import ProcessoDAO

documentos_bp = Blueprint("documentos", __name__)


@documentos_bp.get("/documentos")
@documentos_bp.get("/dashboard/documentos")
@documentos_bp.get("/documentos/lista")
def lista() -> Any:
    categoria = request.args.get("categoria", "")
    documentos = DocumentoDAO.listar(categoria=categoria)
    return render_template(
        "documentos/lista.html",
        escritorio=FIRM_DATA,
        documentos=documentos,
    )


@documentos_bp.get("/documentos/upload")
def upload() -> Any:
    clientes = ClienteDAO.listar()
    processos = ProcessoDAO.listar()
    return render_template(
        "documentos/upload.html",
        escritorio=FIRM_DATA,
        clientes=clientes,
        processos=processos,
    )
