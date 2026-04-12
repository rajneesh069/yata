CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
    title VARCHAR(400) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
);


CREATE TRIGGER update_tickets_modtime
BEFORE UPDATE ON tickets
FOR EACH ROW EXECUTE FUNCTION
update_modified_column();
