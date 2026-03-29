from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Float, Boolean
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from database import Base
import enum

# --- ENUMS (Must be at the top) ---

class UserRole(enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"

class ClaimStatus(enum.Enum):  # <--- ADDED THIS TO FIX YOUR ERROR
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# --- TABLES ---

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE, nullable=False)
    employee_id = Column(String, unique=True, nullable=True)
    institution_id = Column(String, nullable=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    manager = relationship("User", remote_side=[id], backref="employees")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    status = Column(Enum(ClaimStatus), default=ClaimStatus.PENDING, nullable=False)
    
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    is_manager_required = Column(Boolean, default=False)
    # NEW: Now natively stores the array of approver IDs
    required_approvers = Column(ARRAY(Integer), default=[]) 

    employee = relationship("User", foreign_keys=[employee_id])
    manager = relationship("User", foreign_keys=[manager_id])
    is_sequential = Column(Boolean, default=False)
    pending_with_id = Column(Integer, nullable=True) # Exactly whose turn it is
    current_step_index = Column(Integer, default=-1) # -1 = Manager, 0 = Array[0], etc.

class ExpenseRule(Base):
    __tablename__ = "expense_rule"

    id = Column(Integer, primary_key=True, index=True)
    min_range = Column(Float, nullable=False)
    max_range = Column(Float, nullable=False)
    is_manager_approver = Column(Boolean, default=True)
    min_approval_percent = Column(Float, nullable=True)
    # NEW: Natively stores a list of integers! No strings attached.
    rule_approvers = Column(ARRAY(Integer), default=[])
    is_sequential = Column(Boolean, default=False)