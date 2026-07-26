from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.core.security import hash_password
from app.services.activity_logger import log_activity

router = APIRouter(prefix="/users", tags=["Users Management"])

@router.get("", response_model=list[UserResponse])
def list_users(email: str | None = None, db: Session = Depends(get_db)):
    """List registered users, filtered by email when specified."""
    query = db.query(User)
    if email:
        query = query.filter(User.email == email)
    users = query.order_by(User.id.desc()).all()
    return users

@router.post("/invite", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def invite_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Invite and register a new user in the organization."""
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already registered"
        )
    
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken"
        )

    new_user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hash_password(user_in.password),
        role=user_in.role or "user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log_activity(db, "User Invited", f"Added user {new_user.username} ({new_user.email}) as {new_user.role}", "Admin", "auth")
    return new_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Revoke access and delete user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    username = user.username
    db.delete(user)
    db.commit()

    log_activity(db, "User Revoked", f"Revoked access for user {username} (ID {user_id})", "Admin", "auth")
    return {"message": f"User {username} deleted successfully"}
