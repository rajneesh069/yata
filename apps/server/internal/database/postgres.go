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

// CREATE EXTENSION IF NOT EXISTS "pgcrypto";

// CREATE OR REPLACE FUNCTION update_modified_column()
// RETURNS TRIGGER AS $$
// BEGIN
//     NEW.updated_at = NOW();
//     RETURN NEW;
// END;
// $$ language 'plpgsql';

// CREATE TABLE users (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     first_name VARCHAR(100) NOT NULL,
//     last_name VARCHAR(100) NULL,
//     avatar_url VARCHAR(500) NULL,
//     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );

// CREATE TRIGGER update_user_modtime
// BEFORE UPDATE ON users
// FOR EACH ROW EXECUTE FUNCTION update_modified_column();

// DROP TABLE IF EXISTS users;

// DROP FUNCTION IF EXISTS update_modified_column();

// DROP EXTENSION IF EXISTS "pgcrypto";
