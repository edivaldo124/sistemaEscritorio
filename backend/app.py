"""
Servidor REST API em Python (Flask + SQLAlchemy 2.0 + Pydantic v2)
Sistema de Gestão Jurídica — MFV Advocacia (Melo Fernandes & Vasconcelos - Advogados Associados)
Sousa - PB | CNPJ 22.233.391/0001-27
"""

from __future__ import annotations

import platform
from typing import Any, Dict, List, Optional, Tuple

from flask import Flask, Response, jsonify, request
from pydantic import ValidationError
from sqlalchemy import desc, func, or_, select

from backend.auth import (
    attach_session_cookie,
    authenticate_credentials,
    clear_session_cookie,
    create_session_token,
    require_role,
    resolve_current_user,
)
from backend.config import BACKEND_HOST, BACKEND_PORT, FIRM_DATA, SECRET_KEY
from backend.database import configure_database, ensure_institutional_users, session_scope
from backend.models import (
    CalendarEvent,
    Client,
    Document,
    InternalMessage,
    LegalProcess,
    ProcessMovement,
    User,
    utc_now,
)
from backend.schemas import (
    ClientCreate,
    ClientUpdate,
    DocumentCreate,
    EventCreate,
    EventUpdate,
    LoginRequest,
    MessageCreate,
    MessageUpdate,
    MovementCreate,
    MovementUpdate,
    ProcessCreate,
    ProcessUpdate,
    UserCreate,
    UserUpdate,
)


def _format_validation_error(err: ValidationError) -> Dict[str, Any]:
    details = []
    for item in err.errors():
        loc = ".".join(str(part) for part in item.get("loc", []))
        details.append({"campo": loc, "mensagem": item.get("msg", "Valor inválido")})
    first_msg = details[0]["mensagem"] if details else "Dados de entrada inválidos."
    return {
        "error": f"Falha de validação nos dados informados: {first_msg}",
        "details": details,
    }


