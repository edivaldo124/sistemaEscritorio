"""Filtros e formatadores de moeda, datas, documentos e fases processuais."""

from __future__ import annotations

import re
from datetime import datetime
from typing import Any


def formatar_moeda(valor: Any) -> str:
    try:
        num = float(valor or 0.0)
    except (TypeError, ValueError):
        num = 0.0
    texto = f"{num:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {texto}"


def formatar_data_hora(valor: Any) -> str:
    if not valor:
        return "—"
    if isinstance(valor, datetime):
        return valor.strftime("%d/%m/%Y %H:%M")
    raw = str(valor).strip()
    if raw.endswith("Z"):
        raw = raw[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(raw)
        return dt.strftime("%d/%m/%Y")
    except ValueError:
        return raw


def formatar_documento(doc: Any) -> str:
    digitos = re.sub(r"\D", "", str(doc or ""))
    if len(digitos) == 11:
        return f"{digitos[:3]}.{digitos[3:6]}.{digitos[6:9]}-{digitos[9:]}"
    if len(digitos) == 14:
        return (
            f"{digitos[:2]}.{digitos[2:5]}.{digitos[5:8]}/"
            f"{digitos[8:12]}-{digitos[12:]}"
        )
    return str(doc or "")


def formatar_cnj(cnj: Any) -> str:
    digitos = re.sub(r"\D", "", str(cnj or ""))
    if len(digitos) == 20:
        return (
            f"{digitos[:7]}-{digitos[7:9]}.{digitos[9:13]}."
            f"{digitos[13:14]}.{digitos[14:16]}.{digitos[16:20]}"
        )
    return str(cnj or "")


def rotulo_status_processo(status: Any) -> str:
    mapa = {
        "ATIVO": "Em tramitação",
        "URGENTE": "Urgente / Prazo Fatal",
        "SUSPENSO": "Suspenso / Sobrestado",
        "ARQUIVADO": "Arquivado",
        "CONCLUIDO": "Transitado em Julgado / Concluído",
    }
    return mapa.get(str(status or "").upper(), str(status or "Ativo"))


def rotulo_fase_processual(fase: Any) -> str:
    mapa = {
        "CONHECIMENTO": "Fase de Conhecimento",
        "RECURSAL": "Fase Recursal",
        "EXECUCAO": "Execução",
        "CUMPRIMENTO_DE_SENTENCA": "Cumprimento de Sentença",
        "CONSULTIVO": "Consultivo / Extrajudicial",
        "ENCERRADO": "Encerrado",
    }
    return mapa.get(str(fase or "").upper(), str(fase or "Conhecimento"))
