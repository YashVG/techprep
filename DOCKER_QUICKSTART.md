# Docker Quick Start Guide

## Starting the Application

```bash
# Start containers (will use cached images)
docker compose up -d

# Start and rebuild if code/dependencies changed
docker compose up --build -d

# View logs
docker compose logs -f web      # Backend logs
docker compose logs -f db       # Database logs
docker compose logs -f          # All logs
```

## Stopping the Application

```bash
# Stop containers (preserves data)
docker compose down

# Stop and remove volumes (DELETES DATABASE DATA!)
docker compose down -v
```

## Checking Status

```bash
# Check if containers are running
docker compose ps

# Check resource usage
docker stats
```

## Troubleshooting

### Issue: "ModuleNotFoundError" after adding packages

**Solution:** Rebuild the containers

```bash
docker compose down
docker compose up --build -d
```

### Issue: Database connection errors

**Solution:** Wait for database to be healthy

```bash
# Check database health
docker compose ps

# Should show "healthy" status
# If "starting", wait a few seconds and check again
```

### Issue: Port already in use

**Solution:** Stop other services or change ports in docker-compose.yml

```bash
# Check what's using port 5001
lsof -i :5001

# Or change port in docker-compose.yml:
# ports:
#   - "5002:5000"  # Change 5001 to 5002
```

## Environment Variables

The containers read from your `.env` file (if it exists) or use defaults from `docker-compose.yml`.

**Current warnings:** The default SECRET_KEY and JWT_SECRET_KEY warnings are intentional reminders to set secure keys before deploying to production.

**For production:** Create a `.env` file in the project root with:

```bash
SECRET_KEY=your-secure-random-key
JWT_SECRET_KEY=your-secure-jwt-key
DB_PASSWORD=your-secure-db-password
FLASK_DEBUG=False
FLASK_ENV=production
```

Generate secure keys with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Accessing the Application

- **Backend API:** <http://localhost:5001>
- **Database:** localhost:5432
- **Frontend:** Run separately with `cd frontend && npm start`

## Useful Commands

```bash
# Execute command inside container
docker compose exec web flask db upgrade    # Run migrations
docker compose exec web python              # Python shell
docker compose exec db psql -U postgres -d blog  # Database shell

# View recent logs
docker compose logs web --tail=50

# Follow logs in real-time
docker compose logs -f web

# Restart a specific service
docker compose restart web

# Remove everything and start fresh
docker compose down -v
docker compose up --build -d
```

## Data Persistence

- Database data is stored in a Docker volume named `techprep_pgdata`
- Data persists between container restarts
- To backup: `docker compose exec db pg_dump -U postgres blog > backup.sql`
- To restore: `docker compose exec -T db psql -U postgres blog < backup.sql`
