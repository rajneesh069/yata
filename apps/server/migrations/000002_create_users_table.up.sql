CREATE TABLE IF NOT EXISTS users(
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    clerk_user_id VARCHAR(255) UNIQUE NOT NULL CHECK (char_length(trim(clerk_user_id))>0),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (char_length(trim(email))>0),
    first_name VARCHAR(100) NOT NULL CHECK (char_length(trim(first_name))>0),
    last_name VARCHAR(200) NULL,
    avatar_url VARCHAR(500) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_user_modtime
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();