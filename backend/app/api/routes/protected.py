from fastapi import APIRouter, Depends
from app.api.deps import get_current_active_user, require_role
from app.models.user import User

router = APIRouter(prefix="/protected", tags=["Protected Routes"])

@router.get("/dashboard")
def get_user_dashboard(current_user: User = Depends(get_current_active_user)):
    """User dashboard accessible by any authenticated active user."""
    return {
        "message": f"Welcome to your dashboard, {current_user.username}!",
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "status": "Authenticated"
    }

@router.get("/admin-only", dependencies=[Depends(require_role(["admin"]))])
def get_admin_dashboard(current_user: User = Depends(get_current_active_user)):
    """Admin-only area accessible strictly by users with 'admin' role."""
    return {
        "message": f"Welcome Admin {current_user.username}! Access Granted to Restricted Area.",
        "role": current_user.role,
        "admin_secret_data": "Top secret admin configuration & analytics payload."
    }
