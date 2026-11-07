"""Serviço de Autenticação Institucional e Sessão Assinada."""

from backend.auth import (
    COOKIE_NAME,
    TOKEN_MAX_AGE_SECONDS,
    VALID_PINS,
    attach_session_cookie,
    authenticate_credentials,
    clear_session_cookie,
    create_session_token,
    resolve_current_user,
    verify_session_token,
)

__all__ = [
    "COOKIE_NAME",
    "TOKEN_MAX_AGE_SECONDS",
    "VALID_PINS",
    "attach_session_cookie",
    "authenticate_credentials",
    "clear_session_cookie",
    "create_session_token",
    "resolve_current_user",
    "verify_session_token",
]
