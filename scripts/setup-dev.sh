#!/bin/bash

# Lamatic Clone Development Environment Setup Script
# This script sets up the development environment for Lamatic Clone

set -e

echo "🚀 Setting up Lamatic Clone development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        
        # Check if version is >= 18
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js version 18 or higher is required. Found: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm found: $NPM_VERSION"
    else
        print_error "npm is not installed."
        exit 1
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker found: $DOCKER_VERSION"
    else
        print_warning "Docker not found. Docker is optional but recommended for full development setup."
    fi
    
    # Check PostgreSQL (optional)
    if command -v psql &> /dev/null; then
        POSTGRES_VERSION=$(psql --version)
        print_success "PostgreSQL found: $POSTGRES_VERSION"
    else
        print_warning "PostgreSQL not found. You can use Docker for database or install PostgreSQL separately."
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ -f "package-lock.json" ]; then
        print_status "Found package-lock.json, using npm ci for faster installation..."
        npm ci
    else
        print_status "Installing dependencies with npm install..."
        npm install
    fi
    
    print_success "Dependencies installed successfully!"
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            print_success "Created .env.local from .env.example"
            print_warning "Please edit .env.local with your actual configuration values"
        else
            print_error ".env.example not found. Please create your .env.local file manually."
        fi
    else
        print_warning ".env.local already exists. Skipping environment setup."
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if DATABASE_URL is set
    if [ -f ".env.local" ]; then
        source .env.local
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL not set in .env.local. Please configure your database connection."
        return
    fi
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npm run db:generate
    
    # Run migrations
    print_status "Running database migrations..."
    npm run db:migrate
    
    print_success "Database setup completed!"
}

# Setup Docker services (optional)
setup_docker_services() {
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        read -p "Do you want to start Docker services (PostgreSQL, Redis, Weaviate)? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Starting Docker services..."
            docker-compose -f docker/docker-compose.yml up -d postgres redis
            print_success "Docker services started!"
            
            # Wait for services to be ready
            print_status "Waiting for services to be ready..."
            sleep 10
        fi
    fi
}

# Build the project
build_project() {
    print_status "Building the project..."
    npm run build
    print_success "Project built successfully!"
}

# Run tests
run_tests() {
    read -p "Do you want to run tests? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Running tests..."
        npm run test
        print_success "Tests completed!"
    fi
}

# Setup Git hooks (optional)
setup_git_hooks() {
    if [ -d ".git" ]; then
        read -p "Do you want to setup Git hooks for code quality? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Setting up Git hooks..."
            
            # Create pre-commit hook
            cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for Lamatic Clone

echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix the issues before committing."
    exit 1
fi

# Run type checking
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ Type checking failed. Please fix the issues before committing."
    exit 1
fi

echo "✅ Pre-commit checks passed!"
EOF
            
            chmod +x .git/hooks/pre-commit
            print_success "Git hooks setup completed!"
        fi
    fi
}

# Print final instructions
print_final_instructions() {
    echo
    echo "🎉 Development environment setup completed!"
    echo
    echo "Next steps:"
    echo "1. Edit .env.local with your actual configuration values"
    echo "2. Start the development server:"
    echo "   npm run dev:all"
    echo
    echo "Available commands:"
    echo "  npm run dev         - Start frontend only"
    echo "  npm run dev:api     - Start API server only"
    echo "  npm run dev:all     - Start all services"
    echo "  npm run build       - Build for production"
    echo "  npm run test        - Run tests"
    echo "  npm run lint        - Run linting"
    echo "  npm run type-check  - Run TypeScript type checking"
    echo
    echo "For Docker development:"
    echo "  npm run docker:build - Build Docker images"
    echo "  npm run docker:up    - Start all services with Docker"
    echo "  npm run docker:down  - Stop Docker services"
    echo
    echo "Documentation:"
    echo "  📖 Getting Started: docs/getting-started.md"
    echo "  🚀 Deployment Guide: docs/deployment.md"
    echo "  🔗 Integration Guide: docs/integrations.md"
    echo
    print_success "Happy coding! 🚀"
}

# Main execution
main() {
    echo "================================================"
    echo "🦜 Lamatic Clone Development Setup"
    echo "================================================"
    echo
    
    check_requirements
    install_dependencies
    setup_environment
    setup_docker_services
    setup_database
    build_project
    run_tests
    setup_git_hooks
    print_final_instructions
}

# Run main function
main "$@"