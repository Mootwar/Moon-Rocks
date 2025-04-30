DROP TABLE IF EXISTS minerals;

CREATE TABLE IF NOT EXISTS minerals (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    amount INT NOT NULL,
    weight NUMERIC(10, 2) NOT NULL,
    photo TEXT
);

INSERT INTO minerals (name, price, amount, weight, photo) VALUES
('Quartz', 20.00, 1, 200.5, 'Quartz_Brésil.jpg'),
('Amethyst', 30.00, 2, 305.7, NULL),
('Agate', 15.00, 5, 50.6, NULL);