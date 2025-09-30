# Mini-SaaS Notes Application

A scalable, production-ready notes application built with NestJS, React, and Docker Swarm orchestration.

## 🏗️ Architecture

### Backend (NestJS)
- **Authentication**: JWT-based auth with access/refresh tokens
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for search optimization
- **API**: RESTful endpoints with proper validation
- **Health Checks**: Built-in health monitoring
- **Metrics**: Prometheus-ready endpoints

### Frontend (React + Vite)
- **UI Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: Context API for authentication
- **Routing**: React Router with protected routes
- **HTTP Client**: Axios with interceptors

### Infrastructure
- **Orchestration**: Docker Swarm with service scaling
- **Load Balancing**: NGINX with health checks
- **Database**: PostgreSQL 16 with persistent volumes
- **Caching**: Redis 7 with data persistence
- **Monitoring**: Health checks and status endpoints

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mini-sass
   ```

2. **Backend Development**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your database configuration
   npx prisma generate
   npx prisma db push
   npm run start:dev
   ```

3. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Production Deployment with Docker Swarm

1. **Initialize Docker Swarm** (if not already done)
   ```bash
   docker swarm init
   ```

2. **Configure Environment**
   ```bash
   cp .env.docker .env
   # Edit .env with your production values
   ```

3. **Deploy the Stack**
   ```bash
   ./deploy.sh deploy
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:8080/api
   - Health Check: http://localhost:8080/health

## 📁 Project Structure

```
mini-sass/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── notes/          # Notes CRUD operations
│   │   ├── cache/          # Redis caching
│   │   └── health/         # Health checks
│   ├── prisma/             # Database schema
│   └── Dockerfile          # Backend container
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # State management
│   │   └── assets/         # Static assets
│   └── Dockerfile          # Frontend container
├── deploy/                 # Deployment configuration
│   └── nginx/              # Load balancer config
├── docker-compose.yml      # Swarm stack definition
└── deploy.sh              # Deployment script
```

## 🔧 Available Commands

### Deployment Script
```bash
./deploy.sh [command]

Commands:
  build     - Build Docker images only
  deploy    - Build images and deploy stack (default)
  status    - Show stack status
  remove    - Remove the stack
  logs      - Show logs for a service (e.g., ./deploy.sh logs api)
  scale     - Scale a service (e.g., ./deploy.sh scale api 5)
  help      - Show help message
```

### Docker Swarm Commands
```bash
# View services
docker stack services mini-sass

# View service logs
docker service logs mini-sass_api --follow

# Scale services
docker service scale mini-sass_api=5

# Update service
docker service update --image mini-sass/api:v2 mini-sass_api

# Remove stack
docker stack rm mini-sass
```

## 🏭 Production Configuration

### Scaling Configuration
The application is configured for horizontal scaling:

- **API**: 3 replicas (configurable)
- **Frontend**: 2 replicas
- **NGINX**: 2 replicas for load balancer redundancy
- **Database**: Single instance with persistent storage
- **Redis**: Single instance with data persistence

### Resource Limits
Each service has defined resource limits:

- **API**: 0.5 CPU, 512MB RAM
- **Frontend**: 0.25 CPU, 256MB RAM
- **NGINX**: 0.25 CPU, 256MB RAM
- **Database**: 0.5 CPU, 512MB RAM
- **Redis**: 0.25 CPU, 256MB RAM

### Health Checks
All services include health checks:

- **API**: HTTP health endpoint
- **Frontend**: HTTP status check
- **NGINX**: Load balancer health
- **Database**: PostgreSQL ready check
- **Redis**: Redis ping command

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- CORS configuration
- Rate limiting on API endpoints
- Security headers in NGINX
- Non-root containers
- Environment variable secrets

## 📊 Monitoring

### Built-in Endpoints
- Health Check: `GET /health`
- Metrics: `GET /metrics` (Prometheus format)
- NGINX Status: `GET /nginx_status`

### Optional Monitoring Stack
Uncomment the monitoring services in `docker-compose.yml` to enable:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

## 🔄 CI/CD Integration

The project is ready for CI/CD integration:

1. **Build Stage**: `./deploy.sh build`
2. **Test Stage**: Run your test suites
3. **Deploy Stage**: `./deploy.sh deploy`

### Example GitHub Actions
```yaml
- name: Deploy to Swarm
  run: |
    ./deploy.sh build
    ./deploy.sh deploy
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Frontend: Change port 3000 in docker-compose.yml
   - API: Change port 8080 in docker-compose.yml

2. **Database Connection**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL service is healthy

3. **Service Not Starting**
   ```bash
   # Check service logs
   docker service logs mini-sass_<service-name>
   
   # Check service status
   docker stack ps mini-sass
   ```

4. **Scaling Issues**
   ```bash
   # Check node resources
   docker node ls
   
   # Check service constraints
   docker service inspect mini-sass_<service-name>
   ```

### Logs and Debugging
```bash
# View all stack logs
docker stack ps mini-sass

# Follow specific service logs
./deploy.sh logs api
./deploy.sh logs frontend
./deploy.sh logs nginx

# Check service health
curl http://localhost:8080/health
curl http://localhost:3000/health
```

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Notes Endpoints
- `GET /api/notes` - Get user notes (with pagination and search)
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in title and content
- `tags`: Filter by tags (comma-separated)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.