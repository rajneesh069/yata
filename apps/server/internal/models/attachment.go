package models

import "time"

// Message ID can never be nil except when the attachment is the part of a ticket.

type Attachment struct {
	ID                  string    `json:"id" db:"id"`
	FileName            string    `json:"fileName" db:"file_name"`
	AttachmentURL       string    `json:"attachmentUrl" db:"attachment_url"`
	Size                int64     `json:"size" db:"size"`
	UploadedByID        string    `json:"uploadedById" db:"uploaded_by_id"` // FK to user.id
	TicketID            *string   `json:"ticketID" db:"ticket_id"`          // FK to ticket.id
	MessageID           *string   `json:"messageId" db:"message_id"`        // FK to message.id
	MIMEType            string    `json:"mimeType" db:"mime_type"`
	Width               *int      `json:"width" db:"width"`
	Height              *int      `json:"height" db:"height"`
	DurationInSeconds   *int      `json:"durationInSeconds" db:"duration_in_seconds"`
	ThumbnailURL        *string   `json:"thumbnailUrl" db:"thumbnail_url"`
	CodeSnippetLanguage *string   `json:"codeSnippetLanguage" db:"code_snippet_language"`
	UploadedAt          time.Time `json:"uploadedAt" db:"uploaded_at"`
}
