from sqlalchemy.orm import Session
from app.models.activity import ActivityLog

def log_activity(db: Session, event: str, details: str, user: str, event_type: str):
    """Log an audit activity event into SQLite database."""
    try:
        activity = ActivityLog(
            event=event,
            details=details,
            user=user,
            type=event_type
        )
        db.add(activity)
        db.commit()
    except Exception as e:
        print(f"Error writing activity log: {e}")
        db.rollback()
