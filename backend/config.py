"""
Configurações e dados institucionais reais e verificados do escritório
MFV Advocacia (Melo Fernandes & Vasconcelos - Advogados Associados) em Sousa - PB.

REGRA DE INTEGRIDADE:
Dados conferidos em fontes públicas em 06/11/2026: site oficial (mfv.adv.br), cadastro de CNPJ,
Diário Eletrônico da OAB e DJPB. Blocos marcados [NÃO VERIFICADO] não foram confirmados em fonte
oficial: ficam aqui apenas como apoio do sistema interno e NÃO são exibidos no site público.
A lista verificada do site público está em servicos/conteudo_publico.py (origens em conteudo.md).
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict, List

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_SQLITE_PATH = BASE_DIR / "prisma" / "dev.db"


def get_database_url() -> str:
    env_url = os.environ.get("PYTHON_DATABASE_URL") or os.environ.get("DATABASE_URL")
    if env_url and env_url.startswith("file:"):
        rel = env_url.replace("file:", "", 1).lstrip("./")
        resolved = (BASE_DIR / "prisma" / rel).resolve() if not (BASE_DIR / rel).exists() else (BASE_DIR / rel).resolve()
        return f"sqlite:///{resolved}"
    if env_url and env_url.startswith("sqlite:"):
        return env_url
    if env_url and env_url.startswith(("postgres://", "postgresql://", "postgresql+psycopg://")):
        # Render e Supabase entregam "postgres://" ou "postgresql://"; o SQLAlchemy 2 precisa do
        # driver explícito (psycopg 3). Não há fallback para SQLite aqui: uma URL de Postgres
        # inválida deve falhar alto, em vez de gravar num arquivo que a hospedagem apaga.
        return env_url.replace("postgres://", "postgresql://", 1).replace(
            "postgresql://", "postgresql+psycopg://", 1
        )
    return f"sqlite:///{DEFAULT_SQLITE_PATH}"


SECRET_KEY = os.environ.get(
    "PYTHON_SECRET_KEY",
    os.environ.get("NEXTAUTH_SECRET", "mfv-advocacia-sousa-pb-python-secret-key-2026"),
)
ACCESS_PIN = os.environ.get("MFV_ACCESS_PIN", "19571")
BACKEND_HOST = os.environ.get("PYTHON_BACKEND_HOST", "127.0.0.1")
BACKEND_PORT = int(os.environ.get("PYTHON_BACKEND_PORT", "5000"))

FIRM_DATA: Dict[str, Any] = {
    "nomeFantasia": "MFV Advocacia",
    "razaoSocial": "Melo Fernandes & Vasconcelos - Advogados Associados",
    "sigla": "MFV",
    "cnpj": "22.233.391/0001-27",
    # Site oficial: instalado em Sousa em 2015. O cadastro de CNPJ indica abertura em 18/03/2015.
    "fundacao": "2015",
    "naturezaJuridica": "Sociedade Simples Pura (223-2) — Sociedade de Advogados registrada na OAB/PB",
    "cnaePrincipal": "69.11-7-01 — Serviços advocatícios",
    "porte": "Demais — Sociedade de Advogados",
    "situacaoCadastral": "ATIVA",
    "endereco": {
        "logradouro": "Rua Lafaiete Píres Ferreira",
        "numero": "35",
        "bairro": "Centro",
        "cidade": "Sousa",
        "uf": "PB",
        "cep": "58800-510",
        "regiao": "Alto Sertão Paraibano — Comarca de Sousa/PB",
        "completo": "Rua Lafaiete Píres Ferreira, nº 35, Centro — Sousa/PB, CEP 58800-510",
    },
    "contatos": {
        "telefonePrincipal": "+55 (83) 98122-9292",
        "whatsappUrl": "https://api.whatsapp.com/send/?phone=5583981229292",
        "emailInstitucional": "contato@mfv.adv.br",
        "emailSocia": "barbara@mfv.adv.br",
        "website": "https://mfv.adv.br",
        "instagram": "@mfvadvogados",
        "instagramUrl": "https://instagram.com/mfvadvogados",
        "facebookUrl": "https://facebook.com/melofernandesevasconcelos",
        "mapaUrl": "https://www.google.com/maps/search/?api=1&query=R.+Lafaiete+P%C3%ADres+Ferreira%2C+35+-+Centro%2C+Sousa+-+PB",
        "horarioAtendimento": "Segunda a sexta-feira, das 07h30 às 12h00 e das 13h30 às 18h00",
    },
    "socios": [
        {
            "id": "socio-barbara-mfv",
            "nome": "Dra. Bárbara de Melo Fernandes Vasconcelos",
            "oab": "OAB/PB 19.571",
            "cargo": "Sócia-Fundadora e Administradora",
            "email": "barbara@mfv.adv.br",
            "role": "SOCIO",
            "atuacaoInstitucional": "",  # [NÃO VERIFICADO] cargo na OAB removido: não consta no site oficial
            "especialidades": [],  # [NÃO VERIFICADO] o escritório não publica áreas por sócio
            "bioVerificada": (
                "Sócia-fundadora da sociedade Melo Fernandes & Vasconcelos - Advogados Associados "
                "(MFV Advocacia) em Sousa/PB, inscrita na OAB/PB sob o nº 19.571."
            ),
        },
        {
            "id": "socio-higor-mfv",
            "nome": "Dr. Higor Vasconcelos de Almeida",
            "oab": "OAB/PB 19.503",
            "cargo": "Sócio-Fundador e Administrador",
            "email": "higor@mfv.adv.br",
            "role": "SOCIO",
            "atuacaoInstitucional": "",  # [NÃO VERIFICADO] cargo na OAB removido: não consta em fonte oficial
            "especialidades": [],  # [NÃO VERIFICADO] o escritório não publica áreas por sócio
            "bioVerificada": (
                "Sócio-fundador da sociedade Melo Fernandes & Vasconcelos - Advogados Associados "
                "(MFV Advocacia) em Sousa/PB, inscrito na OAB/PB sob o nº 19.503."
            ),
        },
    ],
    # [NÃO VERIFICADO] Descrições e "bases legais" abaixo foram escritas sem fonte do escritório
    # (algumas citam varas e tribunais). Não são exibidas no site público; ver servicos/conteudo_publico.py.
    "areasAtuacao": [
        {
            "codigo": "EMPRESARIAL",
            "titulo": "Direito Empresarial & Societário",
            "subtitulo": "Assessoria jurídica preventiva e contenciosa para empresas do Sertão Paraibano",
            "descricao": (
                "Estruturação societária, contratos mercantis, recuperação de crédito, governança "
                "e blindagem contratual para operações comerciais e industriais."
            ),
            "baseLegal": "Código Civil (Lei 10.406/2002) e Lei das Sociedades por Ações (Lei 6.404/1976)",
        },
        {
            "codigo": "TRABALHISTA",
            "titulo": "Direito do Trabalho (Vara do Trabalho de Sousa — TRT-13)",
            "subtitulo": "Defesa patronal, compliance trabalhista e reclamações trabalhistas",
            "descricao": (
                "Atuação estratégica perante a Vara do Trabalho de Sousa (TRT da 13ª Região), "
                "auditoria preventiva de passivos e negociações sindicais."
            ),
            "baseLegal": "CLT (Decreto-Lei 5.452/1943) e Jurisprudência do TRT-13 / TST",
        },
        {
            "codigo": "CIVEL",
            "titulo": "Direito Civil, Contratos & Responsabilidade Civil",
            "subtitulo": "Contencioso cível estratégico nas Varas Mistas da Comarca de Sousa — TJPB",
            "descricao": (
                "Ações indenizatórias, obrigações contratuais, posse e propriedade, execuções de "
                "títulos extrajudiciais e tutela de urgência."
            ),
            "baseLegal": "Código Civil (Lei 10.406/2002) e Código de Processo Civil (Lei 13.105/2015)",
        },
        {
            "codigo": "TRIBUTARIO_FEDERAL",
            "titulo": "Direito Tributário, Administrativo & Federal (TRF-5 / SJPB)",
            "subtitulo": "Atuação na 8ª Vara Federal — Subseção Judiciária de Sousa/PB",
            "descricao": (
                "Defesas em execuções fiscais, mandados de segurança, planejamento tributário "
                "e demandas perante a Justiça Federal (TRF-5)."
            ),
            "baseLegal": "Código Tributário Nacional (Lei 5.172/1966) e Constituição Federal/1988",
        },
        {
            "codigo": "PREVIDENCIARIO",
            "titulo": "Direito Previdenciário (JEF de Sousa — TRF-5)",
            "subtitulo": "Concessão, revisão e restabelecimento de benefícios no Juizado Especial Federal",
            "descricao": (
                "Atuação administrativa (INSS) e judicial perante a Subseção Judiciária de Sousa "
                "em aposentadorias, benefícios por incapacidade e benefícios rurais/urbanos."
            ),
            "baseLegal": "Lei 8.213/1991 e Lei 8.212/1991",
        },
        {
            "codigo": "CONSUMIDOR",
            "titulo": "Direito do Consumidor & Juizados Especiais",
            "subtitulo": "Juizado Especial Misto da Comarca de Sousa — TJPB",
            "descricao": (
                "Relações de consumo, práticas bancárias, negativação indevida e contencioso de "
                "volume para empresas e consumidores."
            ),
            "baseLegal": "Código de Defesa do Consumidor (Lei 8.078/1990) e Lei 9.099/1995",
        },
    ],
    # [NÃO VERIFICADO] Endereços e varas de órgãos públicos, sem conferência em fonte oficial.
    "orgaosJudiciaisSousa": [
        {
            "sigla": "TJPB — Comarca de Sousa",
            "nome": "Fórum Dr. José Mariz — Tribunal de Justiça da Paraíba",
            "unidades": [
                "1ª Vara Mista de Sousa",
                "2ª Vara Mista de Sousa",
                "3ª Vara Mista de Sousa",
                "4ª Vara Mista de Sousa",
                "5ª Vara Mista de Sousa",
                "6ª Vara Mista de Sousa",
                "7ª Vara Mista de Sousa",
                "Juizado Especial Misto de Sousa",
            ],
            "endereco": "Rua José Fagundes de Lira, Sousa/PB",
            "sistemaProcessual": "PJe 1º Grau — TJPB",
        },
        {
            "sigla": "TRT-13 — Vara do Trabalho de Sousa",
            "nome": "Fórum José Facundo — Tribunal Regional do Trabalho da 13ª Região",
            "unidades": ["Vara Única do Trabalho de Sousa"],
            "endereco": "Rua José Facundo de Lira, nº 30, Bairro Gato Preto, Sousa/PB — CEP 58802-180",
            "contatoOficial": "(83) 3522-2655 | vtsou@trt13.jus.br",
            "sistemaProcessual": "PJe — Justiça do Trabalho (TRT-13)",
        },
        {
            "sigla": "TRF-5 / SJPB — Subseção Judiciária de Sousa",
            "nome": "Fórum Desembargador Federal Paulo de Tarso Benevides Gadelha",
            "unidades": [
                "8ª Vara Federal da Seção Judiciária da Paraíba (Sousa)",
                "Juizado Especial Federal Adjunto à 8ª Vara Federal",
            ],
            "endereco": "Rua Francisco Vieira da Costa, nº 20, Bairro Maria Rachel, Sousa/PB — CEP 58805-345",
            "sistemaProcessual": "PJe — Justiça Federal da 5ª Região (TRF-5)",
        },
        {
            "sigla": "OAB/PB — Subseção de Sousa",
            "nome": "Ordem dos Advogados do Brasil — Subseção de Sousa/PB",
            "unidades": ["Sede da Subseção de Sousa/PB", "Sala da OAB nos Fóruns de Sousa"],
            "endereco": "Sousa/PB",
            "sistemaProcessual": "Peticionamento Institucional OAB/PB",
        },
    ],
}

INSTITUTIONAL_USERS_SEED: List[Dict[str, Any]] = [
    {
        "id": "socio-barbara-mfv",
        "name": "Dra. Bárbara de Melo Fernandes Vasconcelos",
        "email": "barbara@mfv.adv.br",
        "oab": "OAB/PB 19.571",
        "role": "SOCIO",
        "cargo": "Sócia-Fundadora e Administradora",
        "especialidade": "Direito Empresarial, Trabalhista e Cível",
        "telefone": "+55 (83) 98122-9292",
        "ativo": True,
    },
    {
        "id": "socio-higor-mfv",
        "name": "Dr. Higor Vasconcelos de Almeida",
        "email": "higor@mfv.adv.br",
        "oab": "OAB/PB 19.503",
        "role": "SOCIO",
        "cargo": "Sócio-Fundador e Administrador",
        "especialidade": "Contencioso Cível, Tributário e Previdenciário",
        "telefone": "+55 (83) 98122-9292",
        "ativo": True,
    },
    {
        "id": "secretaria-mfv",
        "name": "Secretaria Jurídica — MFV Advocacia",
        "email": "contato@mfv.adv.br",
        "oab": None,
        "role": "ASSISTENTE",
        "cargo": "Controladoria e Atendimento Jurídico",
        "especialidade": "Protocolo, PJe e Atendimento ao Cliente",
        "telefone": "+55 (83) 98122-9292",
        "ativo": True,
    },
]
