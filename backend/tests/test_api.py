"""
Suíte de Testes Automatizados do Backend Python (Flask + SQLAlchemy 2.0 + Pydantic v2)
MFV Advocacia (Melo Fernandes & Vasconcelos - Advogados Associados) — Sousa/PB.
"""

from __future__ import annotations

import os
import tempfile
import unittest

from backend.database import get_engine
from servidor import criar_aplicacao


class MfvPythonBackendTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.db_fd, self.db_path = tempfile.mkstemp(suffix=".db")
        self.app = criar_aplicacao(f"sqlite:///{self.db_path}")
        self.client = self.app.test_client()

    def tearDown(self) -> None:
        get_engine().dispose()
        os.close(self.db_fd)
        if os.path.exists(self.db_path):
            os.unlink(self.db_path)

    def test_01_health_and_security_headers(self) -> None:
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.get_json()
        self.assertEqual(data["backend"], "python")
        self.assertEqual(data["cnpj"], "22.233.391/0001-27")
        self.assertEqual(data["nomeFantasia"], "MFV Advocacia")
        self.assertEqual(data["comarcaSede"], "Sousa - PB")
        self.assertEqual(data["usuariosInstitucionaisAtivos"], 3)
        # OWASP headers
        self.assertEqual(resp.headers.get("X-Content-Type-Options"), "nosniff")
        self.assertEqual(resp.headers.get("X-Frame-Options"), "DENY")
        self.assertEqual(
            resp.headers.get("X-Powered-By-Backend"),
            "Python-Flask-SQLAlchemy-MFV",
        )

    def test_02_verified_institutional_data_and_zero_fake_records(self) -> None:
        inst = self.client.get("/api/institucional").get_json()
        self.assertEqual(
            inst["razaoSocial"],
            "Melo Fernandes & Vasconcelos - Advogados Associados",
        )
        self.assertEqual(inst["endereco"]["cep"], "58800-510")
        oabs = [s["oab"] for s in inst["socios"]]
        self.assertIn("OAB/PB 19.571", oabs)
        self.assertIn("OAB/PB 19.503", oabs)

        # Banco recém-inicializado NÃO pode conter clientes ou processos inventados
        resumo = self.client.get("/api/resumo").get_json()
        self.assertEqual(resumo["metricas"]["totalClientes"], 0)
        self.assertEqual(resumo["metricas"]["totalProcessos"], 0)
        self.assertEqual(resumo["metricas"]["eventosPendentes"], 0)
        self.assertEqual(resumo["metricas"]["totalDocumentos"], 0)
        self.assertEqual(len(resumo["advogados"]), 3)

    def test_03_authentication_cookie_and_rbac_enforcement(self) -> None:
        bad_login = self.client.post(
            "/api/auth/login",
            json={"email": "barbara@mfv.adv.br", "pin": "00000"},
        )
        self.assertEqual(bad_login.status_code, 401)

        ok_login = self.client.post(
            "/api/auth/login",
            json={"email": "barbara@mfv.adv.br", "pin": "OAB/PB 19.571"},
        )
        self.assertEqual(ok_login.status_code, 200)
        login_data = ok_login.get_json()
        self.assertTrue(login_data["authenticated"])
        self.assertEqual(login_data["user"]["oab"], "OAB/PB 19.571")
        self.assertIn("mfv_py_session=", ok_login.headers.get("Set-Cookie", ""))

        # RBAC: Perfil ASSISTENTE não pode criar novos usuários institucionais
        forbidden = self.client.post(
            "/api/usuarios",
            headers={"X-MFV-Role": "ASSISTENTE"},
            json={
                "name": "Integrante Teste",
                "email": "teste@mfv.adv.br",
                "role": "ADVOGADO",
                "cargo": "Advogado Associado",
                "especialidade": "Direito Civil",
            },
        )
        self.assertEqual(forbidden.status_code, 403)

    def test_04_full_legal_workflow_crud(self) -> None:
        # 1. Cadastra cliente real durante uso do sistema
        cli_resp = self.client.post(
            "/api/clientes",
            json={
                "nome": "Empresa Sertão Comercial Ltda",
                "tipoPessoa": "PJ",
                "documento": "12.345.678/0001-99",
                "telefone": "(83) 98122-9292",
                "cidade": "Sousa",
                "uf": "PB",
                "cep": "58800-510",
            },
        )
        self.assertEqual(cli_resp.status_code, 201)
        cliente = cli_resp.get_json()
        client_id = cliente["id"]

        # 2. Cadastra processo judicial vinculado ao cliente e à Dra. Bárbara (OAB/PB 19.571)
        proc_resp = self.client.post(
            "/api/processos",
            json={
                "numeroCnj": "0801234-56.2026.8.15.0371",
                "titulo": "Ação de Execução de Título Extrajudicial",
                "area": "Direito Empresarial & Societário",
                "orgaoJulgador": "TJPB — Comarca de Sousa",
                "vara": "1ª Vara Mista de Sousa",
                "comarca": "Sousa - PB",
                "poloAtivo": "Empresa Sertão Comercial Ltda",
                "poloPassivo": "Devedor Contratual",
                "fase": "EXECUCAO",
                "status": "URGENTE",
                "prioridade": "ALTA",
                "valorCausa": 85000.0,
                "proximoPrazo": "2026-11-20T12:00:00Z",
                "clientId": client_id,
                "advogadoId": "socio-barbara-mfv",
            },
        )
        self.assertEqual(proc_resp.status_code, 201)
        processo = proc_resp.get_json()
        process_id = processo["id"]
        self.assertEqual(len(processo["movimentacoes"]), 1)

        # Verifica que o prazo gerou automaticamente um compromisso na Agenda Forense
        agenda = self.client.get("/api/agenda").get_json()
        self.assertEqual(len(agenda), 1)
        self.assertIn("0801234-56.2026.8.15.0371", agenda[0]["titulo"])

        # 3. Gera documento oficial 2 vezes para validar versionamento automático (v1 -> v2)
        doc_v1 = self.client.post(
            "/api/documentos",
            json={
                "titulo": "Procuração Ad Judicia — Empresa Sertão Comercial Ltda",
                "categoria": "PROCURACAO",
                "nomeArquivo": "procuracao_v1.txt",
                "conteudoTexto": "OUTORGANTE: Empresa Sertão Comercial Ltda...",
                "clientId": client_id,
                "processId": process_id,
            },
        ).get_json()
        self.assertEqual(doc_v1["versao"], 1)

        doc_v2 = self.client.post(
            "/api/documentos",
            json={
                "titulo": "Procuração Ad Judicia — Empresa Sertão Comercial Ltda",
                "categoria": "PROCURACAO",
                "nomeArquivo": "procuracao_v2.txt",
                "conteudoTexto": "OUTORGANTE: Empresa Sertão Comercial Ltda ( poderes especiais )...",
                "clientId": client_id,
                "processId": process_id,
            },
        ).get_json()
        self.assertEqual(doc_v2["versao"], 2)

        # 4. Registra despacho no mural interno (#PROCESSO)
        chat_resp = self.client.post(
            "/api/chat",
            json={
                "canal": "PROCESSO",
                "conteudo": "Protocolada petição inicial no PJe 1º Grau — Comarca de Sousa.",
                "autorId": "socio-barbara-mfv",
                "autorNome": "Dra. Bárbara de Melo Fernandes Vasconcelos",
                "autorOab": "OAB/PB 19.571",
                "processId": process_id,
                "fixada": True,
            },
        )
        self.assertEqual(chat_resp.status_code, 201)

    def test_05_blueprints_and_templates_organization(self) -> None:
        rotas_paginas = [
            "/",
            "/inicio",
            "/login",
            "/recuperar",
            "/minha-conta",
            "/config/perfil",
            "/painel",
            "/dashboard",
            "/clientes",
            "/clientes/novo",
            "/processos",
            "/processos/novo",
            "/agenda",
            "/agenda/calendario",
            "/agenda/eventos",
            "/documentos",
            "/documentos/lista",
            "/documentos/upload",
            "/relatorios",
            "/relatorios/gerar",
            "/relatorios/historico",
            "/chat",
            "/config",
            "/config/admin",
            "/equipe",
        ]
        for rota in rotas_paginas:
            with self.subTest(rota=rota):
                resp = self.client.get(rota)
                self.assertEqual(resp.status_code, 200)
                html = resp.get_data(as_text=True)
                self.assertIn("MFV Advocacia", html)


if __name__ == "__main__":
    unittest.main()
