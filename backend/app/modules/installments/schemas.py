from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class InstallmentBase(BaseModel):
    loan_id: int
    numero_cuota: int
    fecha_pago: date
    valor: float
    estado: str = "pendiente"


class InstallmentUpdate(BaseModel):
    estado: Optional[str] = None
    fecha_pago_real: Optional[date] = None


class InstallmentResponse(BaseModel):
    id: int
    loan_id: int
    numero_cuota: int
    fecha_pago: date
    valor: float
    estado: str
    fecha_pago_real: Optional[date] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
