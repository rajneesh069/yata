package models

import (
	"time"

	"github.com/google/uuid"
)

type Attachment struct {
	ID            uuid.UUID `json:"id" db:"id"`
	URL           string    `json:"Url" db:"url"`
	Name          *string   `json:"name" db:"name"`
	SizeInBytes   int64     `json:"sizeInBytes" db:"size_in_bytes"`
	MessageID     uuid.UUID `json:"messageId" db:"message_id"` // FK to message.id
	MIMEType      string    `json:"mimeType" db:"mime_type"`
	Width         *int      `json:"width" db:"width"`
	Height        *int      `json:"height" db:"height"`
	LengthSeconds *int      `json:"lengthSeconds" db:"length_seconds"`
	UploadedAt    time.Time `json:"uploadedAt" db:"uploaded_at"`
}
