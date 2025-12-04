#!/bin/bash

# Script to delete all orders from Supabase
# This script uses the Supabase CLI to execute the SQL

echo "⚠️  WARNING: This will delete ALL orders and order items!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo ""
echo "Deleting all orders..."

# Execute the SQL script using Supabase CLI
supabase db execute --file scripts/delete-all-orders.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully deleted all orders and order items!"
else
    echo ""
    echo "❌ Error deleting orders. Please check the error message above."
    exit 1
fi
