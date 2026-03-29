# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, security
from database import engine, get_db

# Automatically creates your tables in Neon!
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.post("/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    # 1. Find user by email
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    
    # 2. Check if user exists and password matches
    if not user or not security.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Credentials")
    
    return {"message": "Login successful", "role": user.role.value, "user_id": user.id}

@app.post("/create-user", response_model=schemas.UserResponse)
def create_user(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Check if email exists
    if db.query(models.User).filter(models.User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Convert string role to Enum safely
    try:
        user_role = models.UserRole(user_data.role.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid role. Use admin, manager, or employee.")

    # 3. Employee rules check
    if user_role == models.UserRole.EMPLOYEE and not user_data.manager_id:
        raise HTTPException(status_code=400, detail="Employee must have a manager assigned")

    # 4. Hash the password
    hashed_pwd = security.hash_password(user_data.password)

    # 5. Create the database record
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_pwd,
        role=user_role,
        employee_id=user_data.employee_id,
        institution_id=user_data.institution_id,
        manager_id=user_data.manager_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user