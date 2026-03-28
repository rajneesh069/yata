include .env
export

.PHONY: migrateup migratedown createmigration forcemigration

migrateup:
	migrate -path migrations -database "$(DATABASE_URL)" -verbose up

migratedown:
	migrate -path migrations -database "$(DATABASE_URL)" -verbose down

createmigration:
	@if [ -z "$(name)" ]; then echo "Error: name is required. Usage: make createmigration name=<migration_name>"; exit 1; fi
	migrate create -ext sql -dir migrations -seq $(name)

forcemigration:
	@if [ -z "$(version)" ]; then echo "Error: version is required. Usage: make force version=<num>"; exit 1; fi
	migrate -path migrations -database "$(DATABASE_URL)" force $(version)