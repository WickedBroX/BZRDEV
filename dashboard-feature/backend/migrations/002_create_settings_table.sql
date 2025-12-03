CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(255) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed default settings if they don't exist
INSERT INTO settings (key, value) VALUES
('general', '{"logoUrl": "https://res.cloudinary.com/dhznjbcys/image/upload/v1762175462/BZR-SCAN-V2_iybuqz.png", "tokenAddress": "0x85Cb098bdcD3Ca929d2cD18Fc7A2669fF0362242", "maxSupply": 555555555}'::jsonb),
('socials', '[
  {"name": "Website", "url": "https://bazaars.app"},
  {"name": "Twitter", "url": "https://twitter.com/BazaarsBzr"},
  {"name": "Telegram", "url": "https://t.me/Bazaarsapp"},
  {"name": "Discord", "url": "https://discord.com/invite/bazaars-bzr-979586323688087552"},
  {"name": "Medium", "url": "https://medium.com/@BazaarsBzr"},
  {"name": "Facebook", "url": "https://www.facebook.com/Bazaarsapp/"},
  {"name": "Instagram", "url": "https://www.instagram.com/bazaars.app/"},
  {"name": "Whitepaper", "url": "https://github.com/BazaarsBZR/Whitepaper/blob/main/Bazaars.pdf"}
]'::jsonb),
('apiKeys', '{"etherscan": "", "cronos": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;
