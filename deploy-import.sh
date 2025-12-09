#!/bin/bash

# CRM Application - Docker Import Script
# This script helps you import and run the Docker images on a new machine

set -e

echo "========================================="
echo "CRM Application - Docker Import Script"
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

echo -e "${YELLOW}Step 1: Loading Docker images...${NC}"
if [ -f "crm-backend.tar" ]; then
    echo "Loading backend image..."
    docker load -i crm-backend.tar
else
    echo -e "${RED}Error: crm-backend.tar not found${NC}"
    exit 1
fi

if [ -f "crm-frontend.tar" ]; then
    echo "Loading frontend image..."
    docker load -i crm-frontend.tar
else
    echo -e "${RED}Error: crm-frontend.tar not found${NC}"
    exit 1
fi

if [ -f "crm-mongodb.tar" ]; then
    echo "Loading MongoDB image..."
    docker load -i crm-mongodb.tar
else
    echo -e "${RED}Error: crm-mongodb.tar not found${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Setting up environment...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}Created .env file from .env.example${NC}"
        echo -e "${YELLOW}IMPORTANT: Please edit .env and set a secure JWT_SECRET before starting${NC}"
        echo ""
        read -p "Press Enter to continue after editing .env, or Ctrl+C to exit..."
    else
        echo -e "${RED}Error: .env.example not found${NC}"
        exit 1
    fi
else
    echo ".env file already exists"
fi

echo ""
echo -e "${YELLOW}Step 3: Starting application...${NC}"
$DOCKER_COMPOSE up -d

echo ""
echo -e "${YELLOW}Step 4: Waiting for services to be ready...${NC}"
sleep 10

echo ""
echo -e "${YELLOW}Step 5: Checking service status...${NC}"
$DOCKER_COMPOSE ps

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Import completed successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Application is now running:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  MongoDB:  localhost:27017"
echo ""
echo "Useful commands:"
echo "  View logs:        $DOCKER_COMPOSE logs -f"
echo "  Stop application: $DOCKER_COMPOSE down"
echo "  Restart:          $DOCKER_COMPOSE restart"
echo ""
echo -e "${GREEN}Done!${NC}"
