from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.deps import get_db, get_current_user
from app.modules.users.model import User
from app.modules.clients.model import Client
from app.modules.loans.model import Loan
from app.modules.installments.model import Installment

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Total clientes
    total_clientes = db.query(func.count(Client.id)).scalar() or 0

    # Préstamos activos
    prestamos_activos = db.query(func.count(Loan.id)).filter(Loan.estado == "activo").scalar() or 0

    # Total prestado (todos los préstamos)
    total_prestado = db.query(func.coalesce(func.sum(Loan.monto), 0)).scalar()

    # Total a recuperar
    total_a_recuperar = db.query(func.coalesce(func.sum(Loan.total_pagar), 0)).scalar()

    # Total recuperado (cuotas pagadas)
    total_recuperado = (
        db.query(func.coalesce(func.sum(Installment.valor), 0))
        .filter(Installment.estado == "pagada")
        .scalar()
    )

    # Ganancia (recuperado - capital prestado de préstamos completados + cuotas pagadas de activos)
    ganancia = float(total_recuperado) - float(total_prestado) if float(total_recuperado) > float(total_prestado) else 0

    # Deuda pendiente
    deuda_pendiente = (
        db.query(func.coalesce(func.sum(Installment.valor), 0))
        .filter(Installment.estado.in_(["pendiente", "vencida"]))
        .scalar()
    )

    # Cuotas vencidas
    cuotas_vencidas = (
        db.query(func.count(Installment.id))
        .filter(Installment.estado == "vencida")
        .scalar() or 0
    )

    # Préstamos completados
    prestamos_completados = db.query(func.count(Loan.id)).filter(Loan.estado == "completado").scalar() or 0

    return {
        "total_clientes": total_clientes,
        "prestamos_activos": prestamos_activos,
        "prestamos_completados": prestamos_completados,
        "total_prestado": float(total_prestado),
        "total_recuperado": float(total_recuperado),
        "ganancia": float(ganancia),
        "deuda_pendiente": float(deuda_pendiente),
        "cuotas_vencidas": cuotas_vencidas,
    }
