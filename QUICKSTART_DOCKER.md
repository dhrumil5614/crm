# Quick Start - Docker Deployment

## For the Current Laptop (Export)

1. **Install Docker Desktop** (if not already installed)
   - Download from: https://www.docker.com/products/docker-desktop

2. **Run the export script**:
   ```bash
   cd /Users/dhrumil/Documents/Study/Project/crm
   ./deploy-export.sh
   ```

3. **Transfer the package**:
   - Copy `crm-deployment-package.tar.gz` to USB drive or cloud storage
   - Transfer to the target laptop

## For the Target Laptop (Import)

1. **Install Docker Desktop** (if not already installed)
   - Download from: https://www.docker.com/products/docker-desktop

2. **Extract the package**:
   ```bash
   tar -xzf crm-deployment-package.tar.gz
   cd crm-deployment-package
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and set JWT_SECRET to a secure random string
   ```

4. **Run the import script**:
   ```bash
   chmod +x deploy-import.sh
   ./deploy-import.sh
   ```

5. **Access the application**:
   - Open browser: http://localhost:3000

## Manual Method (Alternative)

If you prefer manual control:

### On Current Laptop:
```bash
# Build images
docker-compose build

# Save images
docker save -o backend.tar crm-backend
docker save -o frontend.tar crm-frontend
docker save -o mongo.tar mongo:7.0

# Transfer files to target laptop:
# - backend.tar, frontend.tar, mongo.tar
# - docker-compose.yml
# - .env.example
```

### On Target Laptop:
```bash
# Load images
docker load -i backend.tar
docker load -i frontend.tar
docker load -i mongo.tar

# Setup environment
cp .env.example .env
# Edit .env

# Start application
docker-compose up -d
```

## Troubleshooting

- **Port conflicts**: Edit `docker-compose.yml` to change ports
- **View logs**: `docker-compose logs -f`
- **Restart**: `docker-compose restart`
- **Stop**: `docker-compose down`

For detailed documentation, see [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)
