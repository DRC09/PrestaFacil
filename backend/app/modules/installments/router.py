from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.deps import get_db, get_current_user
from app.modules.installments import service, schemas
from app.modules.users.model import User

router = APIRouter(prefix="/installments", tags=["Cuotas"])


@router.get("/loan/{loan_id}", response_model=List[schemas.InstallmentResponse])
def list_installments_by_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_installments_by_loan(db, loan_id)


@router.get("/calendar")
def get_calendar_installments(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    installments = service.get_installments_by_date_range(db, start_date, end_date)
    result = []
    for inst in installments:
        loan = inst.loan
        result.append({
            "id": inst.id,
            "loan_id": inst.loan_id,
            "numero_cuota": inst.numero_cuota,
            "fecha_pago": inst.fecha_pago.isoformat(),
            "valor": float(inst.valor),
            "estado": inst.estado,
            "fecha_pago_real": inst.fecha_pago_real.isoformat() if inst.fecha_pago_real else None,
            "client_nombre": loan.client.nombre if loan and loan.client else "N/A",
            "client_id": loan.client_id if loan else None,
        })
    return result


@router.get("/overdue", response_model=List[schemas.InstallmentResponse])
def get_overdue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_overdue_installments(db)


@router.put("/{installment_id}/pay")
def pay_installment(
    installment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_inst = service.mark_as_paid(db, installment_id)
    if not db_inst:
        raise HTTPException(status_code=404, detail="Cuota no encontrada")
    return {
        "detail": "Cuota marcada como pagada",
        "id": db_inst.id,
        "estado": db_inst.estado,
        "fecha_pago_real": db_inst.fecha_pago_real.isoformat() if db_inst.fecha_pago_real else None,
    }


@router.put("/{installment_id}/unpay")
def unpay_installment(
    installment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_inst = service.mark_as_pending(db, installment_id)
    if not db_inst:
        raise HTTPException(status_code=404, detail="Cuota no encontrada")
    return {"detail": "Cuota marcada como pendiente", "id": db_inst.id, "estado": db_inst.estado}


@router.post("/update-overdue")
def update_overdue(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = service.update_overdue_status(db)
    return {"detail": f"{count} cuotas marcadas como vencidas"}
