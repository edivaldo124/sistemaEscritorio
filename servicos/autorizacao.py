"""Serviço de Autorização RBAC (SOCIO, ADVOGADO, ASSISTENTE, CLIENTE)."""

from backend.auth import require_role, resolve_current_user

exigir_papel = require_role
usuario_atual = resolve_current_user

__all__ = ["exigir_papel", "require_role", "resolve_current_user", "usuario_atual"]
