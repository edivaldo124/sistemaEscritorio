"""Blueprint de Processos Judiciais (listagem, autuação, detalhes, timeline, documentos e comentários)."""

from __future__ import annotations

from typing import Any

from flask import Blueprint, abort, render_template, request

from config import FIRM_DATA
from dao.cliente_dao import ClienteDAO
from dao.processo_dao import ProcessoDAO
from dao.usuario_dao import UsuarioDAO

processos_bp = Blueprint("processos", __name__)


@processos_bp.get("/processos")
@processos_bp.get("/dashboard/processos")
def listar_processos() -> Any:
    q = request.args.get("q", "")
    status = request.args.get("status", "")
    area = request.args.get("area", "")
    processos = ProcessoDAO.listar(q=q, status=status, area=area)
    return render_template(
        "processos/lista.html",
        escritorio=FIRM_DATA,
        processos=processos,
        filtro_q=q,
        filtro_status=status,
    )


@processos_bp.get("/processos/novo")
def novo_processo() -> Any:
    clientes = ClienteDAO.listar()
    advogados = UsuarioDAO.listar_todos(apenas_ativos=True)
    return render_template(
        "processos/novo.html",
        escritorio=FIRM_DATA,
        clientes=clientes,
        advogados=advogados,
    )


@processos_bp.get("/processos/<process_id>")
@processos_bp.get("/processos/<process_id>/detalhes")
def detalhe_processo(process_id: str) -> Any:
    processo = ProcessoDAO.buscar_por_id(process_id)
    if processo is None:
        abort(404)
    return render_template(
        "processos/detalhe.html",
        escritorio=FIRM_DATA,
        processo=processo,
        aba_ativa="detalhes",
    )


@processos_bp.get("/processos/<process_id>/timeline")
def timeline_processo(process_id: str) -> Any:
    processo = ProcessoDAO.buscar_por_id(process_id)
    if processo is None:
        abort(404)
    return render_template(
        "processos/timeline.html",
        escritorio=FIRM_DATA,
        processo=processo,
        aba_ativa="timeline",
    )


@processos_bp.get("/processos/<process_id>/documentos")
def documentos_processo(process_id: str) -> Any:
    processo = ProcessoDAO.buscar_por_id(process_id)
    if processo is None:
        abort(404)
    return render_template(
        "processos/documentos.html",
        escritorio=FIRM_DATA,
        processo=processo,
        aba_ativa="documentos",
    )


@processos_bp.get("/processos/<process_id>/comentarios")
@processos_bp.get("/processos/<process_id>/comentários")
def comentarios_processo(process_id: str) -> Any:
    processo = ProcessoDAO.buscar_por_id(process_id)
    if processo is None:
        abort(404)
    return render_template(
        "processos/comentarios.html",
        escritorio=FIRM_DATA,
        processo=processo,
        aba_ativa="comentarios",
    )
