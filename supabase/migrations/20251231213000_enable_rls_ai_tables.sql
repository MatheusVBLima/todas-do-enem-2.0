-- Enable RLS on AI-related tables
ALTER TABLE "AIUsage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserAIQuota" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own AI usage" ON "AIUsage";
DROP POLICY IF EXISTS "Users can view their own quota" ON "UserAIQuota";
DROP POLICY IF EXISTS "Service role has full access to AIUsage" ON "AIUsage";
DROP POLICY IF EXISTS "Service role has full access to UserAIQuota" ON "UserAIQuota";

-- AIUsage policies
-- Users can only view their own usage
CREATE POLICY "Users can view their own AI usage"
  ON "AIUsage"
  FOR SELECT
  USING (auth.uid()::TEXT = "userId");

-- Only service role can insert/update/delete (via server actions)
CREATE POLICY "Service role has full access to AIUsage"
  ON "AIUsage"
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- UserAIQuota policies
-- Users can only view their own quota
CREATE POLICY "Users can view their own quota"
  ON "UserAIQuota"
  FOR SELECT
  USING (auth.uid()::TEXT = "userId");

-- Only service role can insert/update/delete (via server actions)
CREATE POLICY "Service role has full access to UserAIQuota"
  ON "UserAIQuota"
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
