"""initial schema

Revision ID: 20231003_0001
Revises:
Create Date: 2025-10-03 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20231003_0001"
down_revision = None
branch_labels = None
depends_on = None


USERROLE_VALUES = ("STUDENT", "FACULTY", "INDUSTRY", "ADMIN")

userrole = postgresql.ENUM(*USERROLE_VALUES, name="userrole", create_type=False)


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
                CREATE TYPE userrole AS ENUM ('STUDENT', 'FACULTY', 'INDUSTRY', 'ADMIN');
            END IF;
        END
        $$;
        """
    )

    op.create_table(
        "colleges",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("coordinator_user_id", postgresql.UUID(as_uuid=True), nullable=True),
    )

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
        sa.Column("role", userrole, nullable=False),
        sa.Column("college_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["college_id"], ["colleges.id"], name="fk_users_college"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "profiles",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column("enrollment_no", sa.String(length=100), nullable=True),
        sa.Column("course", sa.String(length=255), nullable=True),
        sa.Column("year", sa.String(length=50), nullable=True),
        sa.Column("skills", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("resume_url", sa.String(length=512), nullable=True),
        sa.Column("verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_profiles_user", ondelete="CASCADE"),
    )

    op.create_table(
        "industry_profiles",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column("company_name", sa.String(length=255), nullable=False),
        sa.Column("website", sa.String(length=255), nullable=True),
        sa.Column("contact", sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_industry_profiles_user", ondelete="CASCADE"),
    )

    op.create_table(
        "internships",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("skills", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("stipend", sa.Numeric(10, 2), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("duration_weeks", sa.Integer(), nullable=True),
        sa.Column("credits", sa.Integer(), nullable=True),
        sa.Column("posted_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="OPEN"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["posted_by"], ["users.id"], name="fk_internships_posted_by"),
    )

    op.create_table(
        "applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column("internship_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("applied_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("industry_status", sa.String(length=50), nullable=False, server_default="PENDING"),
        sa.Column("faculty_status", sa.String(length=50), nullable=False, server_default="PENDING"),
        sa.Column("resume_snapshot_url", sa.String(length=512), nullable=True),
        sa.ForeignKeyConstraint(["internship_id"], ["internships.id"], name="fk_applications_internship"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], name="fk_applications_student"),
    )

    op.create_table(
        "logbook_entries",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column("application_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("entry_date", sa.Date(), nullable=False),
        sa.Column("hours", sa.Float(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("attachments", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("faculty_comments", sa.Text(), nullable=True),
        sa.Column("approved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], name="fk_logbook_application"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], name="fk_logbook_student"),
    )

    op.create_table(
        "credits",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column("student_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("internship_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("credits_awarded", sa.Integer(), nullable=False),
        sa.Column("faculty_signed_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], name="fk_credits_student"),
        sa.ForeignKeyConstraint(["internship_id"], ["internships.id"], name="fk_credits_internship"),
    )

    op.create_table(
        "reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column("application_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("pdf_url", sa.String(length=512), nullable=False),
        sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("qr_code_token", sa.String(length=255), nullable=False, unique=True),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"], name="fk_reports_application"),
    )

    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("read", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_notifications_user"),
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(length=255), nullable=False),
        sa.Column("target_type", sa.String(length=255), nullable=True),
        sa.Column("target_id", sa.String(length=255), nullable=True),
        sa.Column("meta", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_audit_logs_user"),
    )

    op.create_foreign_key(
        "fk_colleges_coordinator",
        "colleges",
        "users",
        ["coordinator_user_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_colleges_coordinator", "colleges", type_="foreignkey")
    op.drop_table("audit_logs")
    op.drop_table("notifications")
    op.drop_table("reports")
    op.drop_table("credits")
    op.drop_table("logbook_entries")
    op.drop_table("applications")
    op.drop_table("internships")
    op.drop_table("industry_profiles")
    op.drop_table("profiles")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    op.drop_table("colleges")
    op.execute("DROP TYPE IF EXISTS userrole")
