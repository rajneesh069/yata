package main

import (
	"log"
	"net/http"
	"yata/apps/server/internal/config"
	"yata/apps/server/internal/database"
	"yata/apps/server/internal/handlers"
	"yata/apps/server/internal/middlewares"

	"github.com/clerk/clerk-sdk-go/v2"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load configuration")
		return
	}

	clerk.SetKey(cfg.CLERK_SECRET_KEY)

	pool, err := database.Connect(cfg.DATABASE_URL)

	if err != nil {
		log.Fatal("Failed to connect to the database", err)
		return
	}

	defer pool.Close()
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.ALLOWED_ORIGINS,
		AllowMethods:     []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Server Healthy.",
			"code":    200,
		})
	})

	api := router.Group("/api")
	api.Use(middlewares.ClerkAuthMiddleware())
	{
		api.GET("/me", handlers.GetMeHandler())
	}

	router.Run(":" + cfg.PORT)
}
