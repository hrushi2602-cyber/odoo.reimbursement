# models.py
from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import enum

class UserRole(enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Notice we pass the UserRole enum class here
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE, nullable=False)
    
    employee_id = Column(String, unique=True, nullable=True)
    institution_id = Column(String, nullable=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Sets up the manager-employee relationship
    manager = relationship("User", remote_side=[id], backref="employees")