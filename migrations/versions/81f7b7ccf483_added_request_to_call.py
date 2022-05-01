"""Added request to call

Revision ID: 81f7b7ccf483
Revises: e4424aabc2f6
Create Date: 2022-04-20 18:22:31.477452

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '81f7b7ccf483'
down_revision = 'e4424aabc2f6'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('message', sa.Column('request_to_call', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('message', 'request_to_call')
    # ### end Alembic commands ###
