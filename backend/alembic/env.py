import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
from app.core.config import settings
from app.core.database import Base
from app import models  # noqa
config=context.config; config.set_main_option('sqlalchemy.url', settings.DATABASE_URL.replace('%', '%%'))
if config.config_file_name: fileConfig(config.config_file_name)
target_metadata=Base.metadata
def run_migrations_offline():
    context.configure(url=settings.DATABASE_URL,target_metadata=target_metadata,literal_binds=True,compare_type=True)
    with context.begin_transaction(): context.run_migrations()
def do_run_migrations(connection:Connection):
    context.configure(connection=connection,target_metadata=target_metadata,compare_type=True)
    with context.begin_transaction(): context.run_migrations()
async def run_async_migrations():
    cfg=config.get_section(config.config_ini_section); cfg['sqlalchemy.url']=settings.DATABASE_URL
    connectable=async_engine_from_config(cfg,prefix='sqlalchemy.',poolclass=pool.NullPool)
    async with connectable.connect() as connection: await connection.run_sync(do_run_migrations)
    await connectable.dispose()
def run_migrations_online(): asyncio.run(run_async_migrations())
run_migrations_offline() if context.is_offline_mode() else run_migrations_online()
