from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.deps import get_db, get_current_user
from app.modules.loans import service, schemas
from app.modules.users.model import User
from app.modules.clients.service import get_client

router = APIRouter(prefix="/loans", tags=["Préstamos"])


@router.get("/", response_model=List[schemas.LoanResponse])
def list_loans(
    skip: int = 0,
    limit: int = 100,
    client_id: Optional[int] = Query(None),
    estado: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    loans = service.get_loans(db, skip=skip, limit=limit, client_id=client_id, estado=estado)
    result = []
    for loan in loans:
        loan_dict = schemas.LoanResponse(
            id=loan.id,
            client_id=loan.client_id,
            monto=loan.monto,
            interes=loan.interes,
            total_pagar=loan.total_pagar,
            numero_cuotas=loan.numero_cuotas,
            frecuencia=loan.frecuencia,
            fecha_inicio=loan.fecha_inicio,
            estado=loan.estado,
            created_at=loan.created_at,
            client_nombre=loan.client.nombre if loan.client else None,
        )
        result.append(loan_dict)
    return result


@router.get("/count")
def count_loans(
    estado: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"count": service.get_loans_count(db, estado=estado)}


@router.get("/{loan_id}")
def read_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_loan = service.get_loan(db, loan_id)
    if not db_loan:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
    installments_data = []
    for inst in db_loan.installments:
        installments_data.append({
            "id": inst.id,
            "loan_id": inst.loan_id,
            "numero_cuota": inst.numero_cuota,
            "fecha_pago": inst.fecha_pago.isoformat() if inst.fecha_pago else None,
            "valor": float(inst.valor),
            "estado": inst.estado,
            "fecha_pago_real": inst.fecha_pago_real.isoformat() if inst.fecha_pago_real else None,
        })
    return {
        "id": db_loan.id,
        "client_id": db_loan.client_id,
        "client_nombre": db_loan.client.nombre if db_loan.client else None,
        "client_telefono": db_loan.client.telefono if db_loan.client else None,
        "monto": float(db_loan.monto),
        "interes": float(db_loan.interes),
        "total_pagar": float(db_loan.total_pagar),
        "numero_cuotas": db_loan.numero_cuotas,
        "frecuencia": db_loan.frecuencia,
        "fecha_inicio": db_loan.fecha_inicio.isoformat() if db_loan.fecha_inicio else None,
        "estado": db_loan.estado,
        "created_at": db_loan.created_at.isoformat() if db_loan.created_at else None,
        "installments": installments_data,
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_loan(
    loan: schemas.LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    client = get_client(db, loan.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    db_loan = service.create_loan(db, loan)
    return {
        "id": db_loan.id,
        "client_id": db_loan.client_id,
        "monto": float(db_loan.monto),
        "interes": float(db_loan.interes),
        "total_pagar": float(db_loan.total_pagar),
        "numero_cuotas": db_loan.numero_cuotas,
        "frecuencia": db_loan.frecuencia,
        "fecha_inicio": db_loan.fecha_inicio.isoformat() if db_loan.fecha_inicio else None,
        "estado": db_loan.estado,
    }


@router.put("/{loan_id}/status")
def update_loan_status(
    loan_id: int,
    update: schemas.LoanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_loan = service.update_loan_status(db, loan_id, update.estado)
    if not db_loan:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
    return {"detail": "Estado actualizado", "estado": db_loan.estado}


@router.delete("/{loan_id}")
def delete_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_loan = service.delete_loan(db, loan_id)
    if not db_loan:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
    return {"detail": "Préstamo eliminado"}
