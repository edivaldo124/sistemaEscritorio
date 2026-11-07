"""
Esquemas de validação Pydantic v2 para a API Python da MFV Advocacia (Sousa - PB).
Segue as diretrizes OWASP Top 10:2025 / ASVS 5.0 (validação server-side estrita).
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class LoginRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    email: str = Field(..., min_length=3, max_length=160)
    pin: str = Field(..., min_length=3, max_length=64)


class ClientCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    nome: str = Field(..., min_length=3, max_length=180)
    tipoPessoa: Literal["PF", "PJ"] = "PF"
    documento: str = Field(..., min_length=11, max_length=25)
    rgOuIe: Optional[str] = None
    email: Optional[str] = None
    telefone: str = Field(..., min_length=8, max_length=40)
    whatsapp: Optional[str] = None
    endereco: Optional[str] = None
    cidade: str = "Sousa"
    uf: str = Field(default="PB", min_length=2, max_length=2)
    cep: str = "58800-510"
    profissaoOuRamo: Optional[str] = None
    estadoCivil: Optional[str] = None
    observacoes: Optional[str] = None
    status: Literal["ATIVO", "PROSPECTO", "ARQUIVADO"] = "ATIVO"

    @field_validator("nome", "documento", "telefone", mode="before")
    @classmethod
    def strip_text(cls, v: str) -> str:
        return v.strip() if isinstance(v, str) else v


class ClientUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    nome: Optional[str] = Field(default=None, min_length=3, max_length=180)
    tipoPessoa: Optional[Literal["PF", "PJ"]] = None
    documento: Optional[str] = Field(default=None, min_length=11, max_length=25)
    rgOuIe: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    whatsapp: Optional[str] = None
    endereco: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    cep: Optional[str] = None
    profissaoOuRamo: Optional[str] = None
    estadoCivil: Optional[str] = None
    observacoes: Optional[str] = None
    status: Optional[Literal["ATIVO", "PROSPECTO", "ARQUIVADO"]] = None


class ProcessCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    numeroCnj: str = Field(..., min_length=10, max_length=40)
    titulo: str = Field(..., min_length=5, max_length=240)
    area: str = Field(..., min_length=2, max_length=120)
    orgaoJulgador: str = Field(..., min_length=2, max_length=160)
    vara: str = Field(..., min_length=2, max_length=160)
    comarca: str = "Sousa - PB"
    poloAtivo: str = Field(..., min_length=2, max_length=180)
    poloPassivo: str = Field(..., min_length=2, max_length=180)
    fase: Literal[
        "CONHECIMENTO",
        "RECURSAL",
        "EXECUCAO",
        "CUMPRIMENTO_DE_SENTENCA",
        "CONSULTIVO",
        "ENCERRADO",
    ] = "CONHECIMENTO"
    status: Literal["ATIVO", "SUSPENSO", "URGENTE", "ARQUIVADO", "CONCLUIDO"] = "ATIVO"
    prioridade: Literal["NORMAL", "ALTA", "CRITICA"] = "NORMAL"
    valorCausa: float = 0.0
    proximoPrazo: Optional[str] = None
    descricaoObjeto: Optional[str] = None
    clientId: str = Field(..., min_length=2)
    advogadoId: str = Field(..., min_length=2)


class ProcessUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    titulo: Optional[str] = None
    area: Optional[str] = None
    orgaoJulgador: Optional[str] = None
    vara: Optional[str] = None
    comarca: Optional[str] = None
    poloAtivo: Optional[str] = None
    poloPassivo: Optional[str] = None
    fase: Optional[
        Literal[
            "CONHECIMENTO",
            "RECURSAL",
            "EXECUCAO",
            "CUMPRIMENTO_DE_SENTENCA",
            "CONSULTIVO",
            "ENCERRADO",
        ]
    ] = None
    status: Optional[Literal["ATIVO", "SUSPENSO", "URGENTE", "ARQUIVADO", "CONCLUIDO"]] = None
    prioridade: Optional[Literal["NORMAL", "ALTA", "CRITICA"]] = None
    valorCausa: Optional[float] = None
    proximoPrazo: Optional[str] = None
    descricaoObjeto: Optional[str] = None
    advogadoId: Optional[str] = None


class MovementCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    tipo: Literal[
        "ANDAMENTO",
        "PRAZO",
        "AUDIENCIA",
        "DECISAO",
        "PETICAO",
        "PUBLICACAO_DJE",
    ] = "ANDAMENTO"
    titulo: str = Field(..., min_length=3, max_length=200)
    descricao: str = Field(..., min_length=3)
    dataOcorrencia: Optional[str] = None
    prazoFatal: Optional[str] = None
    concluido: bool = False
    responsavelNome: str = "Dra. Bárbara de Melo Fernandes Vasconcelos (OAB/PB 19.571)"


class MovementUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    movementId: str = Field(..., min_length=2)
    concluido: bool


class EventCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    titulo: str = Field(..., min_length=3, max_length=200)
    tipo: Literal[
        "AUDIENCIA",
        "PRAZO_FATAL",
        "REUNIAO_CLIENTE",
        "SESSAO_JULGAMENTO",
        "DILIGENCIA",
    ] = "AUDIENCIA"
    descricao: Optional[str] = None
    dataInicio: str = Field(..., min_length=8)
    dataFim: Optional[str] = None
    local: str = "Sede MFV Advocacia — Rua Lafayette Pires Ferreira, 35, Centro, Sousa/PB"
    status: Literal["PENDENTE", "CONCLUIDO", "CANCELADO"] = "PENDENTE"
    processId: Optional[str] = None
    clientId: Optional[str] = None
    userId: Optional[str] = None


class EventUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., min_length=2)
    status: Optional[Literal["PENDENTE", "CONCLUIDO", "CANCELADO"]] = None
    titulo: Optional[str] = None
    local: Optional[str] = None
    dataInicio: Optional[str] = None


class DocumentCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    titulo: str = Field(..., min_length=3, max_length=220)
    categoria: Literal[
        "PROCURACAO",
        "CONTRATO_HONORARIOS",
        "DECLARACAO",
        "PETICAO_INICIAL",
        "CONTESTACAO",
        "RECURSO",
        "PARECER_EMPRESARIAL",
        "OUTRO",
    ] = "PROCURACAO"
    nomeArquivo: str = Field(..., min_length=3, max_length=240)
    tamanhoBytes: int = 0
    mimeType: str = "text/plain;charset=utf-8"
    conteudoTexto: Optional[str] = None
    urlArquivo: Optional[str] = None
    processId: Optional[str] = None
    clientId: Optional[str] = None
    autorNome: str = "Dra. Bárbara de Melo Fernandes Vasconcelos (OAB/PB 19.571)"


class MessageCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    canal: Literal["GERAL", "SOCIETARIO", "CONTENCIOSO", "PROCESSO"] = "GERAL"
    conteudo: str = Field(..., min_length=2, max_length=4000)
    autorId: Optional[str] = None
    autorNome: str = Field(..., min_length=2, max_length=160)
    autorOab: Optional[str] = None
    processId: Optional[str] = None
    fixada: bool = False


class MessageUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., min_length=2)
    fixada: bool


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str = Field(..., min_length=3, max_length=160)
    email: str = Field(..., min_length=5, max_length=160)
    oab: Optional[str] = None
    role: Literal["SOCIO", "ADVOGADO", "ASSISTENTE", "CLIENTE"] = "ADVOGADO"
    cargo: str = Field(..., min_length=2, max_length=120)
    especialidade: str = Field(..., min_length=2, max_length=200)
    telefone: Optional[str] = None


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., min_length=2)
    ativo: Optional[bool] = None
    role: Optional[Literal["SOCIO", "ADVOGADO", "ASSISTENTE", "CLIENTE"]] = None
    cargo: Optional[str] = None
    especialidade: Optional[str] = None
