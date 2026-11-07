"""Gerador de minutas jurídicas oficiais da MFV Advocacia (Sousa - PB)."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from config import FIRM_DATA


def gerar_minuta_oficial(
    categoria: str,
    cliente_nome: str,
    cliente_documento: str,
    cliente_endereco: Optional[str] = None,
    objeto_acao: Optional[str] = None,
) -> str:
    data_hoje = datetime.now().strftime("%d/%m/%Y")
    end_cli = cliente_endereco or "Sousa/PB"
    obj = objeto_acao or "defesa dos interesses jurídicos do(a) Outorgante perante as instâncias judiciais e administrativas competentes"

    if categoria == "CONTRATO_HONORARIOS":
        return (
            f"CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS E HONORÁRIOS\n\n"
            f"CONTRATANTE: {cliente_nome}, inscrito(a) no CPF/CNPJ sob o nº {cliente_documento}, "
            f"residente/sediado(a) em {end_cli}.\n\n"
            f"CONTRATADA: {FIRM_DATA['razaoSocial']} ({FIRM_DATA['nomeFantasia']}), sociedade de advogados "
            f"inscrita no CNPJ sob o nº {FIRM_DATA['cnpj']}, com sede na {FIRM_DATA['endereco']['completo']}, "
            f"neste ato representada por seus sócios-fundadores Dra. Bárbara de Melo Fernandes Vasconcelos "
            f"(OAB/PB 19.571) e Dr. Higor Vasconcelos de Almeida (OAB/PB 19.503).\n\n"
            f"CLÁUSULA PRIMEIRA — DO OBJETO:\n"
            f"O presente instrumento tem como objeto a prestação de serviços técnicos-jurídicos para {obj}.\n\n"
            f"CLÁUSULA SEGUNDA — DO FORO:\n"
            f"Fica eleito o Foro da Comarca de Sousa/PB para dirimir quaisquer dúvidas oriundas deste contrato.\n\n"
            f"Sousa - PB, {data_hoje}."
        )

    return (
        f"PROCURAÇÃO AD JUDICIA ET EXTRA\n\n"
        f"OUTORGANTE: {cliente_nome}, inscrito(a) no CPF/CNPJ sob o nº {cliente_documento}, "
        f"com endereço em {end_cli}.\n\n"
        f"OUTORGADOS: Dra. Bárbara de Melo Fernandes Vasconcelos (OAB/PB 19.571) e "
        f"Dr. Higor Vasconcelos de Almeida (OAB/PB 19.503), integrantes da sociedade "
        f"{FIRM_DATA['razaoSocial']} ({FIRM_DATA['nomeFantasia']}), inscrita no CNPJ sob o nº "
        f"{FIRM_DATA['cnpj']}, com endereço profissional na {FIRM_DATA['endereco']['completo']}.\n\n"
        f"PODERES: Amplos poderes para o foro em geral (cláusula ad judicia et extra), bem como poderes "
        f"especiais para confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar "
        f"ao direito sobre o qual se funda a ação, receber, dar quitação e firmar compromisso, "
        f"especialmente para {obj}.\n\n"
        f"Sousa - PB, {data_hoje}."
    )
