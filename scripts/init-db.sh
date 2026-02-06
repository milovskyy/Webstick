#!/bin/sh
set -e

echo "Initializing database..."
npx prisma generate
npx prisma db push

echo "Database initialized successfully!"
