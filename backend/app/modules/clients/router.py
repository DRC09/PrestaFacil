from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.deps import get_db, get_current_user
from app.modules.clients import service, schemas
from app.modules.users.model import User

router = APIRouter(prefix="/clients", tags=["Clientes"])


@router.get("/", response_model=List[schemas.ClientResponse])
def list_clients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_clients(db, skip=skip, limit=limit, search=search)


@router.get("/count")
def count_clients(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"count": service.get_clients_count(db, search=search)}


@router.get("/{client_id}", response_model=schemas.ClientResponse)
def read_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_client = service.get_client(db, client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return db_client


@router.get("/{client_id}/detail")
def read_client_detail(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_client = service.get_client(db, client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    loans_data = []
    for loan in db_client.loans:
        loans_data.append({
            "id": loan.id,
            "monto": float(loan.monto),
            "interes": float(loan.interes),
            "total_pagar": float(loan.total_pagar),
            "numero_cuotas": loan.numero_cuotas,
            "frecuencia": loan.frecuencia,
            "fecha_inicio": loan.fecha_inicio.isoformat() if loan.fecha_inicio else None,
            "estado": loan.estado,
            "created_at": loan.created_at.isoformat() if loan.created_at else None,
        })
    return {
        "id": db_client.id,
        "nombre": db_client.nombre,
        "documento": db_client.documento,
        "telefono": db_client.telefono,
        "direccion": db_client.direccion,
        "created_at": db_client.created_at.isoformat() if db_client.created_at else None,
        "loans": loans_data,
    }


@router.post("/", response_model=schemas.ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client: schemas.ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = service.get_client_by_documento(db, client.documento)
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un cliente con ese documento")
    return service.create_client(db, client)


@router.put("/{client_id}", response_model=schemas.ClientResponse)
def update_client(
    client_id: int,
    client_update: schemas.ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_client = service.update_client(db, client_id, client_update)
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return db_client


@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_client = service.delete_client(db, client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"detail": "Cliente eliminado"}
