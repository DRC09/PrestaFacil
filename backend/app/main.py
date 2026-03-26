import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.db.session import engine, SessionLocal
from app.db.base import Base

# Import all models so they're registered
from app.modules.users.model import User
from app.modules.clients.model import Client
from app.modules.loans.model import Loan
from app.modules.installments.model import Installment

# Import routers
from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.modules.clients.router import router as clients_router
from app.modules.loans.router import router as loans_router
from app.modules.installments.router import router as installments_router
from app.modules.dashboard.router import router as dashboard_router

from app.core.security import get_password_hash

app = FastAPI(
    title="Sistema de Gestión de Préstamos",
    description="API para administración de préstamos en COP",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(clients_router, prefix="/api")
app.include_router(loans_router, prefix="/api")
app.include_router(installments_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")


@app.on_event("startup")
def on_startup():
    # Wait for DB to be ready
    retries = 30
    for i in range(retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            break
        except Exception:
            if i < retries - 1:
                time.sleep(2)
            else:
                raise

    # Create tables
    Base.metadata.create_all(bind=engine)

    # Seed admin user
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        if not admin:
            admin_user = User(
                username=settings.ADMIN_USERNAME,
                email=settings.ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                role="admin",
                is_active=True,
            )
            db.add(admin_user)
            db.commit()
            print(f"✅ Admin user '{settings.ADMIN_USERNAME}' created")
        else:
            print(f"ℹ️ Admin user '{settings.ADMIN_USERNAME}' already exists")
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Sistema de Gestión de Préstamos API", "version": "1.0.0"}


@app.get("/api/health")
def health():
    return {"status": "ok"}
