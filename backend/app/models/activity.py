from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from app.db.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    event = Column(String, nullable=False)
    details = Column(String, nullable=False)
    user = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'document' | 'security' | 'settings' | 'auth'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<ActivityLog(id={self.id}, event='{self.event}', user='{self.user}')>"
