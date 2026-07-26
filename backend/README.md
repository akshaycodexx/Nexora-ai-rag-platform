# FastAPI Authentication System

A production-ready, secure **FastAPI Authentication & Authorization System** built using Python, SQLite, SQLAlchemy 2.0, JWT Tokens, and Passlib / Bcrypt password hashing.

---

## 🚀 Features

- 🔐 **User Registration (`/api/v1/auth/signup`)**: Hashes passwords securely using Bcrypt.
- 🔑 **User Login (`/api/v1/auth/login`)**: Supports OAuth2 Password Bearer flow (Swagger UI compatible) & JSON payload login (`/api/v1/auth/login-json`).
- 🪙 **JWT Tokens**: Dual token architecture with **Access Tokens** and **Refresh Tokens** (`/api/v1/auth/refresh`).
- 👤 **Current User Profile (`/api/v1/auth/me`)**: Retrieves authenticated user details.
- 🛡️ **Role-Based Access Control (RBAC)**: Custom dependencies for `user` and `admin` permissions (`/api/v1/protected/admin-only`).
- 📜 **Interactive OpenAPI Documentation**: Built-in Swagger UI at `/docs` with interactive "Authorize" lock button.

---

## 🛠️ Project Structure

```text
backend/
├── app/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py         # Signup, Login, Refresh, Me
│   │   │   └── protected.py    # Protected and Admin-only routes
│   │   └── deps.py             # Auth & RBAC Dependencies
│   ├── core/
│   │   ├── config.py           # Application Settings
│   │   └── security.py         # Password Hashing & JWT Token logic
│   ├── db/
│   │   └── database.py         # SQLAlchemy DB Engine & Sessions
│   ├── models/
│   │   └── user.py             # User Database Model
│   ├── schemas/
│   │   └── user.py             # Pydantic Request/Response Schemas
│   └── main.py                 # FastAPI Application Entrypoint
├── .env                        # Environment Variables
├── .env.example                # Sample Environment Template
└── requirements.txt            # Python Dependencies
```

---

## 📦 Quick Start & Setup

### 1. Create Virtual Environment & Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install required packages
pip install -r requirements.txt
```

### 2. Run the Development Server

```bash
uvicorn app.main:app --reload
```

Server will run at: `http://127.0.0.1:8000`

---

## 🧪 Testing via Swagger UI (`/docs`)

1. Open `http://127.0.0.1:8000/docs` in your web browser.
2. Expand `POST /api/v1/auth/signup` and create a user:
   ```json
   {
     "email": "admin@example.com",
     "username": "adminuser",
     "password": "secretpassword123",
     "role": "admin"
   }
   ```
3. Click the **"Authorize 🔓"** button at top right of the Swagger UI page.
4. Enter `adminuser` (or `admin@example.com`) as `username` and `secretpassword123` as `password`, then click **Authorize**.
5. Test protected endpoints:
   - `GET /api/v1/auth/me`
   - `GET /api/v1/protected/dashboard`
   - `GET /api/v1/protected/admin-only`
