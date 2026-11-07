"""Camada de Acesso a Dados (DAO) da MFV Advocacia — Sousa/PB."""

from dao.agenda_dao import AgendaDAO
from dao.cliente_dao import ClienteDAO
from dao.documento_dao import DocumentoDAO
from dao.mensagem_dao import MensagemDAO
from dao.processo_dao import ProcessoDAO
from dao.usuario_dao import UsuarioDAO

__all__ = [
    "AgendaDAO",
    "ClienteDAO",
    "DocumentoDAO",
    "MensagemDAO",
    "ProcessoDAO",
    "UsuarioDAO",
]
