"""
Testes do site público da MFV Advocacia (Início, Áreas de atuação, O escritório, Contato).

Verificam o que a atividade pede de um site multipágina: páginas distintas, navegação que funciona,
conteúdo coerente com o briefing e nenhuma informação inventada ou quebrada.
"""

from __future__ import annotations

import os
import re
import tempfile
import unittest
from html.parser import HTMLParser
from typing import List, Set
from unittest import mock
from urllib.parse import urlparse

from backend.database import get_engine
from servidor import criar_aplicacao

PAGINAS_PUBLICAS = ["/", "/inicio", "/areas-de-atuacao", "/escritorio", "/contato", "/termos", "/privacidade"]
PAGINAS_DE_CONTEUDO = ["/", "/areas-de-atuacao", "/escritorio", "/contato"]


class _ColetorDeLinks(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.destinos: Set[str] = set()

    def handle_starttag(self, tag: str, attrs: List[tuple]) -> None:
        for nome, valor in attrs:
            if nome in ("href", "src", "srcset") and valor:
                for parte in valor.split(","):
                    candidato = parte.strip().split(" ")[0]
                    if candidato.startswith("/") and not candidato.startswith("//"):
                        self.destinos.add(urlparse(candidato).path)


class SitePublicoTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.db_fd, self.db_path = tempfile.mkstemp(suffix=".db")
        self.app = criar_aplicacao(f"sqlite:///{self.db_path}")
        self.client = self.app.test_client()

    def tearDown(self) -> None:
        get_engine().dispose()
        os.close(self.db_fd)
        if os.path.exists(self.db_path):
            os.unlink(self.db_path)

    def _html(self, rota: str) -> str:
        resp = self.client.get(rota)
        self.assertEqual(resp.status_code, 200, rota)
        return resp.get_data(as_text=True)

    def test_paginas_publicas_respondem_e_compartilham_a_navegacao(self) -> None:
        for rota in PAGINAS_PUBLICAS:
            with self.subTest(rota=rota):
                html = self._html(rota)
                for destino in ("/areas-de-atuacao", "/escritorio", "/contato"):
                    self.assertIn(f'href="{destino}"', html)
                self.assertIn("<footer", html)

    def test_modo_publico_serve_so_o_site_e_bloqueia_o_sistema_interno(self) -> None:
        with mock.patch.dict(os.environ, {"MODO_PUBLICO": "true"}):
            cliente = criar_aplicacao(f"sqlite:///{self.db_path}").test_client()
        for rota in PAGINAS_PUBLICAS:
            with self.subTest(rota=rota):
                self.assertEqual(cliente.get(rota).status_code, 200)
        self.assertEqual(cliente.get("/static/css/tokens.css").status_code, 200)
        for rota in ("/api/health", "/api/clientes", "/api/usuarios", "/login", "/painel", "/clientes", "/processos"):
            with self.subTest(rota=rota):
                self.assertEqual(cliente.get(rota).status_code, 404)
        resposta = cliente.get("/api/clientes", headers={"X-MFV-Role": "SOCIO"})
        self.assertEqual(resposta.status_code, 404)
        self.assertEqual(cliente.post("/api/auth/login", json={"email": "barbara@mfv.adv.br", "pin": "19571"}).status_code, 404)

    def test_quatro_paginas_de_conteudo_sao_distintas(self) -> None:
        titulos = set()
        for rota in PAGINAS_DE_CONTEUDO:
            match = re.search(r"<title>(.*?)</title>", self._html(rota), re.S)
            self.assertIsNotNone(match, rota)
            titulos.add(match.group(1).strip())
        self.assertEqual(len(titulos), len(PAGINAS_DE_CONTEUDO))

    def test_todos_os_links_e_arquivos_internos_existem(self) -> None:
        for rota in PAGINAS_PUBLICAS:
            coletor = _ColetorDeLinks()
            coletor.feed(self._html(rota))
            for destino in sorted(coletor.destinos):
                with self.subTest(pagina=rota, destino=destino):
                    self.assertLess(self.client.get(destino).status_code, 400)

    def test_fatos_conferidos_aparecem_e_os_errados_nao(self) -> None:
        contato = self._html("/contato")
        for esperado in ("07h30", "13h30", "@mfvadvogados", "contato@mfv.adv.br", "58800-510", "98122-9292"):
            self.assertIn(esperado, contato)
        for errado in ("08h00", "14h00", "@mfvadvocacia", "8804-0135"):
            for rota in PAGINAS_PUBLICAS:
                self.assertNotIn(errado, self._html(rota), f"{errado!r} em {rota}")

    def test_socios_com_oab_conferida(self) -> None:
        html = self._html("/escritorio")
        self.assertIn("OAB/PB 19.571", html)
        self.assertIn("OAB/PB 19.503", html)

    def test_sem_marcas_de_template_quebrado(self) -> None:
        for rota in PAGINAS_PUBLICAS:
            html = self._html(rota)
            with self.subTest(rota=rota):
                self.assertNotIn("{{", html)
                self.assertNotIn("{%", html)
                self.assertNotRegex(html, r">\s*None\s*<")
                self.assertNotIn("undefined", html.lower())

    def test_conteudo_sem_promessa_de_resultado_nem_depoimento(self) -> None:
        proibidas = ("garantimos", "garantia de resultado", "melhor escritório", "100%", "depoimentos de clientes")
        for rota in PAGINAS_DE_CONTEUDO:
            texto = self._html(rota).lower()
            for termo in proibidas:
                self.assertNotIn(termo, texto, f"{termo!r} em {rota}")

    def test_login_nao_traz_credenciais_preenchidas(self) -> None:
        html = self._html("/login")
        self.assertNotIn("19.571", html)
        self.assertNotIn("barbara@mfv.adv.br", html)
        self.assertIn('type="password"', html)

    def test_pagina_de_erro_usa_o_layout_publico(self) -> None:
        resp = self.client.get("/essa-pagina-nao-existe")
        self.assertEqual(resp.status_code, 404)
        html = resp.get_data(as_text=True)
        self.assertIn("Página não encontrada", html)
        self.assertIn('href="/contato"', html)


if __name__ == "__main__":
    unittest.main()
