#!/bin/bash

# Lamatic Clone Deployment Script
# Supports multiple deployment targets: vercel, railway, docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_TARGET=${1:-"docker"}
ENVIRONMENT=${2:-"production"}

echo -e "${GREEN}🚀 Starting Lamatic Clone Deployment${NC}"
echo -e "${YELLOW}Target: ${DEPLOYMENT_TARGET}${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo -e "${RED}❌ Invalid environment: ${ENVIRONMENT}${NC}"
    echo "Valid environments: development, staging, production"
    exit 1
fi

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    echo -e "${GREEN}📁 Loading environment variables from .env.${ENVIRONMENT}${NC}"
    export $(cat .env.${ENVIRONMENT} | xargs)
else
    echo -e "${YELLOW}⚠️  No .env.${ENVIRONMENT} file found, using system environment${NC}"
fi

# Pre-deployment checks
echo -e "${GREEN}🔍 Running pre-deployment checks...${NC}"

# Check Node.js version
if ! node --version | grep -q "v1[89]\|v[2-9][0-9]"; then
    echo -e "${RED}❌ Node.js 18+ required${NC}"
    exit 1
fi

# Check if required environment variables are set
required_vars=("DATABASE_URL" "JWT_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Required environment variable ${var} is not set${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"

# Build the application
echo -e "${GREEN}🔨 Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Run database migrations
echo -e "${GREEN}🗄️  Running database migrations...${NC}"
npm run db:migrate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database migration failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Database migrations completed${NC}"

# Deployment based on target
case $DEPLOYMENT_TARGET in
    "vercel")
        echo -e "${GREEN}🌐 Deploying to Vercel...${NC}"
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            echo -e "${YELLOW}📦 Installing Vercel CLI...${NC}"
            npm install -g vercel
        fi
        
        # Deploy frontend
        cd apps/web
        vercel --prod --confirm
        
        echo -e "${GREEN}✅ Vercel deployment completed${NC}"
        ;;
        
    "railway")
        echo -e "${GREEN}🚂 Deploying to Railway...${NC}"
        
        # Check if Railway CLI is installed
        if ! command -v railway &> /dev/null; then
            echo -e "${YELLOW}📦 Installing Railway CLI...${NC}"
            npm install -g @railway/cli
        fi
        
        # Deploy API
        cd apps/api
        railway up --detach
        
        echo -e "${GREEN}✅ Railway deployment completed${NC}"
        ;;
        
    "docker")
        echo -e "${GREEN}🐳 Deploying with Docker...${NC}"
        
        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker is not installed${NC}"
            exit 1
        fi
        
        # Build Docker images
        echo -e "${GREEN}🔨 Building Docker images...${NC}"
        docker-compose -f docker/docker-compose.yml build
        
        # Start services
        echo -e "${GREEN}🚀 Starting services...${NC}"
        docker-compose -f docker/docker-compose.yml up -d
        
        # Wait for services to be ready
        echo -e "${GREEN}⏳ Waiting for services to be ready...${NC}"
        sleep 30
        
        # Health check
        if curl -f http://localhost:4000/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ API health check passed${NC}"
        else
            echo -e "${RED}❌ API health check failed${NC}"
            docker-compose -f docker/docker-compose.yml logs api
            exit 1
        fi
        
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Web health check passed${NC}"
        else
            echo -e "${RED}❌ Web health check failed${NC}"
            docker-compose -f docker/docker-compose.yml logs web
            exit 1
        fi
        
        echo -e "${GREEN}✅ Docker deployment completed${NC}"
        ;;
        
    "edge")
        echo -e "${GREEN}⚡ Deploying Edge Functions...${NC}"
        
        # Check if Wrangler is installed
        if ! command -v wrangler &> /dev/null; then
            echo -e "${YELLOW}📦 Installing Wrangler CLI...${NC}"
            npm install -g wrangler
        fi
        
        # Deploy edge functions
        cd apps/edge
        wrangler publish --env ${ENVIRONMENT}
        
        echo -e "${GREEN}✅ Edge functions deployment completed${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Unknown deployment target: ${DEPLOYMENT_TARGET}${NC}"
        echo "Available targets: vercel, railway, docker, edge"
        exit 1
        ;;
esac

# Post-deployment tasks
echo -e "${GREEN}🧹 Running post-deployment tasks...${NC}"

# Clear any caches if needed
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${GREEN}🗑️  Clearing production caches...${NC}"
    # Add cache clearing logic here
fi

# Send deployment notification (if configured)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 Lamatic Clone deployed successfully to ${DEPLOYMENT_TARGET} (${ENVIRONMENT})\"}" \
        $SLACK_WEBHOOK_URL
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"

# Display access URLs
case $DEPLOYMENT_TARGET in
    "docker")
        echo -e "${GREEN}📊 Application URLs:${NC}"
        echo -e "  Web Interface: http://localhost:3000"
        echo -e "  GraphQL API: http://localhost:4000/graphql"
        echo -e "  API Health: http://localhost:4000/health"
        ;;
    "vercel")
        echo -e "${GREEN}📊 Check Vercel dashboard for deployment URLs${NC}"
        ;;
    "railway")
        echo -e "${GREEN}📊 Check Railway dashboard for deployment URLs${NC}"
        ;;
esac

echo -e "${GREEN}✨ Happy coding!${NC}"
