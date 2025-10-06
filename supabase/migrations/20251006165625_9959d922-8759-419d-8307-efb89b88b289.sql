-- user_progress 테이블에 attempts 컬럼 추가
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 1;

-- wrong_answers 테이블의 user_session 컬럼이 이미 있는지 확인하고 없으면 추가
-- (이미 추가했으므로 문제 없을 것)