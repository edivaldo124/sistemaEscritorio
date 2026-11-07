"""
Configuração global e dados institucionais verificados do escritório
MFV Advocacia (Melo Fernandes & Vasconcelos - Advogados Associados) — Sousa/PB.
Segue o padrão arquitetural dos projetos Flask do autor (config.py + servidor.py + modelos/ + dao/ + servicos/ + blueprints/ + templates/).
"""

from __future__ import annotations

import os
from pathlib import Path

from backend.config import (
    ACCESS_PIN,
    BACKEND_HOST,
    BACKEND_PORT,
    BASE_DIR,
    DEFAULT_SQLITE_PATH,
    FIRM_DATA,
    INSTITUTIONAL_USERS_SEED,
    SECRET_KEY,
    get_database_url,
)

INSTANCE_DIR = BASE_DIR / "instance"
INSTANCE_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.environ.get("DATABASE_URL") or get_database_url()
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "false").strip().lower() == "true"
ESCRITORIO_FUSO = os.environ.get("ESCRITORIO_FUSO", "America/Recife")

__all__ = [
    "ACCESS_PIN",
    "BACKEND_HOST",
    "BACKEND_PORT",
    "BASE_DIR",
    "COOKIE_SECURE",
    "DATABASE_URL",
    "DEFAULT_SQLITE_PATH",
    "ESCRITORIO_FUSO",
    "FIRM_DATA",
    "INSTANCE_DIR",
    "INSTITUTIONAL_USERS_SEED",
    "SECRET_KEY",
    "get_database_url",
]
