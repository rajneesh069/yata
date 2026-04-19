package associations

import (
	"time"

	"github.com/google/uuid"
)

type Tag struct {
	TicketID  uuid.UUID `json:"ticketId" db:"ticket_id"`
	Name      string    `json:"name" db:"name"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}
