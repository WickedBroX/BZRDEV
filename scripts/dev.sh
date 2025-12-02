#!/bin/bash
set -e

# Run backend and frontend concurrently
# Using npx concurrently to avoid global install requirement
npx concurrently \
  --names "BACKEND,FRONTEND" \
  --prefix-colors "blue,magenta" \
  "npm run dev --workspace=backend" \
  "npm run dev --workspace=frontend"
