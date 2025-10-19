#!/bin/bash

# Post-deploy script for Render
echo "Running post-deploy script..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Deploy migrations
echo "Deploying database migrations..."
npx prisma migrate deploy

# Seed database if needed
echo "Seeding database..."
npm run seed

echo "Post-deploy script completed successfully!"
