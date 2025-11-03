"""add_group_id_to_posts

Revision ID: b1c2d3e4f5a6
Revises: a1b2c3d4e5f6
Create Date: 2025-11-03 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b1c2d3e4f5a6'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    # Add group_id column to posts table
    op.add_column('posts', sa.Column('group_id', sa.Integer(), nullable=True))
    op.create_foreign_key('posts_group_id_fkey', 'posts', 'groups', ['group_id'], ['id'])


def downgrade():
    # Remove the foreign key and column
    op.drop_constraint('posts_group_id_fkey', 'posts', type_='foreignkey')
    op.drop_column('posts', 'group_id')

