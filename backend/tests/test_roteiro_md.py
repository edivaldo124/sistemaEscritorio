"""
Trava dos arquivos .md do roteiro "Do briefing ao site multipágina com IA".

O que o professor pede em cada etapa vira uma verificação automática:
  - etapa 3: um único mapa do site, com pelo menos quatro páginas e quatro campos por página;
  - etapa 2: o briefing traz todas as seções pedidas;
  - etapa 5: o texto original do design-system.md não é alterado (só recebe extensões ao final);
  - etapa 4: os títulos, botões e rótulos das quatro páginas aparecem no conteudo.md;
  - os links entre os .md existem.

Se um destes testes falhar depois de uma mudança no site, atualize o .md correspondente.
"""

from __future__ import annotations

import hashlib
import os
import re
import tempfile
import unittest
from html.parser import HTMLParser
from pathlib import Path
from typing import List, Optional

from backend.database import get_engine
from servidor import criar_aplicacao

RAIZ = Path(__file__).resolve().parents[2]

ARQUIVOS_DO_ROTEIRO = ["briefing.md", "mapa-site.md", "conteudo.md", "design-system.md", "auditoria.md"]
ARQUIVOS_COM_LINKS = ARQUIVOS_DO_ROTEIRO + ["README.md", "AGENTS.md"]
PAGINAS = ["/", "/areas-de-atuacao", "/escritorio", "/artigos", "/contato"]
ROTAS_NO_MAPA = PAGINAS + ["/termos", "/privacidade", "/login"]
PASTAS_IGNORADAS = {
    "node_modules", ".git", ".next", ".agents", ".agent", ".claude", ".playwright-mcp", "__pycache__", ".venv", "venv",
}

# Texto original do design-system.md (referência baixada do Refero, 06/11/2026): o que vem antes das extensões.
DESIGN_SYSTEM_ORIGINAL_BYTES = 23247
DESIGN_SYSTEM_ORIGINAL_SHA256 = "64891f624893effe1c133903e7cea86726b48c2b4587e4c7efbc5213bf97ac30"

SECOES_DO_BRIEFING = [
    "Público-alvo",
    "Problema e necessidade",
    "Objetivo do site",
    "Proposta de valor",
    "Diferenciais",
    "CTA principal",
    "Personalidade da comunicação",
    "Materiais disponíveis",
]
CAMPOS_DO_MAPA = ["Função", "Seções", "Informação que deve aparecer", "Ação esperada"]

TAGS_ALVO = {"h1", "h2", "h3", "button"}
CLASSES_ALVO = {
    "botao", "link-seta", "rotulo", "palco__sub", "manchete__rotulo", "manchete__titulo", "manchete__detalhe",
    "medidor__rotulo", "afirmacao", "numero__rotulo", "indice__nome", "indice__resumo",
}
TAGS_SEM_FECHAMENTO = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
TAGS_SEM_TEXTO = {"script", "style", "svg"}


def _ler(nome: str) -> str:
    return (RAIZ / nome).read_text(encoding="utf-8")


def _normalizar(texto: str) -> str:
    """Tira a marcação do markdown e uniformiza espaços; o 'Há N anos' muda todo ano e não deve quebrar o teste."""
    texto = re.sub(r"[*`|]", " ", texto)
    texto = re.sub(r"Há \d+ anos", "Há N anos", texto)
    return " ".join(texto.split())


