package middlewares

import (
	"net/http"

	"github.com/clerk/clerk-sdk-go/v2"
	clerkhttp "github.com/clerk/clerk-sdk-go/v2/http"
	"github.com/gin-gonic/gin"
)

func ClerkAuthMiddleware() gin.HandlerFunc {
	clerkMiddleware := clerkhttp.RequireHeaderAuthorization()

	return func(c *gin.Context) {
		handler := clerkMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			c.Request = r
			c.Next()
		}))
		handler.ServeHTTP(c.Writer, c.Request)
	}

}

func RequireOrg() gin.HandlerFunc {
	return func(c *gin.Context) {
		claims, ok := clerk.SessionClaimsFromContext(c.Request.Context())

		if !ok || claims.ActiveOrganizationID == "" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "No organization selected",
			})
			return
		}
		c.Next()
	}
}
