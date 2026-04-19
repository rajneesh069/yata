package models

import (
	"time"

	"github.com/google/uuid"
)

type WorkspaceScope string

const (
	WorkspacePersonal WorkspaceScope = "PERSONAL"
	WorkspaceOrg      WorkspaceScope = "ORG"
)

type Workspace struct {
	ID        uuid.UUID      `json:"id" db:"id"`
	OrgID     uuid.UUID      `json:"orgId" db:"org_id"`
	OwnerID   uuid.UUID      `json:"ownerId" db:"owner_id"`
	Scope     WorkspaceScope `json:"scope" db:"scope"`
	CreatedAt time.Time      `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time      `json:"updatedAt" db:"updated_at"`
}

func (w WorkspaceScope) IsWorkspaceScopeValid() bool {
	switch w {
	case WorkspaceOrg, WorkspacePersonal:
		return true
	}
	return false
}
