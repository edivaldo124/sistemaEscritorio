"""
Modelos ORM SQLAlchemy 2.0 compatíveis com o banco SQLite (prisma/dev.db)
do sistema MFV Advocacia (Melo Fernandes & Vasconcelos - Advogados Associados, Sousa - PB).
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.types import TypeDecorator


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def generate_id() -> str:
    return f"mfv_{uuid.uuid4().hex[:20]}"


class PrismaDateTime(TypeDecorator):
    """
    Compatibiliza colunas DateTime entre SQLAlchemy (Python) e Prisma (SQLite),
    que armazena timestamps em milissegundos epoch (int) ou ISO-8601 (str).
    """

    impl = Integer
    cache_ok = True

    def process_bind_param(self, value: Any, dialect: Any) -> Optional[int]:
        if value is None:
            return None
        if isinstance(value, (int, float)):
            return int(value)
        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return None
            if raw.isdigit():
                return int(raw)
            if raw.endswith("Z"):
                raw = raw[:-1] + "+00:00"
            dt = datetime.fromisoformat(raw)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return int(dt.timestamp() * 1000)
        if isinstance(value, datetime):
            dt = value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)
            return int(dt.timestamp() * 1000)
        raise ValueError(f"Formato de data inválido: {value!r}")

    def process_result_value(self, value: Any, dialect: Any) -> Optional[datetime]:
        if value is None:
            return None
        if isinstance(value, datetime):
            return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
        if isinstance(value, (int, float)):
            # Se for em segundos vs milissegundos
            ts = value / 1000.0 if value > 1e11 else float(value)
            return datetime.fromtimestamp(ts, tz=timezone.utc)
        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return None
            if raw.isdigit():
                num = int(raw)
                ts = num / 1000.0 if num > 1e11 else float(num)
                return datetime.fromtimestamp(ts, tz=timezone.utc)
            if raw.endswith("Z"):
                raw = raw[:-1] + "+00:00"
            try:
                dt = datetime.fromisoformat(raw)
                return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
            except ValueError:
                return utc_now()
        return None


def to_iso(dt: Optional[Any]) -> Optional[str]:
    if dt is None:
        return None
    if isinstance(dt, str):
        raw = dt.strip()
        return raw if raw else None
    if isinstance(dt, (int, float)):
        ts = dt / 1000.0 if dt > 1e11 else float(dt)
        dt = datetime.fromtimestamp(ts, tz=timezone.utc)
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    return str(dt)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "User"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_id)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    oab: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    role: Mapped[str] = mapped_column(String, default="ADVOGADO", nullable=False)
    cargo: Mapped[str] = mapped_column(String, nullable=False)
    especialidade: Mapped[str] = mapped_column(String, nullable=False)
    telefone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utc_now, nullable=False)

    processos: Mapped[List["LegalProcess"]] = relationship(
        "LegalProcess", back_populates="advogado", lazy="selectin"
    )
    eventos: Mapped[List["CalendarEvent"]] = relationship(
        "CalendarEvent", back_populates="user", lazy="selectin"
    )
    mensagens: Mapped[List["InternalMessage"]] = relationship(
        "InternalMessage", back_populates="autor", lazy="selectin"
    )

    def to_dict(self, include_counts: bool = False) -> Dict[str, Any]:
        data: Dict[str, Any] = {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "oab": self.oab,
            "role": self.role,
            "cargo": self.cargo,
            "especialidade": self.especialidade,
            "telefone": self.telefone,
            "ativo": bool(self.ativo),
            "createdAt": to_iso(self.createdAt),
        }
        if include_counts:
            data["_count"] = {
                "processos": len(self.processos or []),
                "eventos": len(self.eventos or []),
            }
        return data


class Client(Base):
    __tablename__ = "Client"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_id)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    tipoPessoa: Mapped[str] = mapped_column(String, default="PF", nullable=False)
    documento: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    rgOuIe: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    telefone: Mapped[str] = mapped_column(String, nullable=False)
    whatsapp: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    endereco: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    cidade: Mapped[str] = mapped_column(String, default="Sousa", nullable=False)
    uf: Mapped[str] = mapped_column(String, default="PB", nullable=False)
    cep: Mapped[str] = mapped_column(String, default="58800-510", nullable=False)
    profissaoOuRamo: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    estadoCivil: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    observacoes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String, default="ATIVO", nullable=False)
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utc_now, nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(
        PrismaDateTime, default=utc_now, onupdate=utc_now, nullable=False
    )

    processos: Mapped[List["LegalProcess"]] = relationship(
        "LegalProcess",
        back_populates="client",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    documentos: Mapped[List["Document"]] = relationship(
        "Document", back_populates="client", lazy="selectin"
    )
    eventos: Mapped[List["CalendarEvent"]] = relationship(
        "CalendarEvent", back_populates="client", lazy="selectin"
    )

    def to_dict(self, include_relations: bool = True) -> Dict[str, Any]:
        data: Dict[str, Any] = {
            "id": self.id,
            "nome": self.nome,
            "tipoPessoa": self.tipoPessoa,
            "documento": self.documento,
            "rgOuIe": self.rgOuIe,
            "email": self.email,
            "telefone": self.telefone,
            "whatsapp": self.whatsapp,
            "endereco": self.endereco,
            "cidade": self.cidade,
            "uf": self.uf,
            "cep": self.cep,
            "profissaoOuRamo": self.profissaoOuRamo,
            "estadoCivil": self.estadoCivil,
            "observacoes": self.observacoes,
            "status": self.status,
            "createdAt": to_iso(self.createdAt),
            "updatedAt": to_iso(self.updatedAt),
            "_count": {
                "processos": len(self.processos or []),
                "documentos": len(self.documentos or []),
                "eventos": len(self.eventos or []),
            },
        }
        if include_relations:
            data["processos"] = [p.to_dict(include_relations=False) for p in (self.processos or [])]
            data["documentos"] = [d.to_dict(include_relations=False) for d in (self.documentos or [])]
            data["eventos"] = [e.to_dict(include_relations=False) for e in (self.eventos or [])]
        return data


class LegalProcess(Base):
    __tablename__ = "LegalProcess"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_id)
    numeroCnj: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    titulo: Mapped[str] = mapped_column(String, nullable=False)
    area: Mapped[str] = mapped_column(String, nullable=False)
    orgaoJulgador: Mapped[str] = mapped_column(String, nullable=False)
    vara: Mapped[str] = mapped_column(String, nullable=False)
    comarca: Mapped[str] = mapped_column(String, default="Sousa - PB", nullable=False)
    poloAtivo: Mapped[str] = mapped_column(String, nullable=False)
    poloPassivo: Mapped[str] = mapped_column(String, nullable=False)
    fase: Mapped[str] = mapped_column(String, default="CONHECIMENTO", nullable=False)
    status: Mapped[str] = mapped_column(String, default="ATIVO", nullable=False)
    prioridade: Mapped[str] = mapped_column(String, default="NORMAL", nullable=False)
    valorCausa: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    proximoPrazo: Mapped[Optional[datetime]] = mapped_column(PrismaDateTime, nullable=True)
    descricaoObjeto: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    clientId: Mapped[str] = mapped_column(
        String, ForeignKey("Client.id", ondelete="CASCADE"), nullable=False
    )
    advogadoId: Mapped[str] = mapped_column(
        String, ForeignKey("User.id"), nullable=False
    )
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utc_now, nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(
        PrismaDateTime, default=utc_now, onupdate=utc_now, nullable=False
    )

    client: Mapped[Optional["Client"]] = relationship(
        "Client", back_populates="processos", lazy="selectin"
    )
    advogado: Mapped[Optional["User"]] = relationship(
        "User", back_populates="processos", lazy="selectin"
    )
    movimentacoes: Mapped[List["ProcessMovement"]] = relationship(
        "ProcessMovement",
        back_populates="process",
        cascade="all, delete-orphan",
        order_by="desc(ProcessMovement.dataOcorrencia)",
        lazy="selectin",
    )
    documentos: Mapped[List["Document"]] = relationship(
        "Document", back_populates="process", lazy="selectin"
    )
    eventos: Mapped[List["CalendarEvent"]] = relationship(
        "CalendarEvent", back_populates="process", lazy="selectin"
    )
    mensagens: Mapped[List["InternalMessage"]] = relationship(
        "InternalMessage",
        back_populates="process",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def to_dict(self, include_relations: bool = True) -> Dict[str, Any]:
        data: Dict[str, Any] = {
            "id": self.id,
            "numeroCnj": self.numeroCnj,
            "titulo": self.titulo,
            "area": self.area,
            "orgaoJulgador": self.orgaoJulgador,
            "vara": self.vara,
            "comarca": self.comarca,
            "poloAtivo": self.poloAtivo,
            "poloPassivo": self.poloPassivo,
            "fase": self.fase,
            "status": self.status,
            "prioridade": self.prioridade,
            "valorCausa": float(self.valorCausa or 0.0),
            "proximoPrazo": to_iso(self.proximoPrazo),
            "descricaoObjeto": self.descricaoObjeto,
            "clientId": self.clientId,
            "advogadoId": self.advogadoId,
            "createdAt": to_iso(self.createdAt),
            "updatedAt": to_iso(self.updatedAt),
            "client": (
                {
                    "id": self.client.id,
                    "nome": self.client.nome,
                    "documento": self.client.documento,
                    "tipoPessoa": self.client.tipoPessoa,
                    "telefone": self.client.telefone,
                    "email": self.client.email,
                    "cidade": self.client.cidade,
                    "uf": self.client.uf,
                }
                if self.client
                else None
            ),
            "advogado": (
                {
                    "id": self.advogado.id,
                    "name": self.advogado.name,
                    "oab": self.advogado.oab,
                    "cargo": self.advogado.cargo,
                    "email": self.advogado.email,
                }
                if self.advogado
                else None
            ),
            "_count": {
                "movimentacoes": len(self.movimentacoes or []),
                "documentos": len(self.documentos or []),
                "eventos": len(self.eventos or []),
            },
        }
        if include_relations:
            data["movimentacoes"] = [m.to_dict() for m in (self.movimentacoes or [])]
            data["documentos"] = [d.to_dict(include_relations=False) for d in (self.documentos or [])]
            data["eventos"] = [e.to_dict(include_relations=False) for e in (self.eventos or [])]
            data["mensagens"] = [msg.to_dict(include_relations=False) for msg in (self.mensagens or [])]
        return data


class ProcessMovement(Base):
    __tablename__ = "ProcessMovement"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_id)
    processId: Mapped[str] = mapped_column(
        String, ForeignKey("LegalProcess.id", ondelete="CASCADE"), nullable=False
    )
    tipo: Mapped[str] = mapped_column(String, default="ANDAMENTO", nullable=False)
    titulo: Mapped[str] = mapped_column(String, nullable=False)
    descricao: Mapped[str] = mapped_column(Text, nullable=False)
    dataOcorrencia: Mapped[datetime] = mapped_column(PrismaDateTime, default=utc_now, nullable=False)
    prazoFatal: Mapped[Optional[datetime]] = mapped_column(PrismaDateTime, nullable=True)
    concluido: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    responsavelNome: Mapped[str] = mapped_column(String, nullable=False)
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utc_now, nullable=False)

    process: Mapped[Optional["LegalProcess"]] = relationship(
        "LegalProcess", back_populates="movimentacoes"
    )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "processId": self.processId,
            "tipo": self.tipo,
            "titulo": self.titulo,
            "descricao": self.descricao,
            "dataOcorrencia": to_iso(self.dataOcorrencia),
            "prazoFatal": to_iso(self.prazoFatal),
            "concluido": bool(self.concluido),
            "responsavelNome": self.responsavelNome,
            "createdAt": to_iso(self.createdAt),
        }


class CalendarEvent(Base):
    __tablename__ = "CalendarEvent"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_id)
    titulo: Mapped[str] = mapped_column(String, nullable=False)
    tipo: Mapped[str] = mapped_column(String, default="AUDIENCIA", nullable=False)
    descricao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    dataInicio: Mapped[datetime] = mapped_column(PrismaDateTime, nullable=False)
    dataFim: Mapped[Optional[datetime]] = mapped_column(PrismaDateTime, nullable=True)
    local: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="PENDENTE", nullable=False)
    processId: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("LegalProcess.id", ondelete="SET NULL"), nullable=True
    )
    clientId: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("Client.id", ondelete="SET NULL"), nullable=True
    )
    userId: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("User.id", ondelete="SET NULL"), nullable=True
    )
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utc_now, nullable=False)

    process: Mapped[Optional["LegalProcess"]] = relationship(
        "LegalProcess", back_populates="eventos", lazy="selectin"
    )
    client: Mapped[Optional["Client"]] = relationship(
        "Client", back_populates="eventos", lazy="selectin"
    )
    user: Mapped[Optional["User"]] = relationship(
        "User", back_populates="eventos", lazy="selectin"
    )

    def to_dict(self, include_relations: bool = True) -> Dict[str, Any]:
        data: Dict[str, Any] = {
            "id": self.id,
            "titulo": self.titulo,
            "tipo": self.tipo,
            "descricao": self.descricao,
            "dataInicio": to_iso(self.dataInicio),
            "dataFim": to_iso(self.dataFim),
            "local": self.local,
            "status": self.status,
            "processId": self.processId,
            "clientId": self.clientId,
            "userId": self.userId,
            "createdAt": to_iso(self.createdAt),
        }
        if include_relations:
            data["process"] = (
                {
                    "id": self.process.id,
                    "numeroCnj": self.process.numeroCnj,
                    "titulo": self.process.titulo,
                    "orgaoJulgador": self.process.orgaoJulgador,
                }
                if self.process
                else None
            )
            data["client"] = (
                {"id": self.client.id, "nome": self.client.nome}
                if self.client
                else None
            )
            data["user"] = (
                {"id": self.user.id, "name": self.user.name, "oab": self.user.oab}
                if self.user
                else None
            )
        return data


class Document(Base):
    __tablename__ = "Document"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_id)
    titulo: Mapped[str] = mapped_column(String, nullable=False)
    categoria: Mapped[str] = mapped_column(String, default="PETICAO_INICIAL", nullable=False)
    versao: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    nomeArquivo: Mapped[str] = mapped_column(String, nullable=False)
    tamanhoBytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    mimeType: Mapped[str] = mapped_column(String, default="text/plain", nullable=False)
    conteudoTexto: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    urlArquivo: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    processId: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("LegalProcess.id", ondelete="SET NULL"), nullable=True
    )
    clientId: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("Client.id", ondelete="SET NULL"), nullable=True
    )
    autorNome: Mapped[str] = mapped_column(String, nullable=False)
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utc_now, nullable=False)

    process: Mapped[Optional["LegalProcess"]] = relationship(
        "LegalProcess", back_populates="documentos", lazy="selectin"
    )
    client: Mapped[Optional["Client"]] = relationship(
        "Client", back_populates="documentos", lazy="selectin"
    )

    def to_dict(self, include_relations: bool = True) -> Dict[str, Any]:
        data: Dict[str, Any] = {
            "id": self.id,
            "titulo": self.titulo,
            "categoria": self.categoria,
            "versao": int(self.versao or 1),
            "nomeArquivo": self.nomeArquivo,
            "tamanhoBytes": int(self.tamanhoBytes or 0),
            "mimeType": self.mimeType,
            "conteudoTexto": self.conteudoTexto,
            "urlArquivo": self.urlArquivo,
            "processId": self.processId,
            "clientId": self.clientId,
            "autorNome": self.autorNome,
            "createdAt": to_iso(self.createdAt),
        }
        if include_relations:
            data["process"] = (
                {
                    "id": self.process.id,
                    "numeroCnj": self.process.numeroCnj,
                    "titulo": self.process.titulo,
                }
                if self.process
                else None
            )
            data["client"] = (
                {
                    "id": self.client.id,
                    "nome": self.client.nome,
                    "documento": self.client.documento,
                }
                if self.client
                else None
            )
        return data


class InternalMessage(Base):
    __tablename__ = "InternalMessage"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_id)
    canal: Mapped[str] = mapped_column(String, default="GERAL", nullable=False)
    conteudo: Mapped[str] = mapped_column(Text, nullable=False)
    autorId: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("User.id", ondelete="SET NULL"), nullable=True
    )
    autorNome: Mapped[str] = mapped_column(String, nullable=False)
    autorOab: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    processId: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("LegalProcess.id", ondelete="CASCADE"), nullable=True
    )
    fixada: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    createdAt: Mapped[datetime] = mapped_column(PrismaDateTime, default=utc_now, nullable=False)

    autor: Mapped[Optional["User"]] = relationship(
        "User", back_populates="mensagens", lazy="selectin"
    )
    process: Mapped[Optional["LegalProcess"]] = relationship(
        "LegalProcess", back_populates="mensagens", lazy="selectin"
    )

    def to_dict(self, include_relations: bool = True) -> Dict[str, Any]:
        data: Dict[str, Any] = {
            "id": self.id,
            "canal": self.canal,
            "conteudo": self.conteudo,
            "autorId": self.autorId,
            "autorNome": self.autorNome,
            "autorOab": self.autorOab,
            "processId": self.processId,
            "fixada": bool(self.fixada),
            "createdAt": to_iso(self.createdAt),
        }
        if include_relations:
            data["process"] = (
                {
                    "id": self.process.id,
                    "numeroCnj": self.process.numeroCnj,
                    "titulo": self.process.titulo,
                }
                if self.process
                else None
            )
        return data
