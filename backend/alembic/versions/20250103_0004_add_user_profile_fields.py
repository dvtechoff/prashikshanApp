"""add missing user and profile fields

Revision ID: 20250103_0004
Revises: 20250103_0003
Create Date: 2025-01-03 00:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20250103_0004"
down_revision = "20250103_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add missing columns to users table
    op.add_column(
        "users",
        sa.Column("phone", sa.String(20), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("university", sa.String(255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("email_verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.add_column(
        "users",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )
    
    # Remove server defaults after adding columns
    op.alter_column("users", "email_verified", server_default=None)
    op.alter_column("users", "is_active", server_default=None)
    
    # Add missing columns to profiles table
    op.add_column(
        "profiles",
        sa.Column("designation", sa.String(255), nullable=True),
    )
    op.add_column(
        "profiles",
        sa.Column("department", sa.String(255), nullable=True),
    )
    op.add_column(
        "profiles",
        sa.Column("faculty_id", sa.String(100), nullable=True),
    )


def downgrade() -> None:
    # Remove columns from profiles table
    op.drop_column("profiles", "faculty_id")
    op.drop_column("profiles", "department")
    op.drop_column("profiles", "designation")
    
    # Remove columns from users table
    op.drop_column("users", "is_active")
    op.drop_column("users", "email_verified")
    op.drop_column("users", "university")
    op.drop_column("users", "phone")
