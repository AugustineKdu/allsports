#!/bin/bash

echo "AllSports PostgreSQL Setup Script"
echo "=================================="

# Check if DATABASE_URL is provided as argument
if [ -z "$1" ]; then
    echo "Usage: ./setup-postgres.sh 'postgresql://username:password@host:port/database_name'"
    echo ""
    echo "Steps to get PostgreSQL connection string from Cloudtype:"
    echo "1. Go to https://cloudtype.io"
    echo "2. Create → Database → PostgreSQL"
    echo "3. Database name: allsports"
    echo "4. Copy the connection string provided"
    echo "5. Run: ./setup-postgres.sh 'YOUR_CONNECTION_STRING'"
    exit 1
fi

DATABASE_URL="$1"
echo "Setting up PostgreSQL connection: $DATABASE_URL"

# Update .env.production
echo "Updating .env.production..."
cat > .env.production << EOF
NODE_ENV=production
DATABASE_URL=$DATABASE_URL
JWT_SECRET=your-super-secret-jwt-key-change-me
NEXT_TELEMETRY_DISABLED=1
EOF

# Update allsports.yaml
echo "Updating allsports.yaml..."
cat > allsports.yaml << EOF
name: allsports
app: next.js
options:
  nodeversion: "22"
  install: npm ci
  build: npm run build
  env:
    - NODE_ENV=production
    - DATABASE_URL=$DATABASE_URL
    - JWT_SECRET=your-super-secret-jwt-key-change-in-production
    - NEXT_TELEMETRY_DISABLED=1
  buildenv: []
context:
  git:
    url: https://github.com/AugustineKdu/allsports.git
    branch: main
EOF

# Update cloudtype.yml
echo "Updating cloudtype.yml..."
cat > cloudtype.yml << EOF
name: allsports
app: allsports
options:
  ports: 3000
  buildCommand: npm run build
  startCommand: npm start
  env:
    NODE_ENV: production
    DATABASE_URL: $DATABASE_URL
    JWT_SECRET: your-super-secret-jwt-key-change-in-production
    NEXT_TELEMETRY_DISABLED: 1
  nodeVersion: 22
context:
  git:
    url: git@github.com:AugustineKdu/allsports.git
    ref: main
  preset: nodejs
EOF

echo ""
echo "✅ PostgreSQL configuration updated successfully!"
echo ""
echo "Next steps:"
echo "1. Test the database connection: npm run test-db"
echo "2. Run database migration: npx prisma migrate dev"
echo "3. Deploy to Cloudtype"
echo ""