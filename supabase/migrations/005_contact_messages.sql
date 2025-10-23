-- Migration: Contact Messages System
-- Description: Create table for storing contact form submissions
-- Version: 005
-- Created: 2025-01-XX

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'archived')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id) WHERE user_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can update messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON contact_messages;

-- RLS Policies for contact_messages
-- Anyone can submit a contact form (even non-authenticated users)
CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own messages if authenticated
CREATE POLICY "Users can view their own messages"
  ON contact_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON contact_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update messages (status, notes)
CREATE POLICY "Admins can update messages"
  ON contact_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete messages
CREATE POLICY "Admins can delete messages"
  ON contact_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE contact_messages IS 'Stores contact form submissions from website visitors';
COMMENT ON COLUMN contact_messages.status IS 'Message status: pending, read, replied, archived';
COMMENT ON COLUMN contact_messages.user_id IS 'Links to user profile if they were authenticated when submitting';
COMMENT ON COLUMN contact_messages.admin_notes IS 'Internal notes for admin use only';
