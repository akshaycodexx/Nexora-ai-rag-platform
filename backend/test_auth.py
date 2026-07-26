import sys
import os

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import Base, engine, SessionLocal
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token

def test_system():
    print("1. Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("   Tables created successfully!")

    db = SessionLocal()

    # Clear old test data if exists
    existing = db.query(User).filter(User.username == "testuser").first()
    if existing:
        db.delete(existing)
        db.commit()

    print("\n2. Testing password hashing...")
    raw_pass = "SecurePass123!"
    hashed = hash_password(raw_pass)
    print(f"   Raw Password: {raw_pass}")
    print(f"   Hashed Password: {hashed}")
    assert verify_password(raw_pass, hashed) == True
    assert verify_password("WrongPass", hashed) == False
    print("   Password hashing & verification passed!")

    print("\n3. Creating test user in DB...")
    test_user = User(
        email="test@example.com",
        username="testuser",
        hashed_password=hashed,
        role="admin"
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    print(f"   User Created: ID={test_user.id}, Username={test_user.username}, Role={test_user.role}")

    print("\n4. Testing JWT token generation & decoding...")
    access_token = create_access_token(subject=test_user.id, role=test_user.role)
    refresh_token = create_refresh_token(subject=test_user.id)
    print(f"   Access Token: {access_token[:30]}...")
    print(f"   Refresh Token: {refresh_token[:30]}...")

    access_payload = decode_token(access_token)
    refresh_payload = decode_token(refresh_token)

    assert access_payload["sub"] == str(test_user.id)
    assert access_payload["role"] == "admin"
    assert access_payload["type"] == "access"
    assert refresh_payload["type"] == "refresh"

    print("   JWT token validation passed!")
    print("\n[SUCCESS] ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_system()
