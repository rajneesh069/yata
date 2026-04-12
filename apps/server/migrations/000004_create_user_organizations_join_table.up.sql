CREATE TYPE role AS ENUM ('admin', 'member', 'creator');


CREATE TABLE IF NOT EXISTS users_organizations(
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES org(id) ON DELETE CASCADE,
    user_role role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY(user_id, org_id)
);

CREATE TRIGGER updated_user_organizations
BEFORE UPDATE ON user_organizations
FOR EACH ROW EXECUTE FUNCTION
update_modified_column();