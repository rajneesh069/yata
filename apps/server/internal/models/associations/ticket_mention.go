package associations

import "time"

type TicketMention struct {
	TicketID    string    `json:"ticketId" db:"ticket_id"` // FK to ticket.id
	UserID      string    `json:"userId" db:"user_id"`     // FK to user.id
	MentionedAt time.Time `json:"mentionedAt" db:"mentioned_at"`
}
