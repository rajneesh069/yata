package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	DATABASE_URL     string
	PORT             string
	CLERK_SECRET_KEY string
	ALLOWED_ORIGINS  []string
}

func LoadConfig() (*Config, error) {
	err := godotenv.Load()

	if err != nil {
		log.Println("Unable to load .env file", err)
		return nil, err
	}

	origins := []string{}
	for _, o := range strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",") {
		o = strings.TrimSpace(o)
		if o != "" {
			origins = append(origins, o)
		}
	}

	config := &Config{
		DATABASE_URL:     os.Getenv("DATABASE_URL"),
		PORT:             os.Getenv("PORT"),
		CLERK_SECRET_KEY: os.Getenv("CLERK_SECRET_KEY"),
		ALLOWED_ORIGINS:  origins,
	}

	return config, nil
}
