"""
Conteúdo do site público da MFV Advocacia (Sousa/PB).

Regra de integridade: só entra aqui o que o escritório publica em fonte oficial
(https://mfv.adv.br) ou que é dado cadastral público. A origem de cada item está em
conteudo.md. Não há depoimentos, resultados de causas, preços nem "diferenciais":
o Provimento 205/2021 da OAB limita esse tipo de publicidade na advocacia.
"""

from __future__ import annotations

from datetime import date
from typing import Dict, List, Optional, Tuple

ANO_FUNDACAO = 2015

# O site oficial afirma "mais de 32 áreas do Direito". Número do escritório, não contagem nossa.
MAIS_DE_N_AREAS = 32

# (endpoint do blueprint público, rótulo). Usado pelo cabeçalho e pelo rodapé.
NAVEGACAO_PUBLICA: List[Tuple[str, str]] = [
    ("publico.inicio", "Início"),
    ("publico.areas", "Áreas de atuação"),
    ("publico.escritorio", "O escritório"),
    ("publico.artigos", "Artigos"),
    ("publico.contato", "Contato"),
]

# Nomes das áreas: os oito que o site oficial exibe. As frases são definições neutras do que
# cada área do Direito abrange, escritas para este projeto; não descrevem resultados do escritório.
AREAS_DE_ATUACAO: List[Dict[str, str]] = [
    {
        "slug": "empresarial",
        "titulo": "Empresarial",
        "resumo": "Assessoria jurídica a empresas em diferentes estágios do negócio.",
    },
    {
        "slug": "trabalhista",
        "titulo": "Trabalhista",
        "resumo": "Relações entre empregadores e trabalhadores: orientação, prevenção e defesa de direitos.",
    },
    {
        "slug": "consumidor",
        "titulo": "Consumidor",
        "resumo": "Conflitos nas relações de consumo, envolvendo produtos e serviços.",
    },
    {
        "slug": "saude",
        "titulo": "Saúde",
        "resumo": "Questões jurídicas que envolvem planos de saúde, tratamentos e serviços de saúde.",
    },
    {
        "slug": "administrativo",
        "titulo": "Administrativo",
        "resumo": "Relações com a administração pública: processos, contratos e servidores.",
    },
    {
        "slug": "civil",
        "titulo": "Civil",
        "resumo": "Contratos, responsabilidade civil, propriedade e demais relações entre pessoas.",
    },
    {
        "slug": "familia-sucessoes",
        "titulo": "Família e Sucessões",
        "resumo": "Questões de família, como divórcio e guarda, e de sucessões, como inventário e herança.",
    },
    {
        "slug": "previdenciario",
        "titulo": "Previdenciário",
        "resumo": "Benefícios e direitos junto à Previdência Social.",
    },
]

# Manchetes do trilho cinematográfico da Home (padrão Framerate: a rolagem troca a manchete).
# Cada título tem duas linhas curtas, como pede o padrão; os textos reaproveitam frases já
# conferidas em conteudo.md (atuação, endereço e horário do site oficial; canais de contato).
MANCHETES_INICIO: List[Dict[str, object]] = [
    {
        "rotulo": "Atuação",
        "linhas": ["Para empresas", "e para pessoas."],
        "detalhe": (
            "Assessoria jurídica a empresas em diferentes estágios do negócio e atendimento "
            "a pessoas físicas, do consultivo ao contencioso."
        ),
    },
    {
        "rotulo": "Onde estamos",
        "linhas": ["No centro", "de Sousa."],
        "detalhe": (
            "Rua Lafaiete Píres Ferreira, 35, Centro. Atendimento por telefone e presencial de "
            "segunda a sexta-feira, das 07h30 às 12h00 e das 13h30 às 18h00."
        ),
    },
    {
        "rotulo": "Contato",
        "linhas": ["Fale com", "o escritório."],
        "detalhe": "WhatsApp, telefone, e-mail ou uma visita ao escritório, no horário de atendimento.",
    },
]

# Sócios-fundadores. Nome e OAB conferidos em fontes públicas (Diário Eletrônico da OAB e DJPB).
# Fotos individuais não são legendadas pelo escritório, então nenhuma foto é ligada a um nome.
SOCIOS_PUBLICOS: List[Dict[str, str]] = [
    {"nome": "Dra. Bárbara de Melo Fernandes Vasconcelos", "oab": "OAB/PB 19.571"},
    {"nome": "Dr. Higor Vasconcelos de Almeida", "oab": "OAB/PB 19.503"},
]

# Eventos e conteúdo que o site oficial anuncia. Sem datas: o escritório não publica agenda.
FRENTES_DE_CONTEUDO: List[Dict[str, str]] = [
    {
        "titulo": "Palestras e workshops",
        "texto": "O escritório promove encontros voltados ao público empresarial.",
        "url": "https://mfv.adv.br/#eventos",
    },
    {
        "titulo": "Blog",
        "texto": "Notícias publicadas pelo escritório no site oficial.",
        "url": "https://mfv.adv.br/blog/",
    },
    {
        "titulo": "MFV Cast",
        "texto": "Podcast do escritório.",
        "url": "https://mfv.adv.br/mfv-cast/",
    },
]


# Artigos publicados no blog oficial (https://mfv.adv.br/blog/). Títulos, datas e links conferidos em
# 11/11/2026 e copiados como o blog os publica (inclusive sem acento em "atuacao"). Sem resumos: o texto
# de alguns artigos traz promessas de resultado, que o site não repete (Provimento 205/2021 da OAB).
ARTIGOS_BLOG: List[Dict[str, str]] = [
    {
        "titulo": "Compliance empresarial: por onde começar",
        "data": "1 de março de 2026",
        "url": "https://mfv.adv.br/blog/compliance-empresarial-por-onde-comecar",
    },
    {
        "titulo": "Agenda de eventos 2026: atualização e mercado",
        "data": "10 de fevereiro de 2026",
        "url": "https://mfv.adv.br/blog/agenda-eventos-2026",
    },
    {
        "titulo": "Contratos essenciais para empresas: o básico bem feito",
        "data": "20 de janeiro de 2026",
        "url": "https://mfv.adv.br/blog/contratos-essenciais-para-empresas",
    },
    {
        "titulo": "MFV celebra 10 anos de atuacao",
        "data": "1 de agosto de 2025",
        "url": "https://mfv.adv.br/blog/mfv-10-anos",
    },
]


def anos_de_atuacao(hoje: Optional[date] = None) -> int:
    """Anos completos desde a instalação do escritório em Sousa (2015)."""
    referencia = hoje or date.today()
    return referencia.year - ANO_FUNDACAO
