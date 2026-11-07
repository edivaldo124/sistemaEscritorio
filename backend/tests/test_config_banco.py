"""Testes da escolha da URL do banco e do tipo das colunas de data (SQLite local e Postgres)."""

from __future__ import annotations

import os
import unittest
from unittest import mock

from sqlalchemy.dialects import postgresql
from sqlalchemy.schema import CreateTable

from backend.config import get_database_url
from backend.models import Base, Client


def _url(**ambiente: str) -> str:
    limpo = {k: v for k, v in os.environ.items() if k not in ("PYTHON_DATABASE_URL", "DATABASE_URL")}
    limpo.update(ambiente)
    with mock.patch.dict(os.environ, limpo, clear=True):
        return get_database_url()


class UrlDoBancoTestCase(unittest.TestCase):
    def test_postgres_recebe_o_driver_psycopg(self) -> None:
        esperado = "postgresql+psycopg://u:s@host:5432/postgres"
        self.assertEqual(_url(DATABASE_URL="postgres://u:s@host:5432/postgres"), esperado)
        self.assertEqual(_url(DATABASE_URL="postgresql://u:s@host:5432/postgres"), esperado)
        self.assertEqual(_url(DATABASE_URL="postgresql+psycopg://u:s@host:5432/postgres"), esperado)

    def test_python_database_url_tem_prioridade(self) -> None:
        url = _url(PYTHON_DATABASE_URL="postgresql://a:b@x/y", DATABASE_URL="sqlite:///outro.db")
        self.assertTrue(url.startswith("postgresql+psycopg://a:b@x/y"))

    def test_sqlite_continua_funcionando(self) -> None:
        self.assertEqual(_url(DATABASE_URL="sqlite:///teste.db"), "sqlite:///teste.db")
        self.assertTrue(_url().startswith("sqlite:///"))


class ColunasDeDataTestCase(unittest.TestCase):
    def test_datas_em_milissegundos_cabem_no_postgres(self) -> None:
        ddl = str(CreateTable(Client.__table__).compile(dialect=postgresql.dialect()))
        self.assertIn('"createdAt" BIGINT NOT NULL', ddl)
        self.assertIn('"updatedAt" BIGINT NOT NULL', ddl)

    def test_nenhuma_coluna_de_data_usa_integer_de_32_bits(self) -> None:
        for tabela in Base.metadata.sorted_tables:
            for coluna in tabela.columns:
                if type(coluna.type).__name__ == "PrismaDateTime":
                    ddl = coluna.type.dialect_impl(postgresql.dialect()).compile(dialect=postgresql.dialect())
                    self.assertEqual(str(ddl), "BIGINT", f"{tabela.name}.{coluna.name}")


if __name__ == "__main__":
    unittest.main()
