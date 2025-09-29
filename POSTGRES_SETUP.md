# PostgreSQL Setup for AllSports

## Overview
This application is now configured to use PostgreSQL instead of SQLite for persistent data storage across deployments.

## Quick Setup

### 1. Create PostgreSQL Database in Cloudtype

1. Go to [Cloudtype Console](https://cloudtype.io)
2. Click **Create** → **Database**
3. Select **PostgreSQL**
4. Configure:
   - Database name: `allsports`
   - Choose your preferred region
   - Select a plan (Free tier available)
5. Copy the connection string provided (format: `postgresql://username:password@host:port/database_name`)

### 2. Update Configuration

Run the setup script with your PostgreSQL connection string:
```bash
./setup-postgres.sh 'postgresql://username:password@host:port/allsports'
```

This automatically updates:
- `.env.production`
- `allsports.yaml` (Cloudtype CLI config)
- `cloudtype.yml` (Cloudtype dashboard config)

### 3. Test Database Connection

```bash
npm run test-db
```

### 4. Run Database Migration

```bash
npx prisma migrate dev
```

### 5. Deploy

```bash
# Using Cloudtype CLI
cloudtype deploy

# Or using Cloudtype dashboard
# Push to GitHub and the deployment will trigger automatically
```

## Manual Configuration

If you prefer to update manually, replace the placeholder DATABASE_URL in these files:

### .env.production
```env
DATABASE_URL=postgresql://your_username:your_password@your_host:5432/allsports
```

### allsports.yaml
```yaml
env:
  - DATABASE_URL=postgresql://your_username:your_password@your_host:5432/allsports
```

### cloudtype.yml
```yaml
env:
  DATABASE_URL: postgresql://your_username:your_password@your_host:5432/allsports
```

## Database Schema

The application uses these main models:
- **Users**: User accounts with authentication
- **Teams**: Sports teams with ownership and membership
- **TeamMembers**: Join requests and team membership
- **Matches**: Match proposals and results
- **Regions**: City/district combinations for location filtering
- **Disputes**: Match result disputes

## Available Scripts

- `npm run test-db` - Test PostgreSQL connection
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed initial data
- `npm run prisma:studio` - Open Prisma Studio GUI

## Troubleshooting

### Connection Issues
- Check your DATABASE_URL format
- Ensure PostgreSQL server is running
- Verify network access (firewall/VPN)

### Migration Issues
```bash
# Reset and recreate database
npx prisma migrate reset
npx prisma migrate dev
npx prisma db seed
```

### Build Issues
```bash
# Clean build
rm -rf .next node_modules/.cache
npm run build
```

## Environment Variables

Required environment variables:
- `NODE_ENV=production`
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NEXT_TELEMETRY_DISABLED=1` - Disable Next.js telemetry

## Data Persistence

✅ **SQLite → PostgreSQL Migration Complete**
- Data now persists across deployments
- External database ensures data safety
- Supports concurrent connections
- Better performance for production use