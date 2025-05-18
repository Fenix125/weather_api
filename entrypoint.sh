#!/bin/sh
set -e

until pg_isready -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER"; do
  echo "Waiting for Postgres..."
  sleep 2
done

npm start