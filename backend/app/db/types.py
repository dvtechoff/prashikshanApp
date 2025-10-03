import json
import uuid
from typing import Any

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.types import TypeDecorator


class GUID(TypeDecorator):
    impl = postgresql.UUID
    cache_ok = True

    def load_dialect_impl(self, dialect):  # type: ignore[override]
        if dialect.name == "postgresql":
            return dialect.type_descriptor(postgresql.UUID(as_uuid=True))
        return dialect.type_descriptor(sa.String(36))

    def process_bind_param(self, value: Any, dialect):  # type: ignore[override]
        if value is None:
            return value
        if dialect.name == "postgresql":
            if isinstance(value, uuid.UUID):
                return value
            return uuid.UUID(str(value))
        return str(value)

    def process_result_value(self, value: Any, dialect):  # type: ignore[override]
        if value is None:
            return value
        return str(value)


class JSONType(TypeDecorator):
    impl = postgresql.JSONB
    cache_ok = True

    def load_dialect_impl(self, dialect):  # type: ignore[override]
        if dialect.name == "postgresql":
            return dialect.type_descriptor(postgresql.JSONB())
        return dialect.type_descriptor(sa.JSON())

    def process_result_value(self, value: Any, dialect):  # type: ignore[override]
        if value is None or isinstance(value, (dict, list)):
            return value
        if isinstance(value, str):
            return json.loads(value)
        return value
