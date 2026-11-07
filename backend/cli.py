"""
Bridge WSGI CLI para executar requisições diretamente na aplicação Python Flask
(SQLAlchemy 2.0 + Pydantic v2) mesmo quando o servidor HTTP em :5000 não foi
iniciado separadamente.
"""

from __future__ import annotations

import json
import sys
from typing import Any, Dict

from backend.app import create_app


def main() -> int:
    if len(sys.argv) < 3:
        sys.stderr.write("Uso: python3 -m backend.cli <METHOD> <PATH_AND_QUERY> [JSON_BODY] [HEADERS_JSON]\n")
        return 1

    method = sys.argv[1].upper()
    path = sys.argv[2]
    body_raw = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else None
    headers_raw = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] else "{}"

    try:
        headers: Dict[str, Any] = json.loads(headers_raw)
    except Exception:
        headers = {}

    app = create_app()
    with app.test_client() as client:
        resp = client.open(
            path=path,
            method=method,
            data=body_raw.encode("utf-8") if body_raw else None,
            content_type="application/json" if body_raw else None,
            headers=headers,
        )
        output = {
            "status": resp.status_code,
            "headers": {
                "X-Powered-By-Backend": resp.headers.get(
                    "X-Powered-By-Backend", "Python-Flask-SQLAlchemy-MFV"
                ),
                "Set-Cookie": resp.headers.get("Set-Cookie"),
            },
            "body": resp.get_json(silent=True),
        }
        sys.stdout.write(json.dumps(output, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
