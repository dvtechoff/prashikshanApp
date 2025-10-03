"""Convenience runner for starting the Prashikshan FastAPI backend.

This script thinly wraps ``uvicorn`` so the API can be started with a single
command, for example::

    python run_backend.py --reload

The defaults are suitable for local development. Use the CLI options or the
corresponding environment variables to tweak behaviour without editing code.
"""

from __future__ import annotations

import argparse
import os
from typing import Optional

import uvicorn

DEFAULT_HOST = os.environ.get("PRASHIKSHAN_API_HOST", "0.0.0.0")
DEFAULT_PORT = int(os.environ.get("PRASHIKSHAN_API_PORT", 8000))
DEFAULT_RELOAD = os.environ.get("PRASHIKSHAN_API_RELOAD", "false").lower() in {"1", "true", "yes"}
DEFAULT_WORKERS = os.environ.get("PRASHIKSHAN_API_WORKERS")
DEFAULT_LOG_LEVEL = os.environ.get("PRASHIKSHAN_API_LOG_LEVEL", "info")


def positive_int(value: str) -> int:
    try:
        ivalue = int(value)
    except ValueError as exc:  # pragma: no cover - argparse already handles messaging
        raise argparse.ArgumentTypeError("Expected an integer") from exc
    if ivalue <= 0:
        raise argparse.ArgumentTypeError("Value must be greater than zero")
    return ivalue


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run the Prashikshan FastAPI backend")
    parser.add_argument("--host", default=DEFAULT_HOST, help="Host interface to bind (default: %(default)s)")
    parser.add_argument("--port", type=positive_int, default=DEFAULT_PORT, help="Port to bind (default: %(default)s)")
    parser.add_argument(
        "--reload",
        action="store_true",
        default=DEFAULT_RELOAD,
        help="Enable autoreload (development only). Can also be set with PRASHIKSHAN_API_RELOAD=1",
    )
    parser.add_argument(
        "--workers",
        type=positive_int,
        default=int(DEFAULT_WORKERS) if DEFAULT_WORKERS else None,
        help="Number of worker processes (ignored when --reload is active)",
    )
    parser.add_argument(
        "--log-level",
        default=DEFAULT_LOG_LEVEL,
        choices={"critical", "error", "warning", "info", "debug", "trace"},
        help="Uvicorn log level (default: %(default)s)",
    )
    parser.add_argument(
        "--proxy-headers",
        action="store_true",
        default=os.environ.get("PRASHIKSHAN_API_PROXY_HEADERS", "false").lower() in {"1", "true", "yes"},
        help="Trust X-Forwarded-* headers from upstream proxies",
    )
    return parser


def run_server(host: str, port: int, reload: bool, workers: Optional[int], log_level: str, proxy_headers: bool) -> None:
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
        workers=None if reload else workers,
        log_level=log_level,
        proxy_headers=proxy_headers,
    )


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    run_server(
        host=args.host,
        port=args.port,
        reload=args.reload,
        workers=args.workers,
        log_level=args.log_level,
        proxy_headers=args.proxy_headers,
    )


if __name__ == "__main__":
    main()
