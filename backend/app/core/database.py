from collections.abc import AsyncGenerator
from sqlalchemy import MetaData
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings
metadata=MetaData(naming_convention={'ix':'ix_%(column_0_label)s','uq':'uq_%(table_name)s_%(column_0_name)s','ck':'ck_%(table_name)s_%(constraint_name)s','fk':'fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s','pk':'pk_%(table_name)s'})
class Base(DeclarativeBase): metadata=metadata
engine=create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
AsyncSessionLocal=async_sessionmaker(engine, expire_on_commit=False, autoflush=False)
async def get_db() -> AsyncGenerator[AsyncSession,None]:
    async with AsyncSessionLocal() as session: yield session
