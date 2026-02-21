package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DATABASE_URL string
	PORT         string
}

func LoadConfig() (*Config, error) {
	err := godotenv.Load()

	if err != nil {
		log.Println("Unable to load .env file", err)
		return nil, err
	}

	config := &Config{
		DATABASE_URL: os.Getenv("DATABASE_URL"),
		PORT:         os.Getenv("PORT"),
	}

	return config, nil
}
