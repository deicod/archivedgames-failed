FROM golang:1.23-alpine AS build
WORKDIR /app
RUN apk add --no-cache git build-base
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go generate ./ent && go build -o /out/server ./cmd/server

FROM alpine:3.20
WORKDIR /
COPY --from=build /out/server /server
ENV PORT=8080
EXPOSE 8080
CMD ["/server"]

