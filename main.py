# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, security
from database import engine, get_db
from sqlalchemy import or_, and_
from typing import List

# Automatically creates your tables in Neon!
models.Base.metadata.create_all(bind=engine)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS Middleware to enable requests from the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# In main.py
@app.post("/employee/submit-reimbursement", response_model=schemas.ClaimResponse)
def submit_reimbursement(claim_data: schemas.ClaimCreate, db: Session = Depends(get_db)):
    
    employee = db.query(models.User).filter(models.User.id == claim_data.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # 1. Check the Rules Engine
    rule = db.query(models.ExpenseRule).filter(
        models.ExpenseRule.min_range <= claim_data.amount,
        models.ExpenseRule.max_range >= claim_data.amount
    ).first()

    # 2. Determine Manager
    assigned_manager = None
    manager_required_flag = False # Default to false
    
    if rule and rule.is_manager_approver:
        assigned_manager = employee.manager_id
        manager_required_flag = True # Set to true if the rule demands it
    
    if manager_required_flag and not assigned_manager:
        raise HTTPException(status_code=400, detail="This claim requires manager approval, but you have no manager assigned.")

    # 2. Grab the extra approvers list directly from the rule
    approvers_list = []
    if rule and rule.rule_approvers:
        approvers_list = rule.rule_approvers

    is_seq = rule.is_sequential if rule else False
    current_step = -1
    pending_id = None

    if is_seq:
        if manager_required_flag and assigned_manager:
            pending_id = assigned_manager # Manager is first
            current_step = -1
        elif len(approvers_list) > 0:
            pending_id = approvers_list[0] # First person in array is first
            current_step = 0
        else:
            is_seq = False # Fallback: No one to sequence
    # 3. Save it all, including the new flag
    new_claim = models.Claim(
        amount=claim_data.amount,
        description=claim_data.description,
        status=models.ClaimStatus.PENDING,
        employee_id=employee.id,
        manager_id=assigned_manager,
        is_manager_required=manager_required_flag, # <--- The new column!
        required_approvers=approvers_list,  
        is_sequential=is_seq,            # <--- New
        pending_with_id=pending_id,      # <--- New
        current_step_index=current_step
    )

    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)

    return new_claim

@app.post("/admin/create-rule", response_model=schemas.ExpenseRuleResponse)
def create_expense_rule(rule_data: schemas.ExpenseRuleCreate, db: Session = Depends(get_db)):
    
    # 1. Validate the approvers still exist in the database
    if rule_data.approver_ids:
        existing_users = db.query(models.User).filter(
            models.User.id.in_(rule_data.approver_ids)
        ).count()
        
        if existing_users != len(rule_data.approver_ids):
            raise HTTPException(
                status_code=400, 
                detail="One or more approver IDs do not exist."
            )

    # 2. Create the rule (Notice we just pass the list directly now!)
    new_rule = models.ExpenseRule(
        min_range=rule_data.min_range,
        max_range=rule_data.max_range,
        is_manager_approver=rule_data.is_manager_approver,
        rule_approvers=rule_data.approver_ids,  # <--- SO MUCH CLEANER
        is_sequential=rule_data.is_sequential
    )

    db.add(new_rule)
    db.commit()
    db.refresh(new_rule)

    return new_rule

@app.get("/manager/claims/{manager_id}", response_model=List[schemas.ClaimResponse])
def get_manager_dashboard_claims(manager_id: int, db: Session = Depends(get_db)):
    claims = db.query(models.Claim).filter(
        models.Claim.status == models.ClaimStatus.PENDING,
        or_(
            # If Sequential: It must be EXACTLY your turn
            and_(models.Claim.is_sequential == True, models.Claim.pending_with_id == manager_id),
            
            # If Parallel (False): Anyone in the pool can grab it
            and_(
                models.Claim.is_sequential == False,
                or_(
                    models.Claim.manager_id == manager_id,
                    models.Claim.required_approvers.any(manager_id)
                )
            )
        )
    ).all()
    return claims


@app.patch("/manager/claims/{claim_id}/status", response_model=schemas.ClaimResponse)
def update_claim_status(claim_id: int, update_data: schemas.ClaimStatusUpdate, db: Session = Depends(get_db)):
    
    # 1. Find the claim
    claim = db.query(models.Claim).filter(models.Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    # 2. Authorization Security Check
    is_direct_manager = (claim.manager_id == update_data.manager_id and claim.is_manager_required)
    
    # Safely check if they are in the array
    is_rule_approver = False
    if claim.required_approvers:
        is_rule_approver = (update_data.manager_id in claim.required_approvers)

    if not (is_direct_manager or is_rule_approver):
        raise HTTPException(status_code=403, detail="You do not have permission to approve or reject this claim.")

    # 3. Update the Status
    target_status = update_data.status.lower()
    
    if target_status == "rejected":
        claim.status = models.ClaimStatus.REJECTED
        claim.pending_with_id = None # Kills the sequence
        
    elif target_status == "approved":
        if claim.is_sequential:
            # 🚀 STATE MACHINE: Look for the next person
            next_index = claim.current_step_index + 1
            
            # FAST-FORWARD LOGIC: Skip people we don't need to ask again
            if claim.required_approvers:
                while next_index < len(claim.required_approvers):
                    next_approver_id = claim.required_approvers[next_index]
                    
                    # Skip if it's the Direct Manager OR the person who just clicked approve
                    if next_approver_id == claim.manager_id or next_approver_id == update_data.manager_id:
                        next_index += 1
                    else:
                        break # Found a valid new person!

            # Did we find someone new, or did we run out of people?
            if claim.required_approvers and next_index < len(claim.required_approvers):
                claim.current_step_index = next_index
                claim.pending_with_id = claim.required_approvers[next_index]
            else:
                # We skipped everyone or reached the end! Fully Approved.
                claim.status = models.ClaimStatus.APPROVED
                claim.pending_with_id = None
        else:
            # Parallel flow: First person to approve finishes it
            claim.status = models.ClaimStatus.APPROVED
    else:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'approved' or 'rejected'.")

    # 4. Save the changes
    db.commit()
    db.refresh(claim)

    return claim
@app.get("/employee/my-claims/{employee_id}", response_model=List[schemas.ClaimResponse])
def get_my_claims(employee_id: int, db: Session = Depends(get_db)):
    
    # Fetch every claim where the employee_id matches the logged-in user
    claims = db.query(models.Claim).filter(
        models.Claim.employee_id == employee_id
    ).order_by(models.Claim.id.desc()).all() # Orders them newest to oldest
    
    if not claims:
        # Returning an empty list is better than an error if they have no history!
        return [] 
        
    return claims