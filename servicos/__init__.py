"""Camada de Serviços e Regras de Negócio da MFV Advocacia (Sousa - PB)."""

from servicos.autenticacao import (
    attach_session_cookie,
    authenticate_credentials,
    clear_session_cookie,
    create_session_token,
    resolve_current_user,
    verify_session_token,
)
from servicos.autorizacao import exigir_papel, require_role
from servicos.erros import registrar_tratadores_de_erro
from servicos.formatacao import (
    formatar_cnj,
    formatar_data_hora,
    formatar_documento,
    formatar_moeda,
    rotulo_fase_processual,
    rotulo_status_processo,
)
from servicos.minutas import gerar_minuta_oficial
from servicos.relatorios import obter_resumo_executivo

__all__ = [
    "attach_session_cookie",
    "authenticate_credentials",
    "clear_session_cookie",
    "create_session_token",
    "exigir_papel",
    "formatar_cnj",
    "formatar_data_hora",
    "formatar_documento",
    "formatar_moeda",
    "gerar_minuta_oficial",
    "obter_resumo_executivo",
    "registrar_tratadores_de_erro",
    "require_role",
    "resolve_current_user",
    "rotulo_fase_processual",
    "rotulo_status_processo",
    "verify_session_token",
]
