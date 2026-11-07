"""
Gerenciamento de sessão SQLAlchemy 2.0 e inicialização dos perfis
institucionais verificados da MFV Advocacia (Sousa - PB).
"""

from __future__ import annotations

from contextlib import contextmanager
from typing import Generator, Optional

from sqlalchemy import create_engine, event, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from backend.config import INSTITUTIONAL_USERS_SEED, get_database_url
from backend.models import Base, User

_engine: Optional[Engine] = None
_SessionLocal: Optional[sessionmaker] = None


def configure_database(database_url: Optional[str] = None) -> Engine:
    global _engine, _SessionLocal
    if _engine is not None:
        _engine.dispose()
    url = database_url or get_database_url()
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    _engine = create_engine(url, connect_args=connect_args, future=True)

    if url.startswith("sqlite"):
        @event.listens_for(_engine, "connect")
        def _set_sqlite_pragma(dbapi_connection, connection_record):  # type: ignore[no-untyped-def]
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    _SessionLocal = sessionmaker(
        bind=_engine, autoflush=False, autocommit=False, expire_on_commit=False
    )
    Base.metadata.create_all(bind=_engine)
    return _engine


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        return configure_database()
    return _engine


def get_session_factory() -> sessionmaker:
    global _SessionLocal
    if _SessionLocal is None:
        configure_database()
    assert _SessionLocal is not None
    return _SessionLocal


@contextmanager
def session_scope() -> Generator[Session, None, None]:
    factory = get_session_factory()
    session: Session = factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def ensure_institutional_users(session: Session) -> None:
    """
    Garante que os 3 perfis reais do escritório MFV Advocacia (Sousa - PB)
    estejam presentes no banco sem inserir nenhum cliente ou processo fictício.
    """
    for item in INSTITUTIONAL_USERS_SEED:
        existing = session.scalar(select(User).where(User.email == item["email"]))
        if existing is None:
            user = User(
                id=item["id"],
                name=item["name"],
                email=item["email"],
                oab=item["oab"],
                role=item["role"],
                cargo=item["cargo"],
                especialidade=item["especialidade"],
                telefone=item["telefone"],
                ativo=item["ativo"],
            )
            session.add(user)
    session.flush()
