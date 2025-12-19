"""Utility script to create (or update) an Admin user.

Usage examples:

	python user_create.py --email admin@example.com --password "StrongPass123" --name "Platform Admin"

You can also set environment variables instead of CLI flags:

	export ADMIN_EMAIL=admin@example.com
	export ADMIN_PASSWORD=StrongPass123
	export ADMIN_NAME="Platform Admin"
	python user_create.py

Idempotent behaviour:
	* If the user doesn't exist -> it will be created.
	* If the user exists and --force-update is NOT supplied -> it is left unchanged.
	* If the user exists and --force-update is supplied -> its role, password, and flags are updated.

Safety notes:
	* Requires a running database reachable at settings.DATABASE_URL.
	* Password must satisfy the validation rules from the Pydantic schema (min length 8).
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from typing import Any, Dict

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.security import get_password_hash
from app.db.session import AsyncSessionLocal
from app.db import models
from app.db.models import UserRole
from app.schemas.user import UserCreate


def build_parser() -> argparse.ArgumentParser:
	parser = argparse.ArgumentParser(description="Create or update the Admin user")
	parser.add_argument("--email", default=os.environ.get("ADMIN_EMAIL"), help="Admin email (or ADMIN_EMAIL env var)")
	parser.add_argument("--password", default=os.environ.get("ADMIN_PASSWORD"), help="Admin password (or ADMIN_PASSWORD env var)")
	parser.add_argument("--name", default=os.environ.get("ADMIN_NAME", "Administrator"), help="Admin display name")
	parser.add_argument("--phone", default=os.environ.get("ADMIN_PHONE"), help="Optional phone number")
	parser.add_argument("--university", default=os.environ.get("ADMIN_UNIVERSITY"), help="Optional university field")
	parser.add_argument("--force-update", action="store_true", help="Update existing user if already present")
	parser.add_argument("--json", action="store_true", help="Emit resulting user data as JSON")
	return parser


async def _get_user_by_email(session, email: str):
	result = await session.execute(
		select(models.User).where(models.User.email == email.lower())
	)
	return result.scalars().first()


async def ensure_admin(
	*,
	email: str,
	password: str,
	name: str,
	phone: str | None,
	university: str | None,
	force_update: bool,
) -> Dict[str, Any]:
	"""Create or update the admin user and return a summary dict.

	Returns keys:
		action: 'created' | 'unchanged' | 'updated'
		user: public subset of user fields
	"""
	if not email or not password:
		raise SystemExit("--email and --password (or ADMIN_EMAIL/ADMIN_PASSWORD) are required")

	async with AsyncSessionLocal() as session:
		existing = await _get_user_by_email(session, email)
		if existing is None:
			# New admin creation via existing schema for validation.
			try:
				user_in = UserCreate(
					name=name,
					email=email,
					password=password,
					role=UserRole.ADMIN,
					phone=phone,
					university=university,
				)
			except ValidationError as exc:
				raise SystemExit(f"Invalid input: {exc}") from exc

			# Manual creation replicating create_user crud logic (simpler + synchronous context here)
			user = models.User(
				name=user_in.name,
				email=user_in.email.lower(),
				role=user_in.role,
				password_hash=get_password_hash(user_in.password),
				phone=user_in.phone,
				university=user_in.university,
				is_active=True,
				email_verified=True,
			)
			session.add(user)
			try:
				await session.commit()
			except IntegrityError as exc:
				await session.rollback()
				raise SystemExit(f"Failed to create admin user (integrity error): {exc}") from exc
			await session.refresh(user)
			return {
				"action": "created",
				"user": {
					"id": user.id,
					"email": user.email,
					"name": user.name,
					"role": user.role.value,
					"is_active": user.is_active,
					"email_verified": user.email_verified,
				},
			}

		# Existing user path
		if not force_update:
			return {
				"action": "unchanged",
				"user": {
					"id": existing.id,
					"email": existing.email,
					"name": existing.name,
					"role": existing.role.value,
					"is_active": existing.is_active,
					"email_verified": existing.email_verified,
				},
			}

		# Update existing user to admin
		existing.role = UserRole.ADMIN
		existing.password_hash = get_password_hash(password)
		existing.name = name or existing.name
		if phone is not None:
			existing.phone = phone
		if university is not None:
			existing.university = university
		existing.is_active = True
		existing.email_verified = True
		try:
			await session.commit()
		except IntegrityError as exc:
			await session.rollback()
			raise SystemExit(f"Failed to update admin user (integrity error): {exc}") from exc
		await session.refresh(existing)
		return {
			"action": "updated",
			"user": {
				"id": existing.id,
				"email": existing.email,
				"name": existing.name,
				"role": existing.role.value,
				"is_active": existing.is_active,
				"email_verified": existing.email_verified,
			},
		}


async def async_main(args: argparse.Namespace) -> int:
	result = await ensure_admin(
		email=args.email,
		password=args.password,
		name=args.name,
		phone=args.phone,
		university=args.university,
		force_update=args.force_update,
	)
	if args.json:
		print(json.dumps(result, indent=2))
	else:
		print(f"Admin user {result['action']}: {result['user']['email']} (id={result['user']['id']})")
	return 0


def main() -> int:
	parser = build_parser()
	args = parser.parse_args()
	if not args.email or not args.password:
		parser.print_help(sys.stderr)
		print("\nERROR: --email and --password are required (or set ADMIN_EMAIL/ADMIN_PASSWORD).", file=sys.stderr)
		return 2
	return asyncio.run(async_main(args))


if __name__ == "__main__":
	raise SystemExit(main())

