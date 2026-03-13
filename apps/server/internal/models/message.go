package models

import "time"

type Message struct {
	ID           string    `json:"id" db:"id"`
	SentByID     string    `json:"sentById" db:"sent_by_id"`
	TicketID     *string   `json:"ticketId" db:"ticket_id"`
	ReceivedByID string    `json:"receivedById" db:"received_by_id"` // could be a user id or a ticket id, depending on the context of where was it sent, in the ticket chat or private chat, if it was sent in the ticket chat ReceivedByID == TicketID, or else ReceivedByID == UserID
	Body         *string   `json:"body" db:"body"`
	AttachmentID *string   `json:"attachmentId" db:"attachment_id"`
	IsEdited     bool      `json:"isEdited" db:"is_edited"`
	SentAt       time.Time `json:"sentAt" db:"sent_at"`
	EditedAt     time.Time `json:"editedAt" db:"edited_at"`
}
