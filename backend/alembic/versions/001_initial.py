"""initial migration

Revision ID: 001_initial
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='trabajador'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_users_id', 'users', ['id'])
    op.create_index('ix_users_username', 'users', ['username'], unique=True)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    op.create_table(
        'clients',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('documento', sa.String(length=20), nullable=False),
        sa.Column('telefono', sa.String(length=20), nullable=True),
        sa.Column('direccion', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_clients_id', 'clients', ['id'])
    op.create_index('ix_clients_documento', 'clients', ['documento'], unique=True)

    op.create_table(
        'loans',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=False),
        sa.Column('monto', sa.Float(), nullable=False),
        sa.Column('interes', sa.Float(), nullable=False),
        sa.Column('total_pagar', sa.Float(), nullable=False),
        sa.Column('numero_cuotas', sa.Integer(), nullable=False),
        sa.Column('frecuencia', sa.String(length=20), nullable=False, server_default='diario'),
        sa.Column('fecha_inicio', sa.Date(), nullable=False),
        sa.Column('estado', sa.String(length=20), nullable=False, server_default='activo'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_loans_id', 'loans', ['id'])

    op.create_table(
        'installments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('loan_id', sa.Integer(), nullable=False),
        sa.Column('numero_cuota', sa.Integer(), nullable=False),
        sa.Column('fecha_pago', sa.Date(), nullable=False),
        sa.Column('valor', sa.Float(), nullable=False),
        sa.Column('estado', sa.String(length=20), nullable=False, server_default='pendiente'),
        sa.Column('fecha_pago_real', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['loan_id'], ['loans.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_installments_id', 'installments', ['id'])


def downgrade() -> None:
    op.drop_table('installments')
    op.drop_table('loans')
    op.drop_table('clients')
    op.drop_table('users')
