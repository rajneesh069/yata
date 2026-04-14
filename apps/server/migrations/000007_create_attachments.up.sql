CREATE TABLE IF NOT EXISTS attachments(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    mime_type VARCHAR(20) NOT NULL,
    size_in_bytes NUMERIC NOT NULL,
    width INT DEFAULT NULL,
    height INT DEFAULT NULL,
    length_minutes INT DEFAULT NULL,
    length_seconds INT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_ticket_id ON attachments(message_id);

CREATE TRIGGER update_attachment_modtime
BEFORE UPDATE ON attachments
FOR EACH ROW EXECUTE FUNCTION
update_modified_column();