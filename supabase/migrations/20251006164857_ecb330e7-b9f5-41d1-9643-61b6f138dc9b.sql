-- 커스텀 테마 테이블
CREATE TABLE IF NOT EXISTS public.custom_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.custom_themes ENABLE ROW LEVEL SECURITY;

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

-- 시나리오 테이블
CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL,
  custom_theme_id UUID REFERENCES public.custom_themes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  situation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scenarios"
  ON public.scenarios FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own scenarios"
  ON public.scenarios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenarios"
  ON public.scenarios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenarios"
  ON public.scenarios FOR DELETE
  USING (auth.uid() = user_id);

-- 시나리오 선택지 테이블
CREATE TABLE IF NOT EXISTS public.scenario_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.scenario_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view scenario options"
  ON public.scenario_options FOR SELECT
  USING (true);

CREATE POLICY "Users can insert scenario options for their scenarios"
  ON public.scenario_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = scenario_id AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scenario options for their scenarios"
  ON public.scenario_options FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = scenario_id AND scenarios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scenario options for their scenarios"
  ON public.scenario_options FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.scenarios
      WHERE scenarios.id = scenario_id AND scenarios.user_id = auth.uid()
    )
  );

-- 사용자 진행 상황 테이블 (기존과 다른 구조)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 오답 노트 테이블
CREATE TABLE IF NOT EXISTS public.wrong_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES public.scenarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.wrong_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wrong answers"
  ON public.wrong_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wrong answers"
  ON public.wrong_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wrong answers"
  ON public.wrong_answers FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 트리거 추가
CREATE TRIGGER update_custom_themes_updated_at
  BEFORE UPDATE ON public.custom_themes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON public.scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();