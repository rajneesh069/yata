package associations

import (
	"time"

	"github.com/google/uuid"
)

type TicketMention struct {
	TicketID    uuid.UUID `json:"ticketId" db:"ticket_id"` // FK to ticket.id
	UserID      uuid.UUID `json:"userId" db:"user_id"`     // FK to user.id
	MentionedAt time.Time `json:"mentionedAt" db:"mentioned_at"`
}
