from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    documento = Column(String(20), unique=True, index=True, nullable=False)
    telefono = Column(String(20), nullable=True)
    direccion = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    loans = relationship("Loan", back_populates="client", cascade="all, delete-orphan")
