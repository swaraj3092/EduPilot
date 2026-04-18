CREATE TABLE IF NOT EXISTS ai_cache (id bigserial PRIMARY KEY, cache_key text UNIQUE NOT NULL, content text NOT NULL, created_at timestamptz DEFAULT now());
