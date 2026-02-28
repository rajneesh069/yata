package handlers

import (
	"net/http"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/gin-gonic/gin"
)

func GetMeHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, ok := clerk.SessionClaimsFromContext(c.Request.Context())

		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Unauthorized",
			})
			return
		}

		userId := claims.Subject
		orgId := claims.ActiveOrganizationID
		orgSlug := claims.ActiveOrganizationSlug
		orgRole := claims.ActiveOrganizationRole

		c.JSON(http.StatusOK, gin.H{
			"message": "Me handler ran",
			"userId":  userId,
			"orgId":   orgId,
			"orgSlug": orgSlug,
			"orgRole": orgRole,
		})

	}
}
