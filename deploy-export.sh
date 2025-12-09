#!/bin/bash

# CRM Application - Docker Deployment Script
# This script helps you build and export the Docker images for transfer

set -e

echo "========================================="
echo "CRM Application - Docker Export Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker Desktop first.${NC}"
    exit 1
fi

# Detect which docker compose command to use
DOCKER_COMPOSE=""
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
    echo "Using: docker compose (Docker Desktop plugin)"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    echo "Using: docker-compose (standalone)"
else
    echo -e "${RED}Error: Docker Compose is not available. Please install Docker Desktop.${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}Step 1: Building Docker images...${NC}"
$DOCKER_COMPOSE build

echo ""
echo -e "${YELLOW}Step 2: Pulling MongoDB image...${NC}"
docker pull mongo:7.0

echo ""
echo -e "${YELLOW}Step 3: Exporting images to tar files...${NC}"
docker save -o crm-backend.tar crm-backend
docker save -o crm-frontend.tar crm-frontend
docker save -o crm-mongodb.tar mongo:7.0

echo ""
echo -e "${YELLOW}Step 4: Creating deployment package...${NC}"
mkdir -p crm-deployment-package

# Copy Docker images
cp crm-backend.tar crm-deployment-package/
cp crm-frontend.tar crm-deployment-package/
cp crm-mongodb.tar crm-deployment-package/

# Copy configuration files
cp docker-compose.yml crm-deployment-package/
cp .env.example crm-deployment-package/
cp DOCKER_DEPLOYMENT.md crm-deployment-package/

# Copy deployment scripts
cp deploy-import.sh crm-deployment-package/ 2>/dev/null || echo "deploy-import.sh not found, skipping..."

echo ""
echo -e "${YELLOW}Step 5: Creating compressed archive...${NC}"
tar -czf crm-deployment-package.tar.gz crm-deployment-package/

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Export completed successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Deployment package created: crm-deployment-package.tar.gz"
echo "Package size: $(du -h crm-deployment-package.tar.gz | cut -f1)"
echo ""
echo "Next steps:"
echo "1. Transfer 'crm-deployment-package.tar.gz' to the target laptop"
echo "2. On the target laptop, extract and run the import script"
echo ""
echo "Cleaning up temporary files..."
rm -f crm-backend.tar crm-frontend.tar crm-mongodb.tar

echo -e "${GREEN}Done!${NC}"
