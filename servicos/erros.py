"""Tratamento padronizado de erros HTTP e exceções da aplicação."""

from __future__ import annotations

from typing import Any

from flask import Flask, jsonify, render_template, request


def registrar_tratadores_de_erro(app: Flask) -> None:
    @app.errorhandler(404)
    def erro_404(_err: Any) -> Any:
        if request.path.startswith("/api/"):
            return jsonify({"error": "Recurso não encontrado na MFV Advocacia."}), 404
        return (
            render_template(
                "erro.html",
                codigo=404,
                titulo="Página não encontrada",
                mensagem="O endereço pode ter mudado ou ter sido digitado errado. Volte ao início ou fale com o escritório.",
            ),
            404,
        )

    @app.errorhandler(403)
    def erro_403(_err: Any) -> Any:
        if request.path.startswith("/api/"):
            return jsonify({"error": "Acesso negado (RBAC)."}), 403
        return (
            render_template(
                "erro.html",
                codigo=403,
                titulo="Acesso restrito à equipe",
                mensagem="Seu perfil não tem permissão para abrir esta área. Entre com outro perfil ou fale com um sócio.",
            ),
            403,
        )
