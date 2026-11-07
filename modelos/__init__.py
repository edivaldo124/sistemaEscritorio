"""
Entidades de domínio SQLAlchemy da MFV Advocacia (Sousa - PB).
Cada modelo é organizado em seu próprio módulo seguindo o padrão dos projetos do autor.
"""

from modelos.agenda import CalendarEvent, EventoAgenda
from modelos.cliente import Client, Cliente
from modelos.documento import Document, Documento
from modelos.log import LogAuditoria
from modelos.mensagem import InternalMessage, MensagemInterna
from modelos.movimentacao import MovimentacaoProcessual, ProcessMovement
from modelos.processo import LegalProcess, ProcessoJudicial
from modelos.usuario import User, Usuario

__all__ = [
    "CalendarEvent",
    "Client",
    "Cliente",
    "Document",
    "Documento",
    "EventoAgenda",
    "InternalMessage",
    "LegalProcess",
    "LogAuditoria",
    "MensagemInterna",
    "MovimentacaoProcessual",
    "ProcessMovement",
    "ProcessoJudicial",
    "User",
    "Usuario",
]
