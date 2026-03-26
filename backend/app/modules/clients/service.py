from sqlalchemy.orm import Session
from app.modules.clients.model import Client
from app.modules.clients.schemas import ClientCreate, ClientUpdate


def get_client(db: Session, client_id: int):
    return db.query(Client).filter(Client.id == client_id).first()


def get_client_by_documento(db: Session, documento: str):
    return db.query(Client).filter(Client.documento == documento).first()


def get_clients(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(Client)
    if search:
        query = query.filter(
            (Client.nombre.ilike(f"%{search}%")) | (Client.documento.ilike(f"%{search}%"))
        )
    return query.order_by(Client.created_at.desc()).offset(skip).limit(limit).all()


def get_clients_count(db: Session, search: str = None):
    query = db.query(Client)
    if search:
        query = query.filter(
            (Client.nombre.ilike(f"%{search}%")) | (Client.documento.ilike(f"%{search}%"))
        )
    return query.count()


def create_client(db: Session, client: ClientCreate):
    db_client = Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


def update_client(db: Session, client_id: int, client_update: ClientUpdate):
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if not db_client:
        return None
    update_data = client_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_client, key, value)
    db.commit()
    db.refresh(db_client)
    return db_client


def delete_client(db: Session, client_id: int):
    db_client = db.query(Client).filter(Client.id == client_id).first()
    if db_client:
        db.delete(db_client)
        db.commit()
    return db_client
