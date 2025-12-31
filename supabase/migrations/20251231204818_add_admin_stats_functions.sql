-- Function to get total AI costs (admin only)
CREATE OR REPLACE FUNCTION get_total_ai_costs()
RETURNS TABLE (
  "totalCostBRL" NUMERIC,
  "totalTokens" BIGINT,
  "totalRequests" BIGINT,
  "cacheHits" BIGINT,
  "cacheHitRate" NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM("estimatedCostBRL"), 0)::NUMERIC as "totalCostBRL",
    COALESCE(SUM("totalTokens"), 0)::BIGINT as "totalTokens",
    COUNT(*)::BIGINT as "totalRequests",
    SUM(CASE WHEN "cacheHit" = TRUE THEN 1 ELSE 0 END)::BIGINT as "cacheHits",
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((SUM(CASE WHEN "cacheHit" = TRUE THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0
    END as "cacheHitRate"
  FROM "AIUsage"
  WHERE "status" = 'SUCCESS';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get costs by user (admin only)
CREATE OR REPLACE FUNCTION get_costs_by_user()
RETURNS TABLE (
  "userId" TEXT,
  "userEmail" TEXT,
  "userName" TEXT,
  "totalCostBRL" NUMERIC,
  "totalTokens" BIGINT,
  "totalRequests" BIGINT,
  "cacheHits" BIGINT,
  "lastUsed" TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u."id" as "userId",
    u."email" as "userEmail",
    u."name" as "userName",
    COALESCE(SUM(ai."estimatedCostBRL"), 0)::NUMERIC as "totalCostBRL",
    COALESCE(SUM(ai."totalTokens"), 0)::BIGINT as "totalTokens",
    COUNT(ai.*)::BIGINT as "totalRequests",
    SUM(CASE WHEN ai."cacheHit" = TRUE THEN 1 ELSE 0 END)::BIGINT as "cacheHits",
    MAX(ai."createdAt") as "lastUsed"
  FROM "User" u
  LEFT JOIN "AIUsage" ai ON ai."userId" = u."id" AND ai."status" = 'SUCCESS'
  GROUP BY u."id", u."email", u."name"
  HAVING COUNT(ai.*) > 0
  ORDER BY "totalCostBRL" DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
