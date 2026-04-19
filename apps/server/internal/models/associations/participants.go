package associations

import (
	"time"

	"github.com/google/uuid"
)

type Participants struct {
	UserID         uuid.UUID `json:"userId" db:"user_id"`
	ConversationID uuid.UUID `json:"conversationId" db:"conversation_id"`
	JoinedAt       time.Time `json:"joinedAt" db:"joined_at"`
}
