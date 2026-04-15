-- Run this in the Supabase SQL editor to enable recurring tasks.
-- Safe to re-run.
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS recurrence TEXT DEFAULT NULL
  CHECK (recurrence IS NULL OR recurrence IN ('daily', 'weekly', 'monthly'));
