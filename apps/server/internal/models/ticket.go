package models

import (
	"time"

	"github.com/google/uuid"
)

type TicketStatus string

const (
	StatusOpen           TicketStatus = "OPEN"
	StatusInProgress     TicketStatus = "IN_PROGRESS"
	StatusReviewPending  TicketStatus = "REVIEW_PENDING"
	StatusInReview       TicketStatus = "IN_REVIEW"
	StatusReviewApproved TicketStatus = "REVIEW_APPROVED"
	StatusReviewRejected TicketStatus = "REVIEW_REJECTED"
	StatusMergeApproved  TicketStatus = "MERGE_APPROVED"
	StatusClosed         TicketStatus = "CLOSED"
)

type Ticket struct {
	ID          uuid.UUID    `json:"id" db:"id"`
	Title       string       `json:"title" db:"title"`
	Description string       `json:"description" db:"description"`
	TaskID      uuid.UUID    `json:"taskId" db:"task_id"`
	RaisedBy    uuid.UUID    `json:"raisedBy" db:"raised_by"` // FK to user.id
	Status      TicketStatus `json:"status" db:"status"`
	CreatedAt   time.Time    `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time    `json:"updatedAt" db:"updated_at"`
}

func (s TicketStatus) IsTicketStatusValid() bool {
	switch s {
	case StatusClosed, StatusInProgress, StatusInReview, StatusMergeApproved, StatusOpen, StatusReviewApproved, StatusReviewPending, StatusReviewRejected:
		return true
	}
	return false
}
