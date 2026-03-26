from datetime import date
from sqlalchemy.orm import Session
from app.modules.installments.model import Installment
from app.modules.loans.service import check_loan_completion


def get_installment(db: Session, installment_id: int):
    return db.query(Installment).filter(Installment.id == installment_id).first()


def get_installments_by_loan(db: Session, loan_id: int):
    return db.query(Installment).filter(Installment.loan_id == loan_id).order_by(Installment.numero_cuota).all()


def get_installments_by_date_range(db: Session, start_date: date, end_date: date):
    return (
        db.query(Installment)
        .filter(Installment.fecha_pago >= start_date, Installment.fecha_pago <= end_date)
        .order_by(Installment.fecha_pago)
        .all()
    )


def get_overdue_installments(db: Session):
    today = date.today()
    return (
        db.query(Installment)
        .filter(Installment.fecha_pago < today, Installment.estado == "pendiente")
        .order_by(Installment.fecha_pago)
        .all()
    )


def mark_as_paid(db: Session, installment_id: int):
    db_inst = db.query(Installment).filter(Installment.id == installment_id).first()
    if not db_inst:
        return None
    db_inst.estado = "pagada"
    db_inst.fecha_pago_real = date.today()
    db.commit()
    db.refresh(db_inst)
    # Check if loan is fully paid
    check_loan_completion(db, db_inst.loan_id)
    return db_inst


def mark_as_pending(db: Session, installment_id: int):
    db_inst = db.query(Installment).filter(Installment.id == installment_id).first()
    if not db_inst:
        return None
    db_inst.estado = "pendiente"
    db_inst.fecha_pago_real = None
    db.commit()
    db.refresh(db_inst)
    return db_inst


def update_overdue_status(db: Session):
    """Mark overdue installments"""
    today = date.today()
    overdue = (
        db.query(Installment)
        .filter(Installment.fecha_pago < today, Installment.estado == "pendiente")
        .all()
    )
    for inst in overdue:
        inst.estado = "vencida"
    db.commit()
    return len(overdue)
