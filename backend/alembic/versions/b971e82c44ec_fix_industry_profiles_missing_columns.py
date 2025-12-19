"""Fix industry_profiles missing columns

Revision ID: b971e82c44ec
Revises: 20250103_0004
Create Date: 2025-11-07 19:49:07.454989

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b971e82c44ec'
down_revision: Union[str, Sequence[str], None] = '20250103_0004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: add missing columns to industry_profiles."""
    op.add_column('industry_profiles', sa.Column('company_website', sa.String(length=255), nullable=True))
    op.add_column('industry_profiles', sa.Column('contact_person_name', sa.String(length=255), nullable=True))
    op.add_column('industry_profiles', sa.Column('contact_number', sa.String(length=20), nullable=True))
    op.add_column('industry_profiles', sa.Column('designation', sa.String(length=255), nullable=True))
    op.add_column('industry_profiles', sa.Column('company_address', sa.Text(), nullable=True))
    op.add_column('industry_profiles', sa.Column('verified', sa.Boolean(), nullable=True, server_default='false'))


def downgrade() -> None:
    """Downgrade schema: remove added columns."""
    op.drop_column('industry_profiles', 'verified')
    op.drop_column('industry_profiles', 'company_address')
    op.drop_column('industry_profiles', 'designation')
    op.drop_column('industry_profiles', 'contact_number')
    op.drop_column('industry_profiles', 'contact_person_name')
    op.drop_column('industry_profiles', 'company_website')
