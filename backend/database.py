from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped
from sqlalchemy import String, Float, JSON, DateTime, ForeignKey, func
from config import get_settings
import uuid

settings = get_settings()
engine = create_async_engine(settings.database_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

class Report(Base):
    __tablename__ = "reports"
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    input_source: Mapped[str] = mapped_column(String(2000))
    input_type: Mapped[str] = mapped_column(String(10))  # "text" | "url"
    report_data: Mapped[dict] = mapped_column(JSON)       # full AccuracyReport JSON
    overall_score: Mapped[float] = mapped_column(Float)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
