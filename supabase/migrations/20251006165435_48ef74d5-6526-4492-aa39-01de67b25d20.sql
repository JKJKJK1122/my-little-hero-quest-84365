-- scenarios 테이블에 category 컬럼 추가
ALTER TABLE public.scenarios ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'main';

-- 인덱스 추가로 검색 성능 향상
CREATE INDEX IF NOT EXISTS idx_scenarios_category ON public.scenarios(category);
CREATE INDEX IF NOT EXISTS idx_scenarios_theme ON public.scenarios(theme);