-- SECURITY: Complete protection for admin account
-- Prevent DELETE and UPDATE (email change) on admin account

DROP TRIGGER IF EXISTS protect_admin_role_trigger ON "User";
DROP FUNCTION IF EXISTS validate_admin_role();

CREATE OR REPLACE FUNCTION validate_admin_role()
RETURNS TRIGGER AS $$
DECLARE
  admin_email TEXT := 'matheus.lima@ccc.ufcg.edu.br';
BEGIN
  -- Prevent DELETE of admin account
  IF TG_OP = 'DELETE' AND OLD.email::TEXT = admin_email THEN
    RAISE EXCEPTION 'Unauthorized: Cannot delete the system administrator account';
  END IF;

  -- Prevent UPDATE of admin email (someone trying to steal admin role)
  IF TG_OP = 'UPDATE' AND OLD.email::TEXT = admin_email AND NEW.email::TEXT <> admin_email THEN
    RAISE EXCEPTION 'Unauthorized: Cannot change the system administrator email';
  END IF;

  -- Prevent UPDATE to steal admin role by changing their email to admin email
  IF TG_OP = 'UPDATE' AND OLD.email::TEXT <> admin_email AND NEW.email::TEXT = admin_email THEN
    RAISE EXCEPTION 'Unauthorized: Cannot change email to system administrator email';
  END IF;

  -- Only allow ADMIN role for the specific email
  IF NEW.role = 'ADMIN' AND NEW.email::TEXT <> admin_email THEN
    RAISE EXCEPTION 'Unauthorized: Only % can have ADMIN role', admin_email;
  END IF;

  -- Prevent removing ADMIN role from admin user
  IF TG_OP = 'UPDATE' AND OLD.role = 'ADMIN' AND OLD.email::TEXT = admin_email AND NEW.role <> 'ADMIN' THEN
    RAISE EXCEPTION 'Unauthorized: Cannot remove ADMIN role from system administrator';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_admin_role_trigger
  BEFORE INSERT OR UPDATE OR DELETE ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION validate_admin_role();

-- Ensure admin user has ADMIN role
UPDATE "User" SET role = 'ADMIN' WHERE email = 'matheus.lima@ccc.ufcg.edu.br';
