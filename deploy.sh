#!/bin/bash

# Mini-SaaS Docker Swarm Deployment Script
# This script builds and deploys the application using Docker Swarm

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="mini-sass"
API_IMAGE="mini-sass/api:latest"
FRONTEND_IMAGE="mini-sass/frontend:latest"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    log_success "Docker is running"
}

# Check if Docker Swarm is initialized
check_swarm() {
    if ! docker node ls >/dev/null 2>&1; then
        log_warning "Docker Swarm is not initialized. Initializing now..."
        docker swarm init
        log_success "Docker Swarm initialized"
    else
        log_success "Docker Swarm is already initialized"
    fi
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    # Build backend image
    log_info "Building backend image: $API_IMAGE"
    docker build -t "$API_IMAGE" ./backend
    log_success "Backend image built successfully"
    
    # Build frontend image
    log_info "Building frontend image: $FRONTEND_IMAGE"
    docker build -t "$FRONTEND_IMAGE" ./frontend
    log_success "Frontend image built successfully"
}

# Deploy the stack
deploy_stack() {
    log_info "Deploying stack: $STACK_NAME"
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Creating from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_info "Please review and update the .env file with your configuration"
        else
            log_error ".env.example file not found. Please create a .env file manually."
            exit 1
        fi
    fi
    
    # Deploy the stack
    docker stack deploy -c docker-compose.yml "$STACK_NAME"
    log_success "Stack deployed successfully"
}

# Initialize database
init_database() {
    log_info "Initializing database..."
    
    local max_attempts=30
    local attempt=1
    
    # Wait for API service to be running
    while [ $attempt -le $max_attempts ]; do
        local api_container=$(docker ps -q -f name="${STACK_NAME}_api" | head -1)
        if [ -n "$api_container" ]; then
            log_info "API container found: $api_container"
            break
        fi
        log_info "Attempt $attempt/$max_attempts: Waiting for API container..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    if [ -z "$api_container" ]; then
        log_error "API container not found after $max_attempts attempts"
        return 1
    fi
    
    # Wait a bit more for the container to be fully ready
    log_info "Waiting for API container to be ready..."
    sleep 10
    
    # Run database initialization
    log_info "Running Prisma database push..."
    if docker exec "$api_container" npx prisma db push; then
        log_success "Database initialized successfully"
    else
        log_error "Failed to initialize database"
        return 1
    fi
}

# Show stack status
show_status() {
    log_info "Stack services status:"
    docker stack services "$STACK_NAME"
    
    echo ""
    log_info "Stack tasks status:"
    docker stack ps "$STACK_NAME" --no-trunc
}

# Wait for services to be ready
wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        local running_services=$(docker stack services "$STACK_NAME" --format "table {{.Replicas}}" | grep -c "/" | head -1 || echo "0")
        local ready_services=$(docker stack services "$STACK_NAME" --format "table {{.Replicas}}" | grep -c "[0-9]*/[0-9]*" | head -1 || echo "0")
        
        if [ "$running_services" -eq "$ready_services" ] && [ "$ready_services" -gt 0 ]; then
            log_success "All services are ready!"
            break
        fi
        
        log_info "Attempt $attempt/$max_attempts: Waiting for services to be ready..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_warning "Services may not be fully ready. Check the status manually."
    fi
}

# Show access information
show_access_info() {
    echo ""
    log_success "=== Deployment Complete ==="
    echo ""
    log_info "Access your application:"
    echo "  • Frontend: http://localhost:3000"
    echo "  • API (via Load Balancer): http://localhost:8080/api"
    echo "  • API Health Check: http://localhost:8080/health"
    echo ""
    log_info "Useful commands:"
    echo "  • View services: docker stack services $STACK_NAME"
    echo "  • View logs: docker service logs $STACK_NAME_<service_name>"
    echo "  • Scale service: docker service scale $STACK_NAME_api=5"
    echo "  • Remove stack: docker stack rm $STACK_NAME"
    echo ""
}

# Remove the stack
remove_stack() {
    log_info "Removing stack: $STACK_NAME"
    docker stack rm "$STACK_NAME"
    log_success "Stack removed successfully"
}

# Main script logic
case "${1:-deploy}" in
    "build")
        check_docker
        build_images
        ;;
    "deploy")
        check_docker
        check_swarm
        build_images
        deploy_stack
        wait_for_services
        init_database
        show_status
        show_access_info
        ;;
    "status")
        check_docker
        show_status
        ;;
    "remove")
        check_docker
        remove_stack
        ;;
    "logs")
        if [ -z "$2" ]; then
            log_error "Please specify a service name. Available services: api, frontend, nginx, postgres, redis"
            exit 1
        fi
        docker service logs "${STACK_NAME}_$2" --follow
        ;;
    "scale")
        if [ -z "$2" ] || [ -z "$3" ]; then
            log_error "Usage: $0 scale <service> <replicas>"
            log_error "Example: $0 scale api 5"
            exit 1
        fi
        docker service scale "${STACK_NAME}_$2=$3"
        ;;
    "help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  build     - Build Docker images only"
        echo "  deploy    - Build images and deploy stack (default)"
        echo "  status    - Show stack status"
        echo "  remove    - Remove the stack"
        echo "  logs      - Show logs for a service (e.g., $0 logs api)"
        echo "  scale     - Scale a service (e.g., $0 scale api 5)"
        echo "  help      - Show this help message"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information."
        exit 1
        ;;
esac