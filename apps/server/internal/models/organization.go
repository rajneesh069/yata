package models

import "github.com/google/uuid"

type Organization struct {
	ID         uuid.UUID `json:"id" db:"id"`
	ClerkOrgId string    `json:"clerkOrgId" db:"clerk_org_id"`
	Name       string    `json:"name" db:"name"`
	Slug       string    `json:"slug" db:"slug"`
	OwnerID    uuid.UUID `json:"ownerId" db:"owner_id"`
	ImageURL   string    `json:"imageUrl" db:"image_url"`
	CreatedAt  string    `json:"createdAt" db:"created_at"`
	UpdatedAt  string    `json:"updatedAt" db:"updated_at"`
}
