"""
Monta a aplicação Flask completa da MFV Advocacia (Sousa - PB):
- Rotas de API REST (/api/*)
- Blueprints de páginas (/inicio, /login, /painel, /clientes, /processos, /agenda, /documentos, /relatorios, /chat, /config)
- Filtros Jinja2, comandos CLI e cabeçalhos de segurança OWASP.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional

from flask import Flask, request

from backend.app import create_app as _create_api_app
from blueprints import (
    admin_bp,
    agenda_bp,
    auth_bp,
    chat_bp,
    clientes_bp,
    documentos_bp,
    processos_bp,
    publico_bp,
)
from comandos import registrar_comandos
from config import BACKEND_HOST, BACKEND_PORT, FIRM_DATA
from modelos import (  # noqa: F401
    CalendarEvent,
    Client,
    Document,
    InternalMessage,
    LegalProcess,
    LogAuditoria,
    ProcessMovement,
    User,
)
from servicos.autenticacao import resolve_current_user
from servicos.erros import registrar_tratadores_de_erro
from servicos.formatacao import (
    formatar_cnj,
    formatar_data_hora,
    formatar_documento,
    formatar_moeda,
    rotulo_fase_processual,
    rotulo_status_processo,
)

BASE_DIR = Path(__file__).resolve().parent


def criar_aplicacao(database_url: Optional[str] = None) -> Flask:
    app = _create_api_app(database_url)
    app.template_folder = str(BASE_DIR / "templates")
    app.static_folder = str(BASE_DIR / "static")

    # Registra blueprints de páginas organizados por domínio
    app.register_blueprint(publico_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(clientes_bp)
    app.register_blueprint(processos_bp)
    app.register_blueprint(agenda_bp)
    app.register_blueprint(documentos_bp)
    app.register_blueprint(chat_bp)

    # Registra filtros globais Jinja (mesmo padrão do SistemaPizzariaTO e clinica-vitta)
    app.jinja_env.filters["moeda"] = formatar_moeda
    app.jinja_env.filters["data_hora"] = formatar_data_hora
    app.jinja_env.filters["documento"] = formatar_documento
    app.jinja_env.filters["cnj"] = formatar_cnj
    app.jinja_env.filters["status_processo"] = rotulo_status_processo
    app.jinja_env.filters["fase_processual"] = rotulo_fase_processual

    @app.context_processor
    def injetar_contexto_global() -> Dict[str, Any]:
        usuario = resolve_current_user(request)
        return {
            "usuario_logado": usuario,
            "escritorio": FIRM_DATA,
        }

    registrar_tratadores_de_erro(app)
    registrar_comandos(app)
    return app


app = criar_aplicacao()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=False)
