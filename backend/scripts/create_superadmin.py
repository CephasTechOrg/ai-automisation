"""
Creates a super admin user in Supabase Auth and marks them in user_metadata.
Run from the backend directory:
    source venv/bin/activate
    python scripts/create_superadmin.py
"""
import os, sys
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from supabase import create_client

SUPABASE_URL = os.environ['SUPABASE_URL']
SERVICE_KEY  = os.environ['SUPABASE_SERVICE_ROLE_KEY']

email    = input("Super admin email: ").strip()
password = input("Super admin password (min 8 chars): ").strip()
name     = input("Full name: ").strip()

if not email or not password or not name:
    print("All fields required.")
    sys.exit(1)

if len(password) < 8:
    print("Password must be at least 8 characters.")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SERVICE_KEY)

print("\nCreating user in Supabase Auth...")
try:
    res = supabase.auth.admin.create_user({
        "email": email,
        "password": password,
        "email_confirm": True,          # skip email confirmation
        "user_metadata": {"role": "super_admin", "full_name": name},
    })
    user = res.user
    if not user:
        print("Failed to create user:", res)
        sys.exit(1)
except Exception as e:
    print("Error:", e)
    sys.exit(1)

uid = str(user.id)
print(f"✓ Auth user created: {uid}")
print(f"\nUser ID (save this): {uid}")
print(f"Email:               {email}")
print(f"Metadata role:       super_admin  ← middleware will route you to /admin")
print()
print("─" * 60)
print("NEXT STEPS (after migrations are run):")
print("Run this SQL in Supabase SQL Editor:")
print(f"""
INSERT INTO profiles (id, email, full_name, role)
VALUES ('{uid}', '{email}', '{name}', 'super_admin');
""")
print("─" * 60)
