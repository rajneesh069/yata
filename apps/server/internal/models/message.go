package models

import (
	"time"

	"github.com/google/uuid"
)

type Message struct {
	ID              uuid.UUID `json:"id" db:"id"`
	Content         string    `json:"content" db:"content"`
	SentBy          uuid.UUID `json:"sentBy" db:"sent_by"`
	ConversationID  uuid.UUID `json:"conversationId" db:"conversation_id"`
	ParentMessageID uuid.UUID `json:"parentMessageId" db:"parent_message_id"`
	SentAt          time.Time `json:"sentAt" db:"sent_at"`
	DeletedAt       time.Time `json:"deletedAt" db:"deleted_at"`
}
