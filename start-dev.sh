#!/bin/bash

# =============================================================================
# TaskFlow Phase V - Quick Start Script for Docker Compose
# =============================================================================
# This script sets up and starts the complete Phase V stack locally.
#
# Usage:
#   ./start-dev.sh              # Start with default settings
#   ./start-dev.sh --rebuild    # Rebuild images before starting
#   ./start-dev.sh --clean      # Remove volumes and start fresh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   TaskFlow Phase V - Local Development Setup          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Parse arguments
REBUILD=false
CLEAN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --rebuild)
            REBUILD=true
            shift
            ;;
        --clean)
            CLEAN=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --rebuild    Rebuild Docker images before starting"
            echo "  --clean      Remove volumes and start fresh"
            echo "  --help       Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Check prerequisites
echo -e "${YELLOW}Step 1/6: Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker installed${NC}"

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose installed${NC}"

if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Docker daemon is not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker daemon running${NC}"

# Check .env file
echo ""
echo -e "${YELLOW}Step 2/6: Checking environment configuration...${NC}"

if [ ! -f ".env" ]; then
    if [ -f ".env.docker" ]; then
        echo -e "${YELLOW}! .env file not found. Copying from .env.docker...${NC}"
        cp .env.docker .env
        echo -e "${YELLOW}! Please edit .env file with your credentials before continuing.${NC}"
        echo ""
        read -p "Press Enter after you've updated the .env file..."
    else
        echo -e "${RED}✗ No .env or .env.docker file found. Please create a .env file.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file found${NC}"
fi

# Check required environment variables
source .env

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}✗ DATABASE_URL is not set in .env${NC}"
    exit 1
fi
echo -e "${GREEN}✓ DATABASE_URL configured${NC}"

if [ -z "$BETTER_AUTH_SECRET" ]; then
    echo -e "${YELLOW}! BETTER_AUTH_SECRET not set. Using default (change in production!)${NC}"
fi

if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${YELLOW}! OPENAI_API_KEY not set. Chatbot features won't work.${NC}"
fi

# Clean if requested
if [ "$CLEAN" = true ]; then
    echo ""
    echo -e "${YELLOW}Step 3/6: Cleaning up existing containers and volumes...${NC}"
    docker compose down -v
    echo -e "${GREEN}✓ Cleanup complete${NC}"
fi

# Rebuild if requested
if [ "$REBUILD" = true ]; then
    echo ""
    echo -e "${YELLOW}Step 3/6: Rebuilding Docker images...${NC}"
    docker compose build --no-cache
    echo -e "${GREEN}✓ Build complete${NC}"
fi

# Start services
echo ""
echo -e "${YELLOW}Step 4/6: Starting services...${NC}"
docker compose up -d

echo ""
echo -e "${YELLOW}Step 5/6: Waiting for services to be healthy...${NC}"

# Wait for services (with timeout)
TIMEOUT=120
INTERVAL=5
ELAPSED=0

echo "Waiting for backend to be healthy..."
while [ $ELAPSED -lt $TIMEOUT ]; do
    if docker compose ps backend | grep -q "healthy"; then
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
    echo "  Still waiting... ($ELAPSED/$TIMEOUT seconds)"
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    echo -e "${YELLOW}! Backend took longer than expected. Check logs with: docker compose logs backend${NC}"
fi

echo ""
echo -e "${YELLOW}Step 6/6: Displaying service URLs...${NC}"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              TaskFlow is now running!                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Service URLs:${NC}"
echo "  Frontend:       http://localhost:3000"
echo "  Backend API:    http://localhost:8000"
echo "  Health Check:   http://localhost:8000/health"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs:         docker compose logs -f"
echo "  Stop services:     docker compose down"
echo "  Restart backend:   docker compose restart backend"
echo "  Backend shell:     docker compose exec backend bash"
echo ""
echo -e "${BLUE}Testing:${NC}"
echo "  curl http://localhost:8000/health | jq"
echo ""

# Open browser (if possible)
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000 &> /dev/null
elif command -v open &> /dev/null; then
    open http://localhost:3000 &> /dev/null
fi

echo -e "${GREEN}Done!${NC}"
