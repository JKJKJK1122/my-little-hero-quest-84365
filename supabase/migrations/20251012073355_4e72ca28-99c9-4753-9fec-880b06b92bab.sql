-- Remove all auth-dependent RLS policies and create public access policies

-- Profiles table: Allow public access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Allow public profile access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Pets table: Allow public access
DROP POLICY IF EXISTS "Users can view their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can insert their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON public.pets;

CREATE POLICY "Allow public pet access" ON public.pets FOR ALL USING (true) WITH CHECK (true);

-- Custom themes table: Allow public access
DROP POLICY IF EXISTS "Users can view their own custom themes" ON public.custom_themes;
DROP POLICY IF EXISTS "Users can insert their own custom themes" ON public.custom_themes;
DROP POLICY IF EXISTS "Users can update their own custom themes" ON public.custom_themes;
DROP POLICY IF EXISTS "Users can delete their own custom themes" ON public.custom_themes;

CREATE POLICY "Allow public custom themes access" ON public.custom_themes FOR ALL USING (true) WITH CHECK (true);

-- Game progress table: Allow public access
DROP POLICY IF EXISTS "Users can view their own progress" ON public.game_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.game_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.game_progress;

CREATE POLICY "Allow public game progress access" ON public.game_progress FOR ALL USING (true) WITH CHECK (true);

-- Scenarios table: Allow public access (already has view policy, add insert/update/delete)
DROP POLICY IF EXISTS "Users can insert their own scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "Users can update their own scenarios" ON public.scenarios;
DROP POLICY IF EXISTS "Users can delete their own scenarios" ON public.scenarios;

CREATE POLICY "Allow public scenario modifications" ON public.scenarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public scenario updates" ON public.scenarios FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public scenario deletions" ON public.scenarios FOR DELETE USING (true);

-- Scenario options table: Allow public modifications
DROP POLICY IF EXISTS "Users can insert scenario options for their scenarios" ON public.scenario_options;
DROP POLICY IF EXISTS "Users can update scenario options for their scenarios" ON public.scenario_options;
DROP POLICY IF EXISTS "Users can delete scenario options for their scenarios" ON public.scenario_options;

CREATE POLICY "Allow public scenario options insert" ON public.scenario_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public scenario options update" ON public.scenario_options FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public scenario options delete" ON public.scenario_options FOR DELETE USING (true);

-- User progress table: Allow public access
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_progress;

CREATE POLICY "Allow public user progress access" ON public.user_progress FOR ALL USING (true) WITH CHECK (true);

-- Wrong answers table: Allow public access
DROP POLICY IF EXISTS "Users can view their own wrong answers" ON public.wrong_answers;
DROP POLICY IF EXISTS "Users can insert their own wrong answers" ON public.wrong_answers;
DROP POLICY IF EXISTS "Users can delete their own wrong answers" ON public.wrong_answers;

CREATE POLICY "Allow public wrong answers access" ON public.wrong_answers FOR ALL USING (true) WITH CHECK (true);