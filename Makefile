SHELL := /bin/bash

.PHONY: gen ent gql migrate run

gen: ent gql

ent:
	go generate ./ent

gql:
	go run github.com/99designs/gqlgen generate

migrate:
	go run ./cmd/server --migrate-only

run:
	go run ./cmd/server

