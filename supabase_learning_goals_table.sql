-- Run this in your Supabase SQL Editor to create the learning_goals table
CREATE TABLE IF NOT EXISTS learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  done BOOLEAN DEFAULT false,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_goals_user_id ON learning_goals(user_id);

-- Enable Row Level Security
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own learning goals
CREATE POLICY "Users can view own learning goals" ON learning_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning goals" ON learning_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning goals" ON learning_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own learning goals" ON learning_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for cross-device sync
ALTER PUBLICATION supabase_realtime ADD TABLE learning_goals;
