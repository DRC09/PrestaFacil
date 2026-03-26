from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ClientBase(BaseModel):
    nombre: str
    documento: str
    telefono: Optional[str] = None
    direccion: Optional[str] = None


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    nombre: Optional[str] = None
    documento: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None


class ClientResponse(ClientBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ClientDetailResponse(ClientResponse):
    loans: List[dict] = []

    class Config:
        from_attributes = True