def create_app(database_url: Optional[str] = None) -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = SECRET_KEY
    app.config["JSON_AS_ASCII"] = False

    configure_database(database_url)

    with session_scope() as session:
        ensure_institutional_users(session)

    @app.after_request
    def apply_security_and_cors_headers(response: Response) -> Response:
        origin = request.headers.get("Origin", "http://localhost:3000")
        allowed_origins = {
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5000",
            "http://127.0.0.1:5000",
        }
        response.headers["Access-Control-Allow-Origin"] = (
            origin if origin in allowed_origins else "http://localhost:3000"
        )
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = (
            "Content-Type, Authorization, X-MFV-Role, X-MFV-User-Email, X-MFV-User-Name, X-MFV-User-Id, X-MFV-User-Oab"
        )
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, PUT, DELETE, OPTIONS"
        # Cabeçalhos de segurança OWASP ASVS 5.0
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-Powered-By-Backend"] = "Python-Flask-SQLAlchemy-MFV"
        return response

    @app.route("/api/<path:_any>", methods=["OPTIONS"])
    def handle_preflight(_any: str) -> Tuple[str, int]:
        return "", 204

    # =========================================================================
    # HEALTH & DADOS INSTITUCIONAIS (MFV ADVOCACIA — SOUSA/PB)
    # =========================================================================
    @app.get("/api/health")
    def healthcheck() -> Any:
        with session_scope() as session:
            ensure_institutional_users(session)
            total_users = session.scalar(select(func.count(User.id))) or 0
        return jsonify(
            {
                "status": "ok",
                "backend": "python",
                "framework": "Flask + SQLAlchemy 2.0 + Pydantic v2",
                "pythonVersion": platform.python_version(),
                "escritorio": FIRM_DATA["razaoSocial"],
                "nomeFantasia": FIRM_DATA["nomeFantasia"],
                "cnpj": FIRM_DATA["cnpj"],
                "comarcaSede": "Sousa - PB",
                "usuariosInstitucionaisAtivos": total_users,
            }
        )

    @app.get("/api/institucional")
    def get_institucional() -> Any:
        return jsonify(FIRM_DATA)

    # =========================================================================
    # AUTENTICAÇÃO & SESSÃO (HttpOnly Cookie + RBAC)
    # =========================================================================
    @app.post("/api/auth/login")
    def auth_login() -> Any:
        try:
            payload = LoginRequest.model_validate(request.get_json(silent=True) or {})
        except ValidationError as exc:
            return jsonify(_format_validation_error(exc)), 400

        user_dict, error_msg = authenticate_credentials(payload.email, payload.pin)
        if error_msg or user_dict is None:
            return jsonify({"error": error_msg or "Falha de autenticação."}), 401

        token = create_session_token(user_dict)
        resp = jsonify(
            {
                "authenticated": True,
                "backend": "python",
                "user": user_dict,
                "token": token,
            }
        )
        return attach_session_cookie(resp, token), 200

    @app.post("/api/auth/logout")
    def auth_logout() -> Any:
        resp = jsonify({"authenticated": False, "message": "Sessão encerrada com segurança."})
        return clear_session_cookie(resp), 200

    @app.get("/api/auth/me")
    def auth_me() -> Any:
        current = resolve_current_user(request)
        return jsonify({"authenticated": True, "backend": "python", "user": current})

    # =========================================================================
    # RESUMO EXECUTIVO & RELATÓRIOS (/api/resumo)
    # =========================================================================
    @app.get("/api/resumo")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE", "CLIENTE")
    def get_resumo() -> Any:
        with session_scope() as session:
            ensure_institutional_users(session)

            total_clientes = session.scalar(select(func.count(Client.id))) or 0
            total_processos = session.scalar(select(func.count(LegalProcess.id))) or 0
            processos_ativos = (
                session.scalar(
                    select(func.count(LegalProcess.id)).where(
                        LegalProcess.status.in_(["ATIVO", "URGENTE"])
                    )
                )
                or 0
            )
            processos_urgentes = (
                session.scalar(
                    select(func.count(LegalProcess.id)).where(
                        or_(
                            LegalProcess.status == "URGENTE",
                            LegalProcess.prioridade.in_(["ALTA", "CRITICA"]),
                        )
                    )
                )
                or 0
            )
            eventos_pendentes = (
                session.scalar(
                    select(func.count(CalendarEvent.id)).where(
                        CalendarEvent.status == "PENDENTE"
                    )
                )
                or 0
            )
            total_documentos = session.scalar(select(func.count(Document.id))) or 0
            valor_total_causas = (
                session.scalar(select(func.coalesce(func.sum(LegalProcess.valorCausa), 0.0)))
                or 0.0
            )

            all_processes = session.scalars(
                select(LegalProcess).order_by(desc(LegalProcess.updatedAt))
            ).all()

            area_counts: Dict[str, Dict[str, Any]] = {}
            orgao_counts: Dict[str, int] = {}
            for proc in all_processes:
                area_entry = area_counts.setdefault(
                    proc.area, {"area": proc.area, "total": 0, "valorTotal": 0.0}
                )
                area_entry["total"] += 1
                area_entry["valorTotal"] += float(proc.valorCausa or 0.0)
                orgao_counts[proc.orgaoJulgador] = orgao_counts.get(proc.orgaoJulgador, 0) + 1

            proximos_eventos = session.scalars(
                select(CalendarEvent)
                .where(CalendarEvent.status == "PENDENTE")
                .order_by(CalendarEvent.dataInicio.asc())
                .limit(8)
            ).all()

            clientes_recentes = session.scalars(
                select(Client).order_by(desc(Client.createdAt)).limit(6)
            ).all()

            advogados = session.scalars(
                select(User).where(User.ativo.is_(True)).order_by(User.name.asc())
            ).all()

            return jsonify(
                {
                    "backend": "python",
                    "metricas": {
                        "totalClientes": int(total_clientes),
                        "totalProcessos": int(total_processos),
                        "processosAtivos": int(processos_ativos),
                        "processosUrgentes": int(processos_urgentes),
                        "eventosPendentes": int(eventos_pendentes),
                        "totalDocumentos": int(total_documentos),
                        "valorTotalCausas": float(valor_total_causas),
                    },
                    "porArea": list(area_counts.values()),
                    "porOrgao": [
                        {"orgao": orgao, "total": total}
                        for orgao, total in orgao_counts.items()
                    ],
                    "processosRecentes": [
                        p.to_dict(include_relations=False) for p in all_processes[:6]
                    ],
                    "proximosEventos": [e.to_dict() for e in proximos_eventos],
                    "clientesRecentes": [
                        c.to_dict(include_relations=False) for c in clientes_recentes
                    ],
                    "advogados": [u.to_dict(include_counts=True) for u in advogados],
                }
            )

    # =========================================================================
    # CLIENTES (/api/clientes & /api/clientes/<id>)
    # =========================================================================
    @app.get("/api/clientes")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE", "CLIENTE")
    def list_clientes() -> Any:
        q = (request.args.get("q") or "").strip()
        status = (request.args.get("status") or "").strip()
        tipo = (request.args.get("tipoPessoa") or "").strip()

        with session_scope() as session:
            stmt = select(Client).order_by(desc(Client.createdAt))
            if status and status != "TODOS":
                stmt = stmt.where(Client.status == status)
            if tipo and tipo != "TODOS":
                stmt = stmt.where(Client.tipoPessoa == tipo)
            if q:
                like_q = f"%{q}%"
                stmt = stmt.where(
                    or_(
                        Client.nome.ilike(like_q),
                        Client.documento.ilike(like_q),
                        Client.email.ilike(like_q),
                        Client.telefone.ilike(like_q),
                        Client.cidade.ilike(like_q),
                    )
                )
            clientes = session.scalars(stmt).all()
            return jsonify([c.to_dict(include_relations=False) for c in clientes])

    @app.post("/api/clientes")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def create_cliente() -> Any:
        try:
            payload = ClientCreate.model_validate(request.get_json(silent=True) or {})
        except ValidationError as exc:
            return jsonify(_format_validation_error(exc)), 400

        with session_scope() as session:
            dup = session.scalar(
                select(Client).where(Client.documento == payload.documento)
            )
            if dup is not None:
                return (
                    jsonify(
                        {
                            "error": f"Já existe um cliente cadastrado com o CPF/CNPJ {payload.documento}."
                        }
                    ),
                    409,
                )

            novo = Client(
                nome=payload.nome,
                tipoPessoa=payload.tipoPessoa,
                documento=payload.documento,
                rgOuIe=payload.rgOuIe,
                email=payload.email,
                telefone=payload.telefone,
                whatsapp=payload.whatsapp or payload.telefone,
                endereco=payload.endereco,
                cidade=payload.cidade or "Sousa",
                uf=(payload.uf or "PB").upper(),
                cep=payload.cep or "58800-510",
                profissaoOuRamo=payload.profissaoOuRamo,
                estadoCivil=payload.estadoCivil,
                observacoes=payload.observacoes,
                status=payload.status,
            )
            session.add(novo)
            session.flush()
            return jsonify(novo.to_dict()), 201

    @app.get("/api/clientes/<client_id>")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE", "CLIENTE")
    def get_cliente(client_id: str) -> Any:
        with session_scope() as session:
            cliente = session.get(Client, client_id)
            if cliente is None:
                return jsonify({"error": "Cliente não encontrado."}), 404
            return jsonify(cliente.to_dict(include_relations=True))

    @app.patch("/api/clientes/<client_id>")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def update_cliente(client_id: str) -> Any:
        try:
            payload = ClientUpdate.model_validate(request.get_json(silent=True) or {})
        except ValidationError as exc:
            return jsonify(_format_validation_error(exc)), 400

        with session_scope() as session:
            cliente = session.get(Client, client_id)
            if cliente is None:
                return jsonify({"error": "Cliente não encontrado."}), 404

            updates = payload.model_dump(exclude_unset=True)
            for field, val in updates.items():
                setattr(cliente, field, val)
            cliente.updatedAt = utc_now()
            session.flush()
            return jsonify(cliente.to_dict(include_relations=True))

    @app.delete("/api/clientes/<client_id>")
    @require_role("SOCIO", "ADVOGADO")
    def delete_cliente(client_id: str) -> Any:
        with session_scope() as session:
            cliente = session.get(Client, client_id)
            if cliente is None:
                return jsonify({"error": "Cliente não encontrado."}), 404
            session.delete(cliente)
            return jsonify({"deleted": True, "id": client_id})

    # =========================================================================
    # PROCESSOS JUDICIAIS & MOVIMENTAÇÕES (/api/processos)
    # =========================================================================
    @app.get("/api/processos")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE", "CLIENTE")
    def list_processos() -> Any:
        q = (request.args.get("q") or "").strip()
        status = (request.args.get("status") or "").strip()
        area = (request.args.get("area") or "").strip()
        client_id = (request.args.get("clientId") or "").strip()

        with session_scope() as session:
            stmt = select(LegalProcess).order_by(desc(LegalProcess.updatedAt))
            if status and status != "TODOS":
                stmt = stmt.where(LegalProcess.status == status)
            if area and area != "TODAS":
                stmt = stmt.where(LegalProcess.area == area)
            if client_id:
                stmt = stmt.where(LegalProcess.clientId == client_id)
            if q:
                like_q = f"%{q}%"
                stmt = stmt.where(
                    or_(
                        LegalProcess.numeroCnj.ilike(like_q),
                        LegalProcess.titulo.ilike(like_q),
                        LegalProcess.poloAtivo.ilike(like_q),
                        LegalProcess.poloPassivo.ilike(like_q),
                        LegalProcess.orgaoJulgador.ilike(like_q),
                        LegalProcess.vara.ilike(like_q),
                    )
                )
            processos = session.scalars(stmt).all()
            return jsonify([p.to_dict(include_relations=True) for p in processos])

    @app.post("/api/processos")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def create_processo() -> Any:
        try:
            payload = ProcessCreate.model_validate(request.get_json(silent=True) or {})
        except ValidationError as exc:
            return jsonify(_format_validation_error(exc)), 400

        with session_scope() as session:
            ensure_institutional_users(session)
            dup = session.scalar(
                select(LegalProcess).where(LegalProcess.numeroCnj == payload.numeroCnj)
            )
            if dup is not None:
                return (
                    jsonify(
                        {
                            "error": f"Já existe um processo cadastrado com a numeração CNJ {payload.numeroCnj}."
                        }
                    ),
                    409,
                )

            cliente = session.get(Client, payload.clientId)
            if cliente is None:
                return jsonify({"error": "Cliente vinculado não encontrado."}), 404

            advogado = session.get(User, payload.advogadoId)
            if advogado is None:
                advogado = session.scalar(select(User).order_by(User.createdAt.asc()))
                if advogado is None:
                    return jsonify({"error": "Advogado responsável não encontrado."}), 404

            novo_proc = LegalProcess(
                numeroCnj=payload.numeroCnj.strip(),
                titulo=payload.titulo.strip(),
                area=payload.area,
                orgaoJulgador=payload.orgaoJulgador,
                vara=payload.vara,
                comarca=payload.comarca or "Sousa - PB",
                poloAtivo=payload.poloAtivo,
                poloPassivo=payload.poloPassivo,
                fase=payload.fase,
                status=payload.status,
                prioridade=payload.prioridade,
                valorCausa=float(payload.valorCausa or 0.0),
                proximoPrazo=payload.proximoPrazo if payload.proximoPrazo else None,
                descricaoObjeto=payload.descricaoObjeto,
                clientId=cliente.id,
                advogadoId=advogado.id,
            )
            session.add(novo_proc)
            session.flush()

            resp_label = (
                f"{advogado.name} ({advogado.oab})" if advogado.oab else advogado.name
            )
            mov_inicial = ProcessMovement(
                processId=novo_proc.id,
                tipo="ANDAMENTO",
                titulo="Cadastro e Autuação Interna no Sistema MFV Advocacia",
                descricao=(
                    f"Processo autuado sob responsabilidade de {resp_label} "
                    f"perante {novo_proc.orgaoJulgador} ({novo_proc.vara})."
                ),
                prazoFatal=payload.proximoPrazo if payload.proximoPrazo else None,
                concluido=True,
                responsavelNome=resp_label,
            )
            session.add(mov_inicial)

            if payload.proximoPrazo:
                evento_prazo = CalendarEvent(
                    titulo=f"Prazo Processual — {novo_proc.numeroCnj}",
                    tipo="PRAZO_FATAL",
                    descricao=f"Prazo referente ao processo '{novo_proc.titulo}' ({novo_proc.vara}).",
                    dataInicio=payload.proximoPrazo,
                    local=f"{novo_proc.orgaoJulgador} — {novo_proc.vara}",
                    status="PENDENTE",
                    processId=novo_proc.id,
                    clientId=cliente.id,
                    userId=advogado.id,
                )
                session.add(evento_prazo)

            session.flush()
            session.refresh(novo_proc)
            return jsonify(novo_proc.to_dict(include_relations=True)), 201

    @app.get("/api/processos/<process_id>")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE", "CLIENTE")
    def get_processo(process_id: str) -> Any:
        with session_scope() as session:
            proc = session.get(LegalProcess, process_id)
            if proc is None:
                return jsonify({"error": "Processo não encontrado."}), 404
            return jsonify(proc.to_dict(include_relations=True))

    @app.patch("/api/processos/<process_id>")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def update_processo(process_id: str) -> Any:
        try:
            payload = ProcessUpdate.model_validate(request.get_json(silent=True) or {})
        except ValidationError as exc:
            return jsonify(_format_validation_error(exc)), 400

        with session_scope() as session:
            proc = session.get(LegalProcess, process_id)
            if proc is None:
                return jsonify({"error": "Processo não encontrado."}), 404

            updates = payload.model_dump(exclude_unset=True)
            for field, val in updates.items():
                setattr(proc, field, val)
            proc.updatedAt = utc_now()
            session.flush()
            session.refresh(proc)
            return jsonify(proc.to_dict(include_relations=True))

    @app.delete("/api/processos/<process_id>")
    @require_role("SOCIO", "ADVOGADO")
    def delete_processo(process_id: str) -> Any:
        with session_scope() as session:
            proc = session.get(LegalProcess, process_id)
            if proc is None:
                return jsonify({"error": "Processo não encontrado."}), 404
            session.delete(proc)
            return jsonify({"deleted": True, "id": process_id})

    @app.post("/api/processos/<process_id>/movimentacoes")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def create_movimentacao(process_id: str) -> Any:
        try:
            payload = MovementCreate.model_validate(request.get_json(silent=True) or {})
        except ValidationError as exc:
            return jsonify(_format_validation_error(exc)), 400

        with session_scope() as session:
            proc = session.get(LegalProcess, process_id)
            if proc is None:
                return jsonify({"error": "Processo não encontrado."}), 404

            mov = ProcessMovement(
                processId=proc.id,
                tipo=payload.tipo,
                titulo=payload.titulo,
                descricao=payload.descricao,
                dataOcorrencia=payload.dataOcorrencia if payload.dataOcorrencia else utc_now(),
                prazoFatal=payload.prazoFatal if payload.prazoFatal else None,
                concluido=payload.concluido,
                responsavelNome=payload.responsavelNome,
            )
            session.add(mov)

            if payload.prazoFatal:
                proc.proximoPrazo = payload.prazoFatal  # type: ignore[assignment]
                evento = CalendarEvent(
                    titulo=f"[{payload.tipo}] {payload.titulo} — {proc.numeroCnj}",
                    tipo="AUDIENCIA" if payload.tipo == "AUDIENCIA" else "PRAZO_FATAL",
                    descricao=payload.descricao,
                    dataInicio=payload.prazoFatal,
                    local=f"{proc.orgaoJulgador} — {proc.vara}",
                    status="PENDENTE",
                    processId=proc.id,
                    clientId=proc.clientId,
                    userId=proc.advogadoId,
                )
                session.add(evento)

            proc.updatedAt = utc_now()
            session.flush()
            return jsonify(mov.to_dict()), 201

    @app.patch("/api/processos/<process_id>/movimentacoes")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def update_movimentacao(process_id: str) -> Any:
        try:
            payload = MovementUpdate.model_validate(request.get_json(silent=True) or {})
        except ValidationError as exc:
            return jsonify(_format_validation_error(exc)), 400

        with session_scope() as session:
            mov = session.get(ProcessMovement, payload.movementId)
            if mov is None or mov.processId != process_id:
                return jsonify({"error": "Movimentação processual não encontrada."}), 404
            mov.concluido = payload.concluido
            session.flush()
            return jsonify(mov.to_dict())

    # =========================================================================
    # AGENDA & PRAZOS JUDICIAIS (/api/agenda)
    # =========================================================================
    @app.get("/api/agenda")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE", "CLIENTE")
    def list_agenda() -> Any:
        status = (request.args.get("status") or "").strip()
        tipo = (request.args.get("tipo") or "").strip()

        with session_scope() as session:
            stmt = select(CalendarEvent).order_by(CalendarEvent.dataInicio.asc())
            if status and status != "TODOS":
                stmt = stmt.where(CalendarEvent.status == status)
            if tipo and tipo != "TODOS":
                stmt = stmt.where(CalendarEvent.tipo == tipo)
            eventos = session.scalars(stmt).all()
            return jsonify([e.to_dict() for e in eventos])

    @app.post("/api/agenda")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def create_agenda() -> Any:
        try:
            payload = EventCreate.model_validate(request.get_json(silent=True) or {})
        except ValidationError as exc:
            return jsonify(_format_validation_error(exc)), 400

        with session_scope() as session:
            evento = CalendarEvent(
                titulo=payload.titulo,
                tipo=payload.tipo,
                descricao=payload.descricao,
                dataInicio=payload.dataInicio,
                dataFim=payload.dataFim if payload.dataFim else None,
                local=payload.local,
                status=payload.status,
                processId=payload.processId or None,
                clientId=payload.clientId or None,
                userId=payload.userId or None,
            )
            session.add(evento)
            session.flush()
            session.refresh(evento)
            return jsonify(evento.to_dict()), 201

    @app.patch("/api/agenda")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def update_agenda() -> Any:
        try:
            payload = EventUpdate.model_validate(request.get_json(silent=True) or {})
        except ValidationError as exc:
            return jsonify(_format_validation_error(exc)), 400

        with session_scope() as session:
            evento = session.get(CalendarEvent, payload.id)
            if evento is None:
                return jsonify({"error": "Compromisso não encontrado."}), 404
            if payload.status is not None:
                evento.status = payload.status
            if payload.titulo is not None:
                evento.titulo = payload.titulo
            if payload.local is not None:
                evento.local = payload.local
            if payload.dataInicio is not None:
                evento.dataInicio = payload.dataInicio  # type: ignore[assignment]
            session.flush()
            session.refresh(evento)
            return jsonify(evento.to_dict())

    @app.delete("/api/agenda")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def delete_agenda() -> Any:
        event_id = (request.args.get("id") or "").strip()
        if not event_id:
            return jsonify({"error": "ID do compromisso é obrigatório."}), 400
        with session_scope() as session:
            evento = session.get(CalendarEvent, event_id)
            if evento is None:
                return jsonify({"error": "Compromisso não encontrado."}), 404
            session.delete(evento)
            return jsonify({"deleted": True, "id": event_id})

    # =========================================================================
    # DOCUMENTOS & TEMPLATES COM VERSIONAMENTO (/api/documentos)
    # =========================================================================
    @app.get("/api/documentos")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE", "CLIENTE")
    def list_documentos() -> Any:
        categoria = (request.args.get("categoria") or "").strip()
        client_id = (request.args.get("clientId") or "").strip()
        process_id = (request.args.get("processId") or "").strip()

        with session_scope() as session:
            stmt = select(Document).order_by(desc(Document.createdAt))
            if categoria and categoria != "TODAS":
                stmt = stmt.where(Document.categoria == categoria)
            if client_id:
                stmt = stmt.where(Document.clientId == client_id)
            if process_id:
                stmt = stmt.where(Document.processId == process_id)
            docs = session.scalars(stmt).all()
            return jsonify([d.to_dict() for d in docs])

    @app.post("/api/documentos")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def create_documento() -> Any:
        try:
            payload = DocumentCreate.model_validate(request.get_json(silent=True) or {})
        except ValidationError as exc:
            return jsonify(_format_validation_error(exc)), 400

        with session_scope() as session:
            stmt = select(Document).where(Document.titulo == payload.titulo)
            if payload.clientId:
                stmt = stmt.where(Document.clientId == payload.clientId)
            else:
                stmt = stmt.where(Document.clientId.is_(None))
            if payload.processId:
                stmt = stmt.where(Document.processId == payload.processId)
            else:
                stmt = stmt.where(Document.processId.is_(None))

            ultimo = session.scalar(stmt.order_by(desc(Document.versao)))
            proxima_versao = (ultimo.versao + 1) if ultimo is not None else 1

            conteudo = payload.conteudoTexto or ""
            tamanho = payload.tamanhoBytes or len(conteudo.encode("utf-8"))

            doc = Document(
                titulo=payload.titulo,
                categoria=payload.categoria,
                versao=proxima_versao,
                nomeArquivo=payload.nomeArquivo,
                tamanhoBytes=tamanho,
                mimeType=payload.mimeType,
                conteudoTexto=payload.conteudoTexto,
                urlArquivo=payload.urlArquivo,
                processId=payload.processId or None,
                clientId=payload.clientId or None,
                autorNome=payload.autorNome,
            )
            session.add(doc)
            session.flush()
            session.refresh(doc)
            return jsonify(doc.to_dict()), 201

    @app.delete("/api/documentos")
    @require_role("SOCIO", "ADVOGADO")
    def delete_documento() -> Any:
        doc_id = (request.args.get("id") or "").strip()
        if not doc_id:
            return jsonify({"error": "ID do documento é obrigatório."}), 400
        with session_scope() as session:
            doc = session.get(Document, doc_id)
            if doc is None:
                return jsonify({"error": "Documento não encontrado."}), 404
            session.delete(doc)
            return jsonify({"deleted": True, "id": doc_id})

    # =========================================================================
    # COMUNICAÇÃO INTERNA & MURAL (/api/chat)
    # =========================================================================
    @app.get("/api/chat")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def list_chat() -> Any:
        canal = (request.args.get("canal") or "").strip()
        process_id = (request.args.get("processId") or "").strip()

        with session_scope() as session:
            stmt = select(InternalMessage).order_by(
                desc(InternalMessage.fixada), desc(InternalMessage.createdAt)
            )
            if canal and canal != "TODOS":
                stmt = stmt.where(InternalMessage.canal == canal)
            if process_id:
                stmt = stmt.where(InternalMessage.processId == process_id)
            msgs = session.scalars(stmt).all()
            return jsonify([m.to_dict() for m in msgs])

    @app.post("/api/chat")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def create_chat() -> Any:
        try:
            payload = MessageCreate.model_validate(request.get_json(silent=True) or {})
        except ValidationError as exc:
            return jsonify(_format_validation_error(exc)), 400

        with session_scope() as session:
            msg = InternalMessage(
                canal=payload.canal,
                conteudo=payload.conteudo,
                autorId=payload.autorId or None,
                autorNome=payload.autorNome,
                autorOab=payload.autorOab,
                processId=payload.processId or None,
                fixada=payload.fixada,
            )
            session.add(msg)
            session.flush()
            session.refresh(msg)
            return jsonify(msg.to_dict()), 201

    @app.patch("/api/chat")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def update_chat() -> Any:
        try:
            payload = MessageUpdate.model_validate(request.get_json(silent=True) or {})
        except ValidationError as exc:
            return jsonify(_format_validation_error(exc)), 400

        with session_scope() as session:
            msg = session.get(InternalMessage, payload.id)
            if msg is None:
                return jsonify({"error": "Mensagem não encontrada."}), 404
            msg.fixada = payload.fixada
            session.flush()
            session.refresh(msg)
            return jsonify(msg.to_dict())

    @app.delete("/api/chat")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def delete_chat() -> Any:
        msg_id = (request.args.get("id") or "").strip()
        if not msg_id:
            return jsonify({"error": "ID da mensagem é obrigatório."}), 400
        with session_scope() as session:
            msg = session.get(InternalMessage, msg_id)
            if msg is None:
                return jsonify({"error": "Mensagem não encontrada."}), 404
            session.delete(msg)
            return jsonify({"deleted": True, "id": msg_id})

    # =========================================================================
    # USUÁRIOS & PERFIS RBAC (/api/usuarios)
    # =========================================================================
    @app.get("/api/usuarios")
    @require_role("SOCIO", "ADVOGADO", "ASSISTENTE")
    def list_usuarios() -> Any:
        with session_scope() as session:
            ensure_institutional_users(session)
            users = session.scalars(select(User).order_by(User.createdAt.asc())).all()
            return jsonify([u.to_dict(include_counts=True) for u in users])

    @app.post("/api/usuarios")
    @require_role("SOCIO")
    def create_usuario() -> Any:
        try:
            payload = UserCreate.model_validate(request.get_json(silent=True) or {})
        except ValidationError as exc:
            return jsonify(_format_validation_error(exc)), 400

        with session_scope() as session:
            ensure_institutional_users(session)
            clean_email = payload.email.strip().lower()
            existing = session.scalar(select(User).where(User.email == clean_email))
            if existing is not None:
                return (
                    jsonify(
                        {
                            "error": f"Já existe um integrante cadastrado com o e-mail {clean_email}."
                        }
                    ),
                    409,
                )

            novo = User(
                name=payload.name.strip(),
                email=clean_email,
                oab=payload.oab.strip() if payload.oab else None,
                role=payload.role,
                cargo=payload.cargo.strip(),
                especialidade=payload.especialidade.strip(),
                telefone=payload.telefone.strip() if payload.telefone else "+55 (83) 98122-9292",
                ativo=True,
            )
            session.add(novo)
            session.flush()
            session.refresh(novo)
            return jsonify(novo.to_dict(include_counts=True)), 201

    @app.patch("/api/usuarios")
    @require_role("SOCIO")
    def update_usuario() -> Any:
        try:
            payload = UserUpdate.model_validate(request.get_json(silent=True) or {})
        except ValidationError as exc:
            return jsonify(_format_validation_error(exc)), 400

        with session_scope() as session:
            user = session.get(User, payload.id)
            if user is None:
                return jsonify({"error": "Integrante não encontrado."}), 404
            if payload.ativo is not None:
                user.ativo = payload.ativo
            if payload.role is not None:
                user.role = payload.role
            if payload.cargo is not None:
                user.cargo = payload.cargo
            if payload.especialidade is not None:
                user.especialidade = payload.especialidade
            session.flush()
            session.refresh(user)
            return jsonify(user.to_dict(include_counts=True))

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host=BACKEND_HOST, port=BACKEND_PORT, debug=False)
