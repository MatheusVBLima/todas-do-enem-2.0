-- SECURITY: Update trigger to use a more flexible approach
-- Create a helper function to get admin email from User table instead of hardcoding

-- Drop old trigger
DROP TRIGGER IF EXISTS protect_admin_role_trigger ON "User";
DROP FUNCTION IF EXISTS validate_admin_role();

-- Create new validation function that checks if user is currently an ADMIN
-- This allows the ADMIN_EMAIL env var to control who is admin via the application code
CREATE OR REPLACE FUNCTION validate_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow INSERT with ADMIN role (will be validated by application code)
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- For UPDATE: Prevent removing ADMIN role from existing admins
  -- This protects against accidental demotion but allows promoting via app
  IF TG_OP = 'UPDATE' AND OLD.role = 'ADMIN' AND NEW.role != 'ADMIN' THEN
    -- Check if this is the last admin in the system
    IF (SELECT COUNT(*) FROM "User" WHERE role = 'ADMIN') = 1 THEN
      RAISE EXCEPTION 'Cannot remove ADMIN role: at least one admin must exist';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER protect_admin_role_trigger
  BEFORE INSERT OR UPDATE OF role ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION validate_admin_role();

-- Note: Admin email validation is now handled by application code (ADMIN_EMAIL env var)
-- The trigger only prevents accidental removal of the last admin
