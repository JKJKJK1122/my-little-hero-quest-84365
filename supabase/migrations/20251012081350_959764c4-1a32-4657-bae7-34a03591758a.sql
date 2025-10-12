-- 각 테마별로 최근 10개만 남기고 나머지 시나리오 삭제
WITH ranked_scenarios AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY theme ORDER BY created_at DESC) as rn
  FROM scenarios 
  WHERE category = 'main'
)
DELETE FROM scenarios 
WHERE id IN (
  SELECT id FROM ranked_scenarios WHERE rn > 10
);

-- scenario_options 테이블의 중복 선택지 삭제 (option_order, scenario_id 조합으로 최근 것만 유지)
WITH ranked_options AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY scenario_id, option_order ORDER BY created_at DESC) as rn
  FROM scenario_options
)
DELETE FROM scenario_options 
WHERE id IN (
  SELECT id FROM ranked_options WHERE rn > 1
);