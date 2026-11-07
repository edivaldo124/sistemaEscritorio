"""
Blueprint de autenticação: login, recuperação de acesso, minha conta e logout.
Segue o padrão de templates do SistemaEXTREMETEAM (login.html, recuperar.html, pgUsuario.html).
"""

from __future__ import annotations

from typing import Any

from flask import Blueprint, flash, make_response, redirect, render_template, request, url_for

from config import FIRM_DATA, INSTITUTIONAL_USERS_SEED
from servicos.autenticacao import (
    attach_session_cookie,
    authenticate_credentials,
    clear_session_cookie,
    create_session_token,
    resolve_current_user,
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["GET", "POST"])
def pagina_login() -> Any:
    if request.method == "POST":
        email = request.form.get("email", "")
        pin = request.form.get("pin", "")
        user_dict, erro = authenticate_credentials(email, pin)
        if erro or user_dict is None:
            flash(erro or "Credenciais inválidas.", "erro")
            return render_template(
                "auth/login.html",
                escritorio=FIRM_DATA,
                perfis=INSTITUTIONAL_USERS_SEED,
                erro=erro,
            ), 401
        token = create_session_token(user_dict)
        resp = make_response(redirect(url_for("admin.painel")))
        return attach_session_cookie(resp, token)

    return render_template(
        "auth/login.html",
        escritorio=FIRM_DATA,
        perfis=INSTITUTIONAL_USERS_SEED,
    )


@auth_bp.get("/recuperar")
def pagina_recuperar() -> Any:
    return render_template("auth/recuperar.html", escritorio=FIRM_DATA)


@auth_bp.get("/minha-conta")
@auth_bp.get("/config/perfil")
@auth_bp.get("/usuario")
def minha_conta() -> Any:
    usuario = resolve_current_user(request)
    return render_template(
        "auth/minha_conta.html",
        escritorio=FIRM_DATA,
        usuario_logado=usuario,
    )


@auth_bp.post("/logout")
def logout() -> Any:
    resp = make_response(redirect(url_for("auth.pagina_login")))
    return clear_session_cookie(resp)
