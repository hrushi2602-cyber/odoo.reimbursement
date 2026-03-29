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

# main.py

@app.post("/employee/submit-reimbursement", response_model=schemas.ClaimResponse)
def submit_reimbursement(claim_data: schemas.ClaimCreate, db: Session = Depends(get_db)):
    
    # 1. Fetch the Employee to get their potential manager
    employee = db.query(models.User).filter(models.User.id == claim_data.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # 2. Check the Rules for this amount
    rule = db.query(models.ExpenseRule).filter(
        models.ExpenseRule.min_range <= claim_data.amount,
        models.ExpenseRule.max_range >= claim_data.amount
    ).first()

    # 3. Determine the Approver
    assigned_manager = None
    if rule and rule.is_manager_approver:
        assigned_manager = employee.manager_id
    
    if rule and rule.is_manager_approver and not assigned_manager:
        raise HTTPException(status_code=400, detail="This claim requires manager approval, but you have no manager assigned.")

    # 4. Create and Save
    new_claim = models.Claim(
        amount=claim_data.amount,
        description=claim_data.description,
        status=models.ClaimStatus.PENDING,
        employee_id=employee.id,
        manager_id=assigned_manager
    )

    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)

    return new_claim