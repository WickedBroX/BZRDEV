INSERT INTO settings (key, value) VALUES
('content', '{"footerText": "Explore and track BZR token transactions across multiple blockchain networks."}'::jsonb)
ON CONFLICT (key) DO NOTHING;
