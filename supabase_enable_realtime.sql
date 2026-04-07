-- Run this in your Supabase SQL Editor to enable realtime sync across devices.
-- This allows changes on one device to instantly appear on another.

-- Enable realtime for tasks table
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;

-- Enable realtime for goals table
ALTER PUBLICATION supabase_realtime ADD TABLE goals;

-- Enable realtime for plans table
ALTER PUBLICATION supabase_realtime ADD TABLE plans;
