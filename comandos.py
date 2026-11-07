"""Comandos CLI Flask da MFV Advocacia (Sousa - PB)."""

from __future__ import annotations

import click
from flask import Flask

from backend.database import ensure_institutional_users, session_scope


def registrar_comandos(app: Flask) -> None:
    @app.cli.command("popular-institucional")
    def popular_institucional() -> None:
        """Garante os 3 perfis institucionais verificados da MFV Advocacia (zero dados fictícios)."""
        with session_scope() as session:
            ensure_institutional_users(session)
        click.echo(
            "Perfis institucionais verificados da MFV Advocacia (Sousa - PB) sincronizados com sucesso."
        )
