CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL
);

INSERT INTO messages (message)
VALUES
  ('PostgreSQL is running inside Docker.'),
  ('Next.js is connected through the shared Compose network.'),
  ('This starter is ready for your real application code.');

