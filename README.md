# PrestaFácil - Sistema de Gestión de Préstamos

Sistema web profesional para administrar préstamos en pesos colombianos (COP), tipo "gota a gota" legal.

## Inicio Rápido

### Requisitos
- Docker y Docker Compose instalados

### Ejecutar el proyecto

```bash
docker-compose up --build
```

### Acceder al sistema
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs

### Credenciales por defecto
| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Contraseña | `admin123` |

---

## Stack Tecnológico

| Componente | Tecnología |
|------------|-----------|
| Backend | Python 3.11, FastAPI, SQLAlchemy |
| Frontend | React 18, Vite, TailwindCSS |
| Base de datos | MySQL 8.0 |
| Auth | JWT + Bcrypt |
| Infraestructura | Docker, Docker Compose |

---

## Estructura del Proyecto

```
├── backend/
│   ├── app/
│   │   ├── main.py              # App FastAPI + startup seed
│   │   ├── core/                # Config, seguridad, dependencias
│   │   ├── db/                  # Base y sesión SQLAlchemy
│   │   └── modules/
│   │       ├── auth/            # Login JWT
│   │       ├── users/           # CRUD usuarios (admin)
│   │       ├── clients/         # CRUD clientes
│   │       ├── loans/           # Préstamos + auto-cálculo
│   │       ├── installments/    # Cuotas + pagos
│   │       └── dashboard/       # KPIs agregados
│   ├── alembic/                 # Migraciones
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Rutas protegidas
│   │   ├── app/AuthContext.jsx  # Contexto JWT
│   │   ├── services/api.js      # Cliente Axios
│   │   ├── layouts/             # Sidebar layout
│   │   └── modules/             # Páginas por módulo
│   ├── package.json
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── .env
└── README.md
```

---

## Endpoints Principales

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, retorna JWT |

### Clientes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clients/` | Listar clientes |
| POST | `/api/clients/` | Crear cliente |
| GET | `/api/clients/{id}/detail` | Detalle con préstamos |
| PUT | `/api/clients/{id}` | Actualizar |
| DELETE | `/api/clients/{id}` | Eliminar |

### Préstamos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/loans/` | Listar préstamos |
| POST | `/api/loans/` | Crear (genera cuotas) |
| GET | `/api/loans/{id}` | Detalle con cuotas |
| DELETE | `/api/loans/{id}` | Eliminar |

### Cuotas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/installments/loan/{id}` | Cuotas de un préstamo |
| PUT | `/api/installments/{id}/pay` | Marcar como pagada |
| GET | `/api/installments/calendar` | Cuotas por rango de fechas |

### Dashboard
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/dashboard/` | KPIs del sistema |

---

## Roles

| Rol | Permisos |
|-----|----------|
| **admin** | Gestión completa + crear usuarios |
| **trabajador** | Clientes, préstamos, cuotas |

---

## Lógica de Préstamos

Al crear un préstamo:
1. Se calcula el interés sobre el monto
2. Se calcula el total a pagar (monto + interés)
3. Se divide en N cuotas iguales
4. Se generan las fechas de pago según la frecuencia (diario/semanal/mensual)
5. Todo se guarda automáticamente en la base de datos

---

## Variables de Entorno (.env)

```env
MYSQL_DATABASE=prestamos_db
MYSQL_USER=prestamos_user
MYSQL_PASSWORD=prestamos_pass_2024
DATABASE_URL=mysql+pymysql://...
SECRET_KEY=super-secret-jwt-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

> Cambia `SECRET_KEY` y las contraseñas antes de desplegar en producción.
"# PrestaFacil" 
