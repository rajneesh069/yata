CREATE TYPE workspace_scope AS ENUM ('PERSONAL', 'ORG');

CREATE TABLE IF NOT EXISTS workspaces(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    org_id UUID DEFAULT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scope workspace_scope NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT workspaces_scope_check CHECK(
            (scope = 'PERSONAL' AND org_id IS NULL)
            OR
            (scope = 'ORG' AND org_id IS NOT NULL)
    )
);


CREATE TABLE IF NOT EXISTS tasks(
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(300) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_workspaces_modtime
BEFORE UPDATE ON workspaces
FOR EACH ROW EXECUTE FUNCTION
update_modified_column();

CREATE TRIGGER update_task_modtime
BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION
update_modified_column();

CREATE INDEX idx_tasks_workspace_id ON tasks(workspace_id);

CREATE INDEX idx_workspaces_org_id ON workspaces(org_id);

CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);