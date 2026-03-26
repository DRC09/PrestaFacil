from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class LoanBase(BaseModel):
    client_id: int
    monto: float
    interes: float
    numero_cuotas: int
    frecuencia: str = "diario"
    fecha_inicio: date


class LoanCreate(LoanBase):
    pass


class LoanUpdate(BaseModel):
    estado: Optional[str] = None


class LoanResponse(BaseModel):
    id: int
    client_id: int
    monto: float
    interes: float
    total_pagar: float
    numero_cuotas: int
    frecuencia: str
    fecha_inicio: date
    estado: str
    created_at: Optional[datetime] = None
    client_nombre: Optional[str] = None

    class Config:
        from_attributes = True


class LoanDetailResponse(LoanResponse):
    installments: List[dict] = []

    class Config:
        from_attributes = True
