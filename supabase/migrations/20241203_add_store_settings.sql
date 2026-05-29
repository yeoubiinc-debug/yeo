CREATE TABLE IF NOT EXISTS store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_color text NOT NULL DEFAULT '#000000',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public profiles are viewable by everyone." 
  ON store_settings FOR SELECT 
  USING ( true );

-- Allow authenticated users (admin) to update
CREATE POLICY "Users can update store settings." 
  ON store_settings FOR UPDATE 
  USING ( has_role(auth.uid(), 'admin') );

-- Allow authenticated users to insert (initial setup)
CREATE POLICY "Users can insert store settings." 
  ON store_settings FOR INSERT 
  WITH CHECK ( has_role(auth.uid(), 'admin') );

-- Insert default row if none exists
INSERT INTO store_settings (theme_color)
SELECT '#e01a4f'
WHERE NOT EXISTS (SELECT 1 FROM store_settings);
