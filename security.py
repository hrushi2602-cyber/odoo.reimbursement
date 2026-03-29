# security.py
import bcrypt

def hash_password(password: str) -> str:
    # 1. Convert the password string to bytes
    pwd_bytes = password.encode('utf-8')
    
    # 2. Generate a secure salt and hash the password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    
    # 3. Convert back to a string so it can be saved in your database
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Convert both the plain password and the stored hash into bytes for comparison
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_byte_enc = hashed_password.encode('utf-8')
    
    return bcrypt.checkpw(password_byte_enc, hashed_password_byte_enc)