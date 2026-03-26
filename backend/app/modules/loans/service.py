from datetime import timedelta
from sqlalchemy.orm import Session
from app.modules.loans.model import Loan
from app.modules.loans.schemas import LoanCreate
from app.modules.installments.model import Installment


def get_loan(db: Session, loan_id: int):
    return db.query(Loan).filter(Loan.id == loan_id).first()


def get_loans(db: Session, skip: int = 0, limit: int = 100, client_id: int = None, estado: str = None):
    query = db.query(Loan)
    if client_id:
        query = query.filter(Loan.client_id == client_id)
    if estado:
        query = query.filter(Loan.estado == estado)
    return query.order_by(Loan.created_at.desc()).offset(skip).limit(limit).all()


def get_loans_count(db: Session, estado: str = None):
    query = db.query(Loan)
    if estado:
        query = query.filter(Loan.estado == estado)
    return query.count()


def create_loan(db: Session, loan: LoanCreate):
    # 1. Calcular total a pagar con interés
    interes_monto = loan.monto * (loan.interes / 100)
    total_pagar = loan.monto + interes_monto

    # 2. Crear préstamo
    db_loan = Loan(
        client_id=loan.client_id,
        monto=loan.monto,
        interes=loan.interes,
        total_pagar=total_pagar,
        numero_cuotas=loan.numero_cuotas,
        frecuencia=loan.frecuencia,
        fecha_inicio=loan.fecha_inicio,
        estado="activo",
    )
    db.add(db_loan)
    db.flush()  # Get the ID

    # 3. Calcular valor de cada cuota
    valor_cuota = round(total_pagar / loan.numero_cuotas, 2)

    # 4. Generar cuotas con fechas automáticas
    freq_map = {
        "diario": timedelta(days=1),
        "semanal": timedelta(weeks=1),
        "mensual": timedelta(days=30),
    }
    delta = freq_map.get(loan.frecuencia, timedelta(days=1))

    for i in range(loan.numero_cuotas):
        fecha_pago = loan.fecha_inicio + delta * (i + 1)
        # Ajustar última cuota para cubrir redondeo
        if i == loan.numero_cuotas - 1:
            valor_cuota_actual = round(total_pagar - (valor_cuota * (loan.numero_cuotas - 1)), 2)
        else:
            valor_cuota_actual = valor_cuota

        installment = Installment(
            loan_id=db_loan.id,
            numero_cuota=i + 1,
            fecha_pago=fecha_pago,
            valor=valor_cuota_actual,
            estado="pendiente",
        )
        db.add(installment)

    db.commit()
    db.refresh(db_loan)
    return db_loan


def update_loan_status(db: Session, loan_id: int, estado: str):
    db_loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not db_loan:
        return None
    db_loan.estado = estado
    db.commit()
    db.refresh(db_loan)
    return db_loan


def check_loan_completion(db: Session, loan_id: int):
    """Check if all installments are paid and mark loan as completed"""
    db_loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if db_loan:
        all_paid = all(inst.estado == "pagada" for inst in db_loan.installments)
        if all_paid:
            db_loan.estado = "completado"
            db.commit()
            db.refresh(db_loan)
    return db_loan


def delete_loan(db: Session, loan_id: int):
    db_loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if db_loan:
        db.delete(db_loan)
        db.commit()
    return db_loan
