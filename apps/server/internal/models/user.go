package models

import "time"

type User struct {
	ID          string    `json:"id" db:"id"`
	ClerkUserID string    `json:"clerkUserId" db:"clerk_user_id"` // unique
	Email       string    `json:"email" db:"email"`               // unique
	FirstName   string    `json:"firstName" db:"first_name"`
	LastName    *string   `json:"lastName" db:"last_name"`
	AvatarURL   *string   `json:"avatarURL" db:"avatar_url"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}
