-- SECURITY FIX: Restore email validation in trigger
-- The previous approach was insecure - anyone with DB access could promote themselves
-- We need BOTH protections: trigger (DB level) + env var (app level)

DROP TRIGGER IF EXISTS protect_admin_role_trigger ON "User";
DROP FUNCTION IF EXISTS validate_admin_role();

CREATE OR REPLACE FUNCTION validate_admin_role()
RETURNS TRIGGER AS $$
DECLARE
  admin_email TEXT := 'matheus.lima@ccc.ufcg.edu.br';
BEGIN
  -- For INSERT or UPDATE: Only allow ADMIN role for the specific email
  IF NEW.role = 'ADMIN' AND NEW.email::TEXT <> admin_email THEN
    RAISE EXCEPTION 'Unauthorized: Only % can have ADMIN role', admin_email;
  END IF;

  -- Prevent removing ADMIN role from the admin user
  IF TG_OP = 'UPDATE' AND OLD.role = 'ADMIN' AND OLD.email::TEXT = admin_email AND NEW.role <> 'ADMIN' THEN
    RAISE EXCEPTION 'Unauthorized: Cannot remove ADMIN role from system administrator';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_admin_role_trigger
  BEFORE INSERT OR UPDATE OF role ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION validate_admin_role();

-- Ensure admin user has ADMIN role
UPDATE "User" SET role = 'ADMIN' WHERE email = 'matheus.lima@ccc.ufcg.edu.br';

-- Clean up: Remove ADMIN role from unauthorized users
UPDATE "User" SET role = 'USER' WHERE role = 'ADMIN' AND email::TEXT <> 'matheus.lima@ccc.ufcg.edu.br';
