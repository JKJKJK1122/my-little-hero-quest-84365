-- Add difficulty_level column to scenarios table
ALTER TABLE scenarios ADD COLUMN difficulty_level integer DEFAULT 2;

-- Add comment to the column
COMMENT ON COLUMN scenarios.difficulty_level IS '난이도 레벨: 1=쉬운 단계, 2=보통 단계, 3=어려운 단계';