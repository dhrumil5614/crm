# Docker Deployment Guide

This guide explains how to containerize and deploy the CRM application using Docker.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- At least 4GB of available RAM
- 2GB of free disk space

## Quick Start (On Current Machine)

### 1. Build and Run with Docker Compose

```bash
# Navigate to project root
cd /path/to/crm

# Create environment file
cp .env.example .env

# Edit .env and set a secure JWT_SECRET
# Example: JWT_SECRET=my_super_secure_random_string_12345

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### 2. Stop the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes all data)
docker-compose down -v
```

## Transfer to Another Laptop

There are two methods to transfer the containerized application to another laptop:

### Method 1: Export Docker Images (Recommended for Offline Transfer)

This method creates portable image files that can be transferred via USB drive or network.

#### On the Source Machine (Current Laptop):

```bash
# 1. Build the images
docker-compose build

# 2. Export images to tar files
docker save -o crm-backend.tar crm-backend
docker save -o crm-frontend.tar crm-frontend
docker save -o crm-mongodb.tar mongo:7.0

# 3. Create a deployment package
mkdir crm-deployment-package
cp crm-backend.tar crm-deployment-package/
cp crm-frontend.tar crm-deployment-package/
cp crm-mongodb.tar crm-deployment-package/
cp docker-compose.yml crm-deployment-package/
cp .env.example crm-deployment-package/
cp DOCKER_DEPLOYMENT.md crm-deployment-package/

# 4. Create a compressed archive
tar -czf crm-deployment-package.tar.gz crm-deployment-package/

# 5. Transfer crm-deployment-package.tar.gz to the other laptop
# via USB drive, network share, or cloud storage
```

#### On the Target Machine (New Laptop):

```bash
# 1. Extract the deployment package
tar -xzf crm-deployment-package.tar.gz
cd crm-deployment-package

# 2. Load Docker images
docker load -i crm-backend.tar
docker load -i crm-frontend.tar
docker load -i crm-mongodb.tar

# 3. Create environment file
cp .env.example .env
# Edit .env and set JWT_SECRET

# 4. Start the application
docker-compose up -d

# 5. Verify all services are running
docker-compose ps
```

### Method 2: Git Clone and Build (Requires Internet)

This method requires the target machine to have internet access.

#### On the Target Machine:

```bash
# 1. Clone or copy the repository
git clone <repository-url>
# OR copy the entire project folder

# 2. Navigate to project directory
cd crm

# 3. Create environment file
cp .env.example .env
# Edit .env and set JWT_SECRET

# 4. Build and start
docker-compose up -d
```

## Data Migration

If you want to transfer existing data from your current MongoDB to the new machine:

### Export Data from Source Machine:

```bash
# Export MongoDB data
docker exec crm-mongodb mongodump --db=crm_db --out=/data/backup

# Copy backup from container to host
docker cp crm-mongodb:/data/backup ./mongodb-backup

# Include mongodb-backup folder in your deployment package
```

### Import Data on Target Machine:

```bash
# Copy backup to container
docker cp ./mongodb-backup crm-mongodb:/data/backup

# Restore MongoDB data
docker exec crm-mongodb mongorestore --db=crm_db /data/backup/crm_db
```

## Useful Docker Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Access Container Shell
```bash
# Backend
docker exec -it crm-backend sh

# MongoDB
docker exec -it crm-mongodb mongosh
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove images
docker rmi crm-backend crm-frontend

# Remove all unused Docker resources
docker system prune -a
```

## Troubleshooting

### Port Already in Use
If ports 3000, 5000, or 27017 are already in use:

Edit `docker-compose.yml` and change the port mappings:
```yaml
ports:
  - "3001:80"  # Frontend (change 3000 to 3001)
  - "5001:5000"  # Backend (change 5000 to 5001)
  - "27018:27017"  # MongoDB (change 27017 to 27018)
```

### Container Won't Start
```bash
# Check logs
docker-compose logs

# Rebuild without cache
docker-compose build --no-cache

# Start with fresh volumes
docker-compose down -v
docker-compose up -d
```

### MongoDB Connection Issues
```bash
# Check MongoDB is healthy
docker-compose ps

# Check backend can reach MongoDB
docker exec crm-backend ping mongodb

# Verify environment variables
docker exec crm-backend env | grep MONGODB
```

### Frontend Can't Reach Backend
```bash
# Check nginx configuration
docker exec crm-frontend cat /etc/nginx/conf.d/default.conf

# Check backend health
curl http://localhost:5000/api/health
```

## Production Deployment Considerations

For production deployment, consider these additional steps:

1. **Security**:
   - Use strong, unique JWT_SECRET
   - Enable MongoDB authentication
   - Use HTTPS with SSL certificates
   - Implement rate limiting

2. **Performance**:
   - Use Docker resource limits
   - Enable MongoDB indexes
   - Configure nginx caching
   - Use a CDN for static assets

3. **Monitoring**:
   - Add logging aggregation
   - Set up health check monitoring
   - Configure alerts for service failures

4. **Backup**:
   - Schedule regular MongoDB backups
   - Store backups in external storage
   - Test restore procedures

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| JWT_SECRET | Secret key for JWT tokens | (required) |
| MONGODB_URI | MongoDB connection string | mongodb://mongodb:27017/crm_db |
| NODE_ENV | Node environment | production |
| BACKEND_PORT | Backend service port | 5000 |
| FRONTEND_PORT | Frontend service port | 3000 |

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│   (nginx:80)    │ ← Port 3000
└────────┬────────┘
         │
         │ /api → proxy
         │
┌────────▼────────┐
│   Backend       │
│   (Node:5000)   │ ← Port 5000
└────────┬────────┘
         │
         │ MongoDB connection
         │
┌────────▼────────┐
│   MongoDB       │
│   (mongo:27017) │ ← Port 27017
└─────────────────┘
```

## Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Verify all services are healthy: `docker-compose ps`
3. Consult the main README.md for application-specific issues
