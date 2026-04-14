CREATE TABLE IF NOT EXISTS organizations(
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    clerk_org_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL CHECK(char_length(trim(name)) > 0),
    slug VARCHAR(255) UNIQUE NOT NULL CHECK(char_length(trim(slug)) > 0),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE role AS ENUM ('ADMIN', 'MEMBER', 'OWNER');

CREATE TABLE IF NOT EXISTS user_organizations(
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_role role NOT NULL DEFAULT 'MEMBER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY(user_id, org_id)
);

CREATE TRIGGER updated_org_modtime
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION
update_modified_column();

CREATE TRIGGER updated_user_organizations
BEFORE UPDATE ON user_organizations
FOR EACH ROW EXECUTE FUNCTION
update_modified_column();