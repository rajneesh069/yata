package database

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Connect(connString string) (*pgxpool.Pool, error) {
	ctx := context.Background()

	cfg, err := pgxpool.ParseConfig(connString)
	if err != nil {
		log.Println("Failed to load config", err)
		return nil, err
	}

	pool, err := pgxpool.NewWithConfig(ctx, cfg)

	err = pool.Ping(ctx)

	if err != nil {
		log.Println("Failed to connect to the database", err)
		pool.Close()
		return nil, err
	}

	return pool, nil
}
