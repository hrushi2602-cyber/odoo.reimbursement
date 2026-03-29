# schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional

# Data needed to register
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    employee_id: Optional[str] = None
    institution_id: Optional[str] = None
    manager_id: Optional[int] = None

# Data needed to log in
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
# Data we send back to the user (notice there is no password field here!)
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    employee_id: Optional[str]
    institution_id: Optional[str]
    manager_id: Optional[int]

# schemas.py

# ... keep your existing UserCreate, UserLogin, UserResponse ...

# 1. What the Employee Dashboard sends to the server
class ClaimCreate(BaseModel):
    employee_id: int
    amount: float
    description: str

# 2. What the server sends back to the Dashboard
class ClaimResponse(BaseModel):
    id: int
    amount: float
    description: str
    status: str
    employee_id: int
    manager_id: Optional[int] = None

    class Config:
        from_attributes = True # This allows Pydantic to read from SQLAlchemy models