-- ============================================
-- Inbox veld toevoegen
-- Voer dit uit in Supabase SQL Editor
-- ============================================

ALTER TABLE taken ADD COLUMN IF NOT EXISTS inbox boolean DEFAULT false;
ALTER TABLE subtaken ADD COLUMN IF NOT EXISTS inbox boolean DEFAULT false;
ALTER TABLE sub_subtaken ADD COLUMN IF NOT EXISTS inbox boolean DEFAULT false;
