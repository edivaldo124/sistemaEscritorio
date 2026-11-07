"""
Blueprint público: site da MFV Advocacia (Sousa - PB).

Páginas: Início, Áreas de atuação, O escritório, Contato, Termos e Privacidade.
Não consulta o banco de dados: o conteúdo vem de config.FIRM_DATA e de servicos/conteudo_publico.py.
"""

from __future__ import annotations

from typing import Any, Dict

from flask import Blueprint, render_template

from servicos.conteudo_publico import (
    AREAS_DE_ATUACAO,
    FRENTES_DE_CONTEUDO,
    MAIS_DE_N_AREAS,
    NAVEGACAO_PUBLICA,
    SOCIOS_PUBLICOS,
    anos_de_atuacao,
)

publico_bp = Blueprint("publico", __name__)


@publico_bp.app_context_processor
def injetar_navegacao_publica() -> Dict[str, Any]:
    """Disponível também nas páginas de erro e de acesso, que são renderizadas fora deste blueprint."""
    return {"navegacao_publica": NAVEGACAO_PUBLICA}


@publico_bp.get("/")
@publico_bp.get("/inicio")
def inicio() -> Any:
    return render_template(
        "publico/inicio.html",
        areas=AREAS_DE_ATUACAO,
        anos_atuacao=anos_de_atuacao(),
        mais_de_n_areas=MAIS_DE_N_AREAS,
    )


@publico_bp.get("/areas-de-atuacao")
def areas() -> Any:
    return render_template(
        "publico/areas.html",
        areas=AREAS_DE_ATUACAO,
        mais_de_n_areas=MAIS_DE_N_AREAS,
    )


@publico_bp.get("/escritorio", endpoint="escritorio")
def pagina_escritorio() -> Any:
    return render_template(
        "publico/escritorio.html",
        socios=SOCIOS_PUBLICOS,
        frentes=FRENTES_DE_CONTEUDO,
        anos_atuacao=anos_de_atuacao(),
    )


@publico_bp.get("/contato")
def contato() -> Any:
    return render_template("publico/contato.html", areas=AREAS_DE_ATUACAO)


@publico_bp.get("/termos")
@publico_bp.get("/termos-de-servico")
def termos() -> Any:
    return render_template("termos_de_servico.html")


@publico_bp.get("/privacidade")
@publico_bp.get("/politica-privacidade")
def privacidade() -> Any:
    return render_template("politica_privacidade.html")
