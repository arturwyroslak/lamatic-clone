#!/bin/bash

# Lamatic Clone Database Setup Script
# Handles database initialization, migrations, and seeding

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-"development"}
ACTION=${2:-"setup"}

echo -e "${GREEN}🗄️  Lamatic Clone Database Setup${NC}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Action: ${ACTION}${NC}"

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    echo -e "${GREEN}📁 Loading environment variables from .env.${ENVIRONMENT}${NC}"
    export $(cat .env.${ENVIRONMENT} | grep -v '^#' | xargs)
elif [ -f ".env.local" ]; then
    echo -e "${GREEN}📁 Loading environment variables from .env.local${NC}"
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  No environment file found, using system environment${NC}"
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL environment variable is not set${NC}"
    echo "Please set DATABASE_URL in your environment file"
    exit 1
fi

# Extract database details from URL for checks
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo -e "${BLUE}📊 Database Configuration:${NC}"
echo -e "  Host: ${DB_HOST}"
echo -e "  Port: ${DB_PORT}"
echo -e "  Database: ${DB_NAME}"

# Function to check if database is accessible
check_database_connection() {
    echo -e "${GREEN}🔍 Checking database connection...${NC}"
    
    if npx prisma db pull --schema packages/database/prisma/schema.prisma > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database connection successful${NC}"
    else
        echo -e "${RED}❌ Cannot connect to database${NC}"
        echo "Please check your DATABASE_URL and ensure the database server is running"
        exit 1
    fi
}

# Function to generate Prisma client
generate_client() {
    echo -e "${GREEN}🔧 Generating Prisma client...${NC}"
    cd packages/database
    npx prisma generate
    cd ../..
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Prisma client generated successfully${NC}"
    else
        echo -e "${RED}❌ Failed to generate Prisma client${NC}"
        exit 1
    fi
}

# Function to run migrations
run_migrations() {
    echo -e "${GREEN}🚀 Running database migrations...${NC}"
    cd packages/database
    npx prisma migrate deploy
    cd ../..
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migrations completed successfully${NC}"
    else
        echo -e "${RED}❌ Migration failed${NC}"
        exit 1
    fi
}

# Function to seed database
seed_database() {
    echo -e "${GREEN}🌱 Seeding database with initial data...${NC}"
    cd packages/database
    
    if [ -f "seed.ts" ]; then
        npx tsx seed.ts
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database seeded successfully${NC}"
        else
            echo -e "${RED}❌ Database seeding failed${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}⚠️  No seed file found, skipping seeding${NC}"
    fi
    
    cd ../..
}

# Function to reset database
reset_database() {
    echo -e "${YELLOW}⚠️  This will delete all data in the database!${NC}"
    read -p "Are you sure you want to reset the database? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}🔄 Resetting database...${NC}"
        cd packages/database
        npx prisma migrate reset --force
        cd ../..
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database reset completed${NC}"
        else
            echo -e "${RED}❌ Database reset failed${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}❌ Database reset cancelled${NC}"
        exit 0
    fi
}

# Function to create database backup
backup_database() {
    BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"
    echo -e "${GREEN}💾 Creating database backup: ${BACKUP_FILE}${NC}"
    
    # Extract connection details for pg_dump
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p')
    
    PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backup created: ${BACKUP_FILE}${NC}"
        
        # Compress backup
        gzip $BACKUP_FILE
        echo -e "${GREEN}📦 Backup compressed: ${BACKUP_FILE}.gz${NC}"
    else
        echo -e "${RED}❌ Backup failed${NC}"
        exit 1
    fi
}

# Function to restore database from backup
restore_database() {
    if [ -z "$3" ]; then
        echo -e "${RED}❌ Please specify backup file: ./setup-db.sh ${ENVIRONMENT} restore backup-file.sql${NC}"
        exit 1
    fi
    
    BACKUP_FILE=$3
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}❌ Backup file not found: ${BACKUP_FILE}${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}⚠️  This will replace all current data!${NC}"
    read -p "Are you sure you want to restore from backup? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}🔄 Restoring database from backup...${NC}"
        
        # Extract connection details
        DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
        DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*\/\/[^:]*:\([^@]*\)@.*/\1/p')
        
        # Restore database
        if [[ $BACKUP_FILE == *.gz ]]; then
            gunzip -c $BACKUP_FILE | PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
        else
            PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < $BACKUP_FILE
        fi
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database restored successfully${NC}"
        else
            echo -e "${RED}❌ Database restore failed${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}❌ Database restore cancelled${NC}"
        exit 0
    fi
}

# Function to check database health
check_health() {
    echo -e "${GREEN}🏥 Checking database health...${NC}"
    cd packages/database
    
    # Check connection
    check_database_connection
    
    # Check tables exist
    echo -e "${GREEN}📋 Checking database schema...${NC}"
    npx prisma db pull --print > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database schema is valid${NC}"
    else
        echo -e "${RED}❌ Database schema issues detected${NC}"
        exit 1
    fi
    
    cd ../..
    echo -e "${GREEN}✅ Database health check completed${NC}"
}

# Main execution logic
case $ACTION in
    "setup")
        check_database_connection
        generate_client
        run_migrations
        seed_database
        echo -e "${GREEN}🎉 Database setup completed successfully!${NC}"
        ;;
        
    "migrate")
        check_database_connection
        run_migrations
        generate_client
        echo -e "${GREEN}🎉 Migration completed successfully!${NC}"
        ;;
        
    "seed")
        check_database_connection
        seed_database
        echo -e "${GREEN}🎉 Seeding completed successfully!${NC}"
        ;;
        
    "reset")
        reset_database
        seed_database
        echo -e "${GREEN}🎉 Database reset completed successfully!${NC}"
        ;;
        
    "generate")
        generate_client
        echo -e "${GREEN}🎉 Client generation completed successfully!${NC}"
        ;;
        
    "backup")
        backup_database
        echo -e "${GREEN}🎉 Backup completed successfully!${NC}"
        ;;
        
    "restore")
        restore_database $3
        echo -e "${GREEN}🎉 Restore completed successfully!${NC}"
        ;;
        
    "health")
        check_health
        echo -e "${GREEN}🎉 Health check completed successfully!${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Unknown action: ${ACTION}${NC}"
        echo "Available actions:"
        echo "  setup    - Full database setup (migrate + seed)"
        echo "  migrate  - Run migrations only"
        echo "  seed     - Seed database with initial data"
        echo "  reset    - Reset database (WARNING: deletes all data)"
        echo "  generate - Generate Prisma client"
        echo "  backup   - Create database backup"
        echo "  restore  - Restore from backup file"
        echo "  health   - Check database health"
        echo ""
        echo "Usage examples:"
        echo "  ./setup-db.sh development setup"
        echo "  ./setup-db.sh production migrate"
        echo "  ./setup-db.sh development backup"
        echo "  ./setup-db.sh development restore backup-20231201-120000.sql.gz"
        exit 1
        ;;
esac

echo -e "${GREEN}✨ Database operations completed!${NC}"
