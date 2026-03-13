package models

import "time"

type TicketStatus string

const (
	StatusOpen           TicketStatus = "OPEN"
	StatusInProgress     TicketStatus = "IN_PROGRESS"
	StatusReviewPending  TicketStatus = "REVIEW_PENDING"
	StatusReviewApproved TicketStatus = "REVIEW_APPROVED"
	StatusReviewRejected TicketStatus = "REVIEW_REJECTED"
	StatusMergeApproved  TicketStatus = "MERGE_APPROVED"
	StatusClosed         TicketStatus = "CLOSED"
)

type Ticket struct {
	ID          string       `json:"id" db:"id"`
	Title       string       `json:"title" db:"title"`
	Description string       `json:"description" db:"description"`
	RaisedByID  string       `json:"raisedById" db:"raised_by_id"` // FK to user.id
	Status      TicketStatus `json:"status" db:"status"`
	Tags        []string     `json:"tags" db:"tags"`
	CreatedAt   time.Time    `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time    `json:"updatedAt" db:"updated_at"`
}