class _ColetorDeTextos(HTMLParser):
    """Junta o texto visível de títulos, botões, rótulos e frases de destaque de uma página."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._pilha: List[list] = []
        self._sem_texto = 0
        self.textos: List[str] = []

    def handle_starttag(self, tag: str, attrs: list) -> None:
        if tag in TAGS_SEM_FECHAMENTO:
            return
        classes = set((dict(attrs).get("class") or "").split())
        alvo = tag in TAGS_ALVO or bool(classes & CLASSES_ALVO)
        if tag in TAGS_SEM_TEXTO:
            self._sem_texto += 1
        self._pilha.append([tag, alvo, []])

    def handle_startendtag(self, tag: str, attrs: list) -> None:
        return

    def handle_endtag(self, tag: str) -> None:
        if tag in TAGS_SEM_FECHAMENTO:
            return
        while self._pilha:
            aberta, alvo, partes = self._pilha.pop()
            if alvo:
                texto = " ".join(" ".join(partes).split())
                if texto:
                    self.textos.append(texto)
            if aberta in TAGS_SEM_TEXTO:
                self._sem_texto -= 1
            if aberta == tag:
                break

    def handle_data(self, data: str) -> None:
        if self._sem_texto:
            return
        for item in self._pilha:
            if item[1]:
                item[2].append(data)


class RoteiroMdTestCase(unittest.TestCase):
    def test_os_arquivos_do_roteiro_existem(self) -> None:
        for nome in ARQUIVOS_DO_ROTEIRO:
            with self.subTest(arquivo=nome):
                self.assertTrue((RAIZ / nome).is_file(), nome)

    def test_existe_um_unico_mapa_do_site(self) -> None:
        achados = []
        for pasta, subpastas, arquivos in os.walk(RAIZ):
            subpastas[:] = [p for p in subpastas if p not in PASTAS_IGNORADAS]
            for arquivo in arquivos:
                if arquivo.lower().endswith(".md") and "mapa" in arquivo.lower():
                    achados.append(str((Path(pasta) / arquivo).relative_to(RAIZ)))
        self.assertEqual(achados, ["mapa-site.md"], "o roteiro pede um único mapa: o do site")

    def test_briefing_traz_as_secoes_pedidas_pelo_roteiro(self) -> None:
        texto = _ler("briefing.md")
        for secao in SECOES_DO_BRIEFING:
            with self.subTest(secao=secao):
                self.assertRegex(texto, rf"(?m)^##\s+{re.escape(secao)}")

    def test_mapa_tem_quatro_paginas_com_os_quatro_campos(self) -> None:
        texto = _ler("mapa-site.md")
        for campo in CAMPOS_DO_MAPA:
            with self.subTest(campo=campo):
                self.assertGreaterEqual(len(re.findall(rf"\*\*{re.escape(campo)}:\*\*", texto)), 4)
        for rota in ROTAS_NO_MAPA:
            with self.subTest(rota=rota):
                self.assertIn(rota, texto)

    def test_texto_original_do_design_system_continua_intacto(self) -> None:
        dados = (RAIZ / "design-system.md").read_bytes()
        self.assertGreaterEqual(len(dados), DESIGN_SYSTEM_ORIGINAL_BYTES)
        recorte = dados[:DESIGN_SYSTEM_ORIGINAL_BYTES]
        self.assertEqual(
            hashlib.sha256(recorte).hexdigest(),
            DESIGN_SYSTEM_ORIGINAL_SHA256,
            "o roteiro diz 'Não altere o DESIGN.md inicialmente': mudanças vão ao fim, como extensão datada",
        )

    def test_links_relativos_dos_md_existem(self) -> None:
        for nome in ARQUIVOS_COM_LINKS:
            for alvo in re.findall(r"\]\(([^)#\s]+)(?:#[^)]*)?\)", _ler(nome)):
                if alvo.startswith(("http://", "https://", "mailto:")):
                    continue
                with self.subTest(arquivo=nome, link=alvo):
                    self.assertTrue((RAIZ / alvo).exists())


class ConteudoCobreOSiteTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.db_fd, self.db_path = tempfile.mkstemp(suffix=".db")
        self.client = criar_aplicacao(f"sqlite:///{self.db_path}").test_client()

    def tearDown(self) -> None:
        get_engine().dispose()
        os.close(self.db_fd)
        if os.path.exists(self.db_path):
            os.unlink(self.db_path)

    def _textos_da_pagina(self, rota: str) -> List[str]:
        resposta = self.client.get(rota)
        self.assertEqual(resposta.status_code, 200, rota)
        coletor = _ColetorDeTextos()
        coletor.feed(resposta.get_data(as_text=True))
        return coletor.textos

    def test_titulos_botoes_e_rotulos_das_quatro_paginas_estao_no_conteudo_md(self) -> None:
        conteudo = _normalizar(_ler("conteudo.md"))
        for rota in PAGINAS:
            textos = self._textos_da_pagina(rota)
            self.assertGreater(len(textos), 5, f"a leitura da página {rota} não achou textos")
            faltando: List[Optional[str]] = [t for t in textos if _normalizar(t) not in conteudo]
            with self.subTest(pagina=rota):
                self.assertEqual(faltando, [], f"textos de {rota} que o conteudo.md não registra")


if __name__ == "__main__":
    unittest.main()
