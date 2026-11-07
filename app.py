"""Ponto de entrada WSGI compativel com o padrao dos projetos do autor (SistemaEXTREMETEAM / Gunicorn)."""

from servidor import app

__all__ = ["app"]

if __name__ == "__main__":
    from config import BACKEND_HOST, BACKEND_PORT
    app.run(host=BACKEND_HOST, port=BACKEND_PORT, debug=False)
