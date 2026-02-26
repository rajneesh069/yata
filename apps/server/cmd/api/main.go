package main

import (
	"log"
	"net/http"
	"yata/apps/server/internal/config"
	"yata/apps/server/internal/database"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load configuration")
		return
	}

	pool, err := database.Connect(cfg.DATABASE_URL)

	if err != nil {
		log.Fatal("Failed to connect to the database", err)
		return
	}

	defer pool.Close()
	router := gin.Default()

	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Server Healthy.",
			"code":    200,
		})
	})

	router.Run(":" + cfg.PORT)
}
