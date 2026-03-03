CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES components(id) ON DELETE SET NULL,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  media JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_components_parent_id ON components(parent_id);
CREATE INDEX IF NOT EXISTS idx_components_attributes_gin ON components USING GIN (attributes);
CREATE INDEX IF NOT EXISTS idx_components_media_gin ON components USING GIN (media);
