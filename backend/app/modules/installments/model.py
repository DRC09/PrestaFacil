from sqlalchemy import Column, Integer, Float, String, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Installment(Base):
    __tablename__ = "installments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    loan_id = Column(Integer, ForeignKey("loans.id", ondelete="CASCADE"), nullable=False)
    numero_cuota = Column(Integer, nullable=False)
    fecha_pago = Column(Date, nullable=False)
    valor = Column(Float, nullable=False)
    estado = Column(String(20), nullable=False, default="pendiente")  # pendiente, pagada, vencida
    fecha_pago_real = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    loan = relationship("Loan", back_populates="installments")
