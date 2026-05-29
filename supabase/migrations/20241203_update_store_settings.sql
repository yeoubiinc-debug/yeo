ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS background_color text NOT NULL DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS text_color text NOT NULL DEFAULT '#000000';
