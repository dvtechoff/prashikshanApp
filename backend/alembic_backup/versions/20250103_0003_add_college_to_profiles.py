"""add college field to profiles

Revision ID: 20250103_0003
Revises: 20231003_0002
Create Date: 2025-01-03 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20250103_0003"
down_revision = "20231003_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add college column to profiles table
    op.add_column(
        "profiles",
        sa.Column("college", sa.String(255), nullable=True),
    )


def downgrade() -> None:
    # Remove college column from profiles table
    op.drop_column("profiles", "college")
