from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    monto = Column(Float, nullable=False)
    interes = Column(Float, nullable=False)  # porcentaje
    total_pagar = Column(Float, nullable=False)
    numero_cuotas = Column(Integer, nullable=False)
    frecuencia = Column(String(20), nullable=False, default="diario")  # diario, semanal, mensual
    fecha_inicio = Column(Date, nullable=False)
    estado = Column(String(20), nullable=False, default="activo")  # activo, completado, cancelado
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client", back_populates="loans")
    installments = relationship("Installment", back_populates="loan", cascade="all, delete-orphan")
