-- SECURITY: Prevent users from promoting themselves to ADMIN role
-- Only the specific admin email can have ADMIN role

-- Create function to validate admin role changes
CREATE OR REPLACE FUNCTION validate_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow setting ADMIN role only for the authorized email
  IF NEW.role = 'ADMIN' AND NEW.email::TEXT <> 'matheus.lima@ccc.ufcg.edu.br' THEN
    RAISE EXCEPTION 'Unauthorized: Only the system administrator can have ADMIN role';
  END IF;

  -- Prevent removing ADMIN role from the authorized email
  IF OLD.role = 'ADMIN' AND OLD.email::TEXT = 'matheus.lima@ccc.ufcg.edu.br' AND NEW.role <> 'ADMIN' THEN
    RAISE EXCEPTION 'Unauthorized: Cannot remove ADMIN role from system administrator';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on User table to enforce admin role protection
DROP TRIGGER IF EXISTS protect_admin_role_trigger ON "User";
CREATE TRIGGER protect_admin_role_trigger
  BEFORE INSERT OR UPDATE OF role ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION validate_admin_role();

-- Ensure the admin user has ADMIN role (idempotent)
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'matheus.lima@ccc.ufcg.edu.br' AND role != 'ADMIN';
