"""
Blueprint do painel administrativo, relatórios e governança RBAC.
Estrutura limpa e idiomática inspirada no SistemaEXTREMETEAM, adaptada à MFV Advocacia.
"""

from __future__ import annotations

from typing import Any

from flask import Blueprint, render_template

from config import FIRM_DATA
from dao.usuario_dao import UsuarioDAO
from servicos.relatorios import obter_resumo_executivo

admin_bp = Blueprint("admin", __name__)


@admin_bp.get("/painel")
@admin_bp.get("/dashboard")
def painel() -> Any:
    resumo = obter_resumo_executivo()
    return render_template("admin/painel.html", escritorio=FIRM_DATA, resumo=resumo)


@admin_bp.get("/financeiro")
@admin_bp.get("/relatorios")
@admin_bp.get("/relatorios/gerar")
def relatorios_gerar() -> Any:
    resumo = obter_resumo_executivo()
    return render_template(
        "relatorios/gerar.html", escritorio=FIRM_DATA, resumo=resumo
    )


@admin_bp.get("/planilha")
@admin_bp.get("/relatorios/historico")
def relatorios_historico() -> Any:
    resumo = obter_resumo_executivo()
    return render_template(
        "relatorios/historico.html", escritorio=FIRM_DATA, resumo=resumo
    )


@admin_bp.get("/config")
@admin_bp.get("/config/admin")
def configuracao() -> Any:
    usuarios = UsuarioDAO.listar_todos()
    return render_template(
        "admin/configuracao.html",
        escritorio=FIRM_DATA,
        usuarios=usuarios,
    )


@admin_bp.get("/equipe")
def funcionarios() -> Any:
    usuarios = UsuarioDAO.listar_todos()
    return render_template(
        "admin/funcionarios.html",
        escritorio=FIRM_DATA,
        usuarios=usuarios,
    )
