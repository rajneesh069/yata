CREATE TYPE conversation_type AS ENUM ('TICKET', 'DM', 'WORKSPACE', 'ORG');

CREATE TABLE IF NOT EXISTS conversations(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    dm_key UUID UNIQUE NULL,
    ticket_id UUID UNIQUE NULL REFERENCES tickets(id) ON DELETE CASCADE,
    workspace_id UUID UNIQUE NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    org_id UUID UNIQUE NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type conversation_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT conversation_type_check CHECK(
        (
            (
                type = 'DM'
                AND dm_key IS NOT NULL
                AND org_id IS NULL 
                AND ticket_id IS NULL 
                AND workspace_id IS NULL
            )
            OR 
            (
                type = 'TICKET' 
                AND dm_key IS NULL
                AND ticket_id IS NOT NULL 
                AND org_id IS NULL 
                AND workspace_id IS NULL
            )
            OR
            (
                type = 'WORKSPACE'
                AND dm_key IS NULL 
                AND workspace_id IS NOT NULL
                AND org_id IS NULL 
                AND ticket_id IS NULL 
            )
            OR
            (
                type = 'ORG'
                AND dm_key IS NULL 
                AND org_id IS NOT NULL 
                AND ticket_id IS NULL 
                AND workspace_id IS NULL
            )
        )
    )
);

CREATE TABLE IF NOT EXISTS messages(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    sent_by UUID NOT NULL REFERENCES users(id),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    parent_message_id UUID NULL REFERENCES messages(id) ON DELETE SET NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);


CREATE TABLE IF NOT EXISTS participants(
    user_id UUID NOT NULL REFERENCES users(id),
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(user_id, conversation_id) 
);

CREATE INDEX idx_messages_parent ON messages(parent_message_id);