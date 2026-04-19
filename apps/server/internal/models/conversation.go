package models

import (
	"time"

	"github.com/google/uuid"
)

type ConversationType string

const (
	ConversationTicket    ConversationType = "TICKET"
	ConversationDM        ConversationType = "DM"
	ConversationWorkspace ConversationType = "WORKSPACE"
	ConversationORG       ConversationType = "ORG"
)

type Conversation struct {
	Id        uuid.UUID `json:"id" db:"id"`
	DMKey     uuid.UUID `json:"dmKey" db:"dm_key"`
	TicketID  uuid.UUID `json:"ticketId" db:"ticket_id"`
	OrgID     uuid.UUID `json:"orgId" db:"org_id"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

func (c ConversationType) IsConversationTypeValid() bool {
	switch c {
	case ConversationORG, ConversationDM, ConversationTicket, ConversationWorkspace:
		return true
	}
	return false
}
