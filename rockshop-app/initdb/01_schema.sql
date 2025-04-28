-- enable pgvector once
CREATE EXTENSION IF NOT EXISTS pgvector;

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name   TEXT NOT NULL,
  price  NUMERIC(10,2) NOT NULL,
  amount INTEGER NOT NULL
);

-- 1280-d vector = MobileNet-V2 output size
CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  embedding  vector(1280) NOT NULL
);

-- HNSW index for fast similarity
CREATE INDEX IF NOT EXISTS images_embedding_hnsw
ON images
USING hnsw (embedding vector_l2_ops);

-- Insert some example products
INSERT INTO products (name, price, amount)
VALUES 
('Amethyst Cluster', 45.99, 5),
('Polished Tiger Eye', 15.50, 10),
('Quartz Point', 22.00, 7);