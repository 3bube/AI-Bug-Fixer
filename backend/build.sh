#!/bin/bash

# Exit on error
set -e

# Navigate to backend directory
cd backend

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run migrations (only in production)
if [ "$NODE_ENV" = "production" ]; then
  npx prisma migrate deploy
fi

# Build TypeScript
npm run build

echo "Build completed successfully!"
