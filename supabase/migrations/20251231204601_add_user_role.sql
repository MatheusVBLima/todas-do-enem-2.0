-- Add role field to User table
ALTER TABLE "User"
ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER' CHECK ("role" IN ('USER', 'ADMIN'));

-- Create index for faster admin queries
CREATE INDEX "User_role_idx" ON "User"("role");

-- Update your user to be admin (replace with your actual email)
-- UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'your-email@example.com';
