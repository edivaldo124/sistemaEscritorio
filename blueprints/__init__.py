"""Blueprints HTTP (rotas de páginas e fluxos) da MFV Advocacia — Sousa/PB."""

from blueprints.admin_bp import admin_bp
from blueprints.agenda_bp import agenda_bp
from blueprints.auth_bp import auth_bp
from blueprints.chat_bp import chat_bp
from blueprints.clientes_bp import clientes_bp
from blueprints.documentos_bp import documentos_bp
from blueprints.processos_bp import processos_bp
from blueprints.publico_bp import publico_bp

__all__ = [
    "admin_bp",
    "agenda_bp",
    "auth_bp",
    "chat_bp",
    "clientes_bp",
    "documentos_bp",
    "processos_bp",
    "publico_bp",
]
