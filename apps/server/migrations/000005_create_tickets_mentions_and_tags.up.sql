CREATE TYPE ticket_status AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'REVIEW_PENDING',
    'IN_REVIEW',
    'REVIEW_APPROVED',
    'REVIEW_REJECTED',
    'MERGE_APPROVED',
    'CLOSED'
);

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),

    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,

    raised_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(400) NOT NULL,
    description TEXT NOT NULL,
    status ticket_status NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mentions(
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(user_id, ticket_id)
);

CREATE TABLE IF NOT EXISTS tags(
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    name VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(ticket_id, name)
);


CREATE TRIGGER update_tickets_modtime
BEFORE UPDATE ON tickets
FOR EACH ROW EXECUTE FUNCTION
update_modified_column();


CREATE INDEX idx_tickets_task_status ON tickets(task_id, status);