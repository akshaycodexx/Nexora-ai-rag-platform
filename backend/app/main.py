from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.api.routes import auth, protected, rag, users, dashboard, guardrails, activity, settings as settings_route

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

# Auto-migrate missing columns for SQLite
try:
    with engine.connect() as conn:
        from sqlalchemy import text
        res = conn.execute(text("PRAGMA table_info(system_settings)"))
        columns = [row[1] for row in res.fetchall()]
        new_cols = [
            ("embedding_provider", "VARCHAR DEFAULT 'local'"),
            ("embedding_api_key", "VARCHAR DEFAULT ''"),
            ("custom_llm_provider", "VARCHAR DEFAULT 'gemini'"),
            ("custom_llm_name", "VARCHAR DEFAULT 'gemini-1.5-flash'"),
            ("custom_llm_base_url", "VARCHAR DEFAULT ''"),
            ("groq_api_key", "VARCHAR DEFAULT ''"),
            ("top_k", "INTEGER DEFAULT 4"),
            ("vector_db_provider", "VARCHAR DEFAULT 'sqlite_vector'"),
            ("vector_db_path", "VARCHAR DEFAULT './sql_app.db'")
        ]
        for col_name, col_type in new_cols:
            if col_name not in columns:
                conn.execute(text(f"ALTER TABLE system_settings ADD COLUMN {col_name} {col_type}"))
        conn.commit()
except Exception as e:
    print(f"Startup schema check notice: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise RAG & Authorization System with Multi-Format Parsing, Guardrails, and DB Analytics.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All API Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(protected.router, prefix="/api/v1")
app.include_router(rag.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(guardrails.router, prefix="/api/v1")
app.include_router(activity.router, prefix="/api/v1")
app.include_router(settings_route.router, prefix="/api/v1")

@app.get("/", tags=["Health Check"])
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "Online",
        "docs_url": "/docs",
        "version": "2.0.0"
    }
