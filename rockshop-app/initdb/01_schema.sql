CREATE TABLE IF NOT EXISTS minerals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  mineral_type TEXT,
  cost NUMERIC(10,2),
  weight NUMERIC(10,2),
  location TEXT,
  description TEXT,
  quantity_in_stock INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- starter data
INSERT INTO minerals (name, mineral_type, cost, weight, location, description, quantity_in_stock)
VALUES
  ('Rose Quartz', 'Quartz', 12.5, 0.5, 'Aisle 2', 'Pink quartz variant', 10),
  ('Amethyst', 'Quartz', 15.0, 0.3, 'Aisle 1', 'Purple crystal variety', 5)
ON CONFLICT DO NOTHING;