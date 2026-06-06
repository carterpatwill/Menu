ALTER TABLE restaurants
  ADD COLUMN theme text NOT NULL DEFAULT 'warm' CHECK (theme IN ('warm', 'minimal', 'bold')),
  ADD COLUMN tagline text NOT NULL DEFAULT '';
