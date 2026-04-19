CREATE TABLE IF NOT EXISTS attachments(
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    name VARCHAR(300) NULL,
    mime_type VARCHAR(20) NOT NULL,
    size_in_bytes NUMERIC NOT NULL,
    width INT DEFAULT NULL,
    height INT DEFAULT NULL,
    length_seconds INT DEFAULT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
);

CREATE INDEX idx_attachments_ticket_id ON attachments(message_id);

CREATE TRIGGER update_attachment_modtime
BEFORE UPDATE ON attachments
FOR EACH ROW EXECUTE FUNCTION
update_modified_column();