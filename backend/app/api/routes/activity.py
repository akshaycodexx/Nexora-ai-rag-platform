from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.activity import ActivityLog

router = APIRouter(prefix="/activity", tags=["Audit Activity Logs"])

@router.get("/logs")
def get_activity_logs(user: str | None = None, db: Session = Depends(get_db)):
    """Fetch audit event logs sorted newest first, strictly filtered by user when specified."""
    query = db.query(ActivityLog)
    if user and user != "System Admin" and user != "Admin":
        query = query.filter(ActivityLog.user == user)
    logs = query.order_by(ActivityLog.id.desc()).limit(100).all()
    
    # Return structured logs with formatted timestamps
    result = []
    for log in logs:
        time_str = log.created_at.strftime("%H:%M:%S • %d %b") if log.created_at else "Recently"
        result.append({
            "id": log.id,
            "event": log.event,
            "details": log.details,
            "user": log.user,
            "type": log.type,
            "time": time_str
        })
    return result
