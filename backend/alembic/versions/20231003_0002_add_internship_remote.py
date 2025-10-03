"""add remote flag to internships

Revision ID: 20231003_0002
Revises: 20231003_0001
Create Date: 2025-10-03 00:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20231003_0002"
down_revision = "20231003_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "internships",
        sa.Column("remote", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )
    op.alter_column("internships", "remote", server_default=None)


def downgrade() -> None:
    op.drop_column("internships", "remote")
