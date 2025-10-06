-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Users can view their own custom themes" ON public.custom_themes;
DROP POLICY IF EXISTS "Users can insert their own custom themes" ON public.custom_themes;
DROP POLICY IF EXISTS "Users can update their own custom themes" ON public.custom_themes;
DROP POLICY IF EXISTS "Users can delete their own custom themes" ON public.custom_themes;

-- 정책 재생성
CREATE POLICY "Users can view their own custom themes"
  ON public.custom_themes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom themes"
  ON public.custom_themes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom themes"
  ON public.custom_themes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom themes"
  ON public.custom_themes FOR DELETE
  USING (auth.uid() = user_id);

-- scenario_options 테이블에 text 컬럼 추가 (코드가 text를 찾음)
ALTER TABLE public.scenario_options ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE public.scenario_options ADD COLUMN IF NOT EXISTS option_order INTEGER DEFAULT 0;

-- user_progress 테이블에 user_session 컬럼 추가
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS user_session TEXT;

-- wrong_answers 테이블에 correct_count 컬럼 추가
ALTER TABLE public.wrong_answers ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0;

-- 기존 option_text 데이터를 text로 복사
UPDATE public.scenario_options SET text = option_text WHERE text IS NULL;