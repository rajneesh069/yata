CREATE TABLE IF NOT EXISTS organizations(
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    clerk_org_id VARCHAR(255) UNIQUE NOT NULL,
    org_name VARCHAR(255) NOT NULL CHECK(char_length(trim(org_name)) > 0),
    slug VARCHAR(255) UNIQUE NOT NULL CHECK(char_length(trim(slug)) > 0),
    creator_id UUID NOT NULL,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_creator_id
    FOREIGN KEY (creator_id)
    REFERENCES users(id)
    ON DELETE CASCADE

);

CREATE TRIGGER updated_org_modtime
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION
update_modified_column();