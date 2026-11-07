"""Modelo de Log de Auditoria (LGPD / OWASP ASVS 5.0)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class LogAuditoria:
    acao: str
    entidade: str
    entidade_id: Optional[str] = None
    usuario_email: str = "barbara@mfv.adv.br"
    criado_em: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
