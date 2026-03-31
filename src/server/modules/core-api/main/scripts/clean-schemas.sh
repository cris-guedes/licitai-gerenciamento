#!/bin/bash
# scripts/clean-schemas.sh

echo "🧹 Cleaning up generated schemas..."

# Ensure we are in the back-end directory
cd "$(dirname "$0")/.."

# Find and delete all ControllerSchemas files
find src/domain/use-cases -name "*ControllerSchemas.ts" -type f -delete

echo "✅ Cleaned up all generated schema files."
