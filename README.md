# QuickNotes - Mini SaaS Application

> **Assignment Completion Time**: 3.4 hours  
> **Focus**: Core functionality with production-ready architecture and scalability considerations

A comprehensive notes management application demonstrating modern full-stack development practices, containerization, orchestration, and scalable architecture design.

## 🎯 Assignment Requirements Fulfilled

✅ **User Management**: Email/password authentication with JWT  
✅ **Notes CRUD**: Complete create, read, update, delete operations  
✅ **Search & Caching**: Redis-powered tag filtering with query caching  
✅ **Frontend**: React + Vite with modern UI/UX  
✅ **Backend**: NestJS with feature-based architecture  
✅ **Dockerization**: Multi-service containerization  
✅ **Orchestration**: Docker Swarm with service scaling  
✅ **Load Balancing**: NGINX with health checks  
✅ **Monitoring**: Prometheus metrics and health endpoints  
✅ **Documentation**: Comprehensive setup and API documentation

## 🏗️ System Architecture

### High-Level Architecture Diagram

<img width="3840" height="2120" alt="QuickNotes System Architecture Diagram" src="https://github.com/user-attachments/assets/29bc9961-b2f5-40ce-bf62-c62ca1dd49ef" />

*Comprehensive system architecture showing Docker Swarm orchestration, load balancing, and data flow*

### User Journey & System Flow

<img width="3202" height="3840" alt="QuickNotes User Journey UML Sequence Diagram" src="https://github.com/user-attachments/assets/6ff1f4cc-eb94-497e-8ca7-4921febc2b16" />

*Detailed UML sequence diagram showing user registration, authentication, notes management, and system interactions with caching strategy*

## 🧠 Architecture Decisions & Trade-offs

### 1. **Docker Swarm for Replica Scaling**
**Decision**: Docker Swarm  
**Reasoning**: 
- **Simplicity**: Swarm provides built-in orchestration without additional complexity
- **Scalability For Replicas**: With Swarm's built-in load balancing, the system can easily scale to handle increased traffic and user load.
- **Resource Efficiency**: Lower overhead compared to K8s for small-scale deployments
- **Native Docker Integration**: Seamless integration with existing Docker workflow
- **Rapid Development**: Faster setup and deployment for MVP/prototype scenarios

**Trade-offs**:
- ✅ **Pros**: Simple setup, built-in load balancing, easy scaling, minimal resource overhead
- ❌ **Cons**: Less advanced features than K8s, smaller ecosystem, limited enterprise features

### 2. **NGINX vs Traefik for Load Balancing**
**Decision**: NGINX (with Traefik consideration)  
**Reasoning**:
- **Proven Stability**: Battle-tested in production environments
- **Performance**: Excellent performance for HTTP/HTTPS traffic
- **Simplicity**: Straightforward configuration for basic load balancing needs

**Alternative Considered**: Traefik
- **Traefik Advantages**: 
  - Automatic service discovery
  - Dynamic configuration updates
  - Built-in Let's Encrypt integration
  - Modern cloud-native approach
  - Better integration with container orchestrators

**Why NGINX for this project**:
- Assignment time constraints (4 hours)
- Simpler configuration for basic load balancing
- Well-documented and familiar

**Future Enhancement**: Traefik would be ideal for production deployment due to its automatic service discovery and dynamic configuration capabilities.

### 3. **Redis Caching Strategy**
**Decision**: Query-level caching with TTL  
**Implementation**:
- Cache search results by user and query parameters
- 5-minute TTL for balance between performance and data freshness
- Cache invalidation on note modifications

**Trade-offs**:
- ✅ **Pros**: Significant performance improvement for repeated searches, reduced database load
- ❌ **Cons**: Potential data staleness, additional complexity, memory usage

### 4. **Database Design**
**Decision**: PostgreSQL with Prisma ORM  
**Reasoning**:
- **ACID Compliance**: Ensures data consistency for user notes
- **JSON Support**: Native JSON fields for flexible tag storage
- **Scalability**: Excellent performance characteristics
- **Prisma Benefits**: Type-safe database access, automatic migrations, excellent TypeScript integration

### 5. **Authentication Strategy**
**Decision**: JWT with Refresh Tokens  
**Implementation**:
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Secure HTTP-only cookies for refresh tokens

**Security Considerations**:
- Password hashing with bcrypt
- JWT secret rotation capability
- Token blacklisting for logout

## 🔧 Technical Implementation Details

### Backend Architecture (NestJS)
- **Framework**: NestJS with TypeScript for enterprise-grade structure
- **Authentication**: JWT-based auth with access/refresh token strategy
- **Database**: PostgreSQL 16 with Prisma ORM for type-safe database operations
- **Caching**: Redis 7 for search query optimization and session management
- **API Design**: RESTful endpoints with OpenAPI documentation
- **Validation**: Class-validator with DTO pattern for request validation
- **Health Monitoring**: Built-in health checks and Prometheus metrics
- **Security**: CORS, rate limiting, helmet for security headers

### Frontend Architecture (React + Vite)
- **Framework**: React 18 with TypeScript and modern hooks
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom design system and glassmorphism effects
- **State Management**: Context API for authentication and global state
- **Routing**: React Router v6 with protected route guards
- **HTTP Client**: Axios with request/response interceptors for token management
- **UI/UX**: Modern responsive design with micro-interactions and animations

### Infrastructure & DevOps
- **Containerization**: Docker multi-stage builds for optimized images
- **Orchestration**: Docker Swarm for service scaling and management
- **Load Balancing**: NGINX with upstream health checks and failover
- **Service Discovery**: Docker Swarm's built-in service mesh
- **Monitoring**: Health endpoints, Prometheus metrics, and service logs
- **Security**: Non-root containers, secret management, network isolation

## 🚀 Quick Start & Setup Instructions

### Prerequisites
```bash
# Required software
- Docker 24+ and Docker Compose
- Node.js 18+ (for local development)
- Git
- 4GB+ RAM for full stack deployment
```

### 🐳 Production Deployment (Recommended)

1. **Clone and Configure**
   ```bash
   git clone <repository-url>
   cd mini-sass
   
   # Copy and configure environment
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Deploy with Docker Swarm**
   ```bash
   # Initialize Docker Swarm (if not already done)
   docker swarm init
   
   # Deploy the complete stack
   ./deploy.sh deploy
   
   # Monitor deployment
   ./deploy.sh status
   ```

3. **Access the Application**
   ```bash
   # Application URLs
   Frontend:     http://localhost:3000
   API:          http://localhost:8080/api
   Health Check: http://localhost:8080/health
   Metrics:      http://localhost:8080/metrics
   ```

### 💻 Development Setup

1. **Backend Development**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   
   # Database setup
   npx prisma generate
   npx prisma db push
   
   # Start development server
   npm run start:dev
   # API available at http://localhost:3001
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   
   # Start development server
   npm run dev
   # Frontend available at http://localhost:5173
   ```

3. **Database & Cache (Docker)**
   ```bash
   # Start only database and Redis for development
   docker-compose up postgres redis -d
   ```

## 📋 Complete API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/api/auth/register` | User registration | `{email, password, name}` | `{user, accessToken, refreshToken}` |
| `POST` | `/api/auth/login` | User login | `{email, password}` | `{user, accessToken, refreshToken}` |
| `POST` | `/api/auth/refresh` | Refresh access token | `{refreshToken}` | `{accessToken}` |
| `POST` | `/api/auth/logout` | User logout | `{refreshToken}` | `{message}` |
| `GET` | `/api/auth/profile` | Get user profile | Headers: `Authorization: Bearer <token>` | `{user}` |

### Notes Endpoints

| Method | Endpoint | Description | Query Parameters | Request Body | Response |
|--------|----------|-------------|------------------|--------------|----------|
| `GET` | `/api/notes` | Get user notes | `page`, `limit`, `search`, `tags` | - | `{notes[], total, page, limit}` |
| `POST` | `/api/notes` | Create new note | - | `{title, content, tags[]}` | `{note}` |
| `GET` | `/api/notes/:id` | Get specific note | - | - | `{note}` |
| `PATCH` | `/api/notes/:id` | Update note | - | `{title?, content?, tags[]?}` | `{note}` |
| `DELETE` | `/api/notes/:id` | Delete note | - | - | `{message}` |

### Health & Monitoring Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/health` | Application health check | `{status, info, error, details}` |
| `GET` | `/metrics` | Prometheus metrics | Prometheus format |

### Query Parameters Details

- **`page`**: Page number (default: 1, min: 1)
- **`limit`**: Items per page (default: 10, max: 100)
- **`search`**: Search in title and content (case-insensitive)
- **`tags`**: Filter by tags (comma-separated, e.g., `work,urgent`)

### Example API Requests

```bash
# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Create a note (with JWT token)
curl -X POST http://localhost:8080/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"title":"Meeting Notes","content":"Discuss project timeline","tags":["work","meeting"]}'

# Search notes with tags
curl "http://localhost:8080/api/notes?tags=work,urgent&search=project&page=1&limit=10" \
  -H "Authorization: Bearer <your-jwt-token>"

# Health check
curl http://localhost:8080/health
```

## 📁 Project Structure

```
quicknotes/
├── 📁 backend/                    # NestJS API Server
│   ├── 📁 src/
│   │   ├── 📁 auth/              # 🔐 Authentication Module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── guards/           # JWT & Auth Guards
│   │   │   └── strategies/       # Passport Strategies
│   │   ├── 📁 users/             # 👤 User Management
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── 📁 notes/             # 📝 Notes CRUD Operations
│   │   │   ├── notes.controller.ts
│   │   │   ├── notes.service.ts
│   │   │   ├── notes.module.ts
│   │   │   └── dto/              # Note DTOs
│   │   ├── 📁 cache/             # 🚀 Redis Caching Layer
│   │   │   ├── cache.service.ts
│   │   │   └── cache.module.ts
│   │   ├── 📁 health/            # 🏥 Health Checks
│   │   │   ├── health.controller.ts
│   │   │   └── health.module.ts
│   │   ├── 📁 common/            # 🔧 Shared Utilities
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── pipes/
│   │   ├── app.module.ts         # Main Application Module
│   │   ├── main.ts              # Application Bootstrap
│   │   └── prisma.service.ts    # Database Service
│   ├── 📁 prisma/
│   │   └── schema.prisma        # 🗄️ Database Schema
│   ├── 📁 test/                 # 🧪 Test Files
│   ├── .env.example            # Environment Template
│   ├── Dockerfile              # 🐳 Backend Container
│   ├── package.json
│   └── tsconfig.json
├── 📁 frontend/                   # React Application
│   ├── 📁 src/
│   │   ├── 📁 components/        # ⚛️ React Components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── NoteModal.tsx
│   │   ├── 📁 contexts/          # 🌐 State Management
│   │   │   └── AuthContext.tsx
│   │   ├── 📁 assets/           # 🎨 Static Assets
│   │   ├── App.tsx              # Main App Component
│   │   ├── main.tsx            # Application Entry
│   │   └── index.css           # Global Styles
│   ├── 📁 public/
│   ├── .env.example
│   ├── Dockerfile              # 🐳 Frontend Container
│   ├── nginx.conf              # NGINX Configuration
│   ├── package.json
│   ├── tailwind.config.js      # Tailwind Configuration
│   └── vite.config.ts          # Vite Configuration
├── 📁 deploy/                    # 🚀 Deployment Configuration
│   └── 📁 nginx/
│       └── nginx.conf          # Load Balancer Config
├── 📄 docker-compose.yml        # 🐳 Swarm Stack Definition
├── 📄 .env.example              # Environment Variables Template
├── 📄 deploy.sh                 # 🚀 Deployment Script
├── 📄 Makefile                  # Build Automation
└── 📄 README.md                 # This Documentation
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

## 📸 Application Screenshots

### Login Page
<img width="782" height="908" alt="QuickNotes Login Page" src="https://github.com/user-attachments/assets/4c0bcb2e-5dc3-4a5e-bbbb-c75577807a38" />

*Modern glassmorphism design with gradient background and clean authentication form*

### Registration Page
<img width="782" height="908" alt="QuickNotes Registration Page" src="https://github.com/user-attachments/assets/e38d2fff-eace-42c5-b50e-dee52329ab7a" />

*User-friendly signup interface with consistent design language*

### Dashboard - Empty State
<img width="1518" height="892" alt="QuickNotes Dashboard - No Notes" src="https://github.com/user-attachments/assets/101cd019-53b1-4d05-b60a-ceffa2b1de0b" />

*Clean dashboard layout with intuitive "Create Note" call-to-action for new users*

### Dashboard - With Notes
<img width="1518" height="892" alt="QuickNotes Dashboard - With Notes" src="https://github.com/user-attachments/assets/78b05904-0423-483d-a83f-0ec5cee382d8" />

*Fully functional notes management interface with search, filtering, and CRUD operations*

## 🚀 Future Enhancements

- **Advanced Search**: Full-text search with Elasticsearch
- **Real-time Collaboration**: WebSocket-based collaborative editing
- **Mobile App**: React Native mobile application
- **AI Integration**: Smart note categorization and suggestions
- **Advanced Analytics**: User behavior tracking and insights
- **Multi-tenancy**: Support for organizations and teams
- **API Rate Limiting**: Advanced rate limiting with Redis
- **Content Versioning**: Note history and version control
- **Rich Text Editor**: WYSIWYG editor with markdown support
- **File Attachments**: Support for images and documents
- **Traefik Migration**: Replace NGINX with Traefik for advanced traffic management
- **Kubernetes Migration**: Scale to Kubernetes for enterprise-level orchestration


**Built with ❤️ by a Senior Developer who values clean architecture, scalable solutions, and thoughtful engineering decisions.**

*This project demonstrates proficiency in modern full-stack development, containerization, orchestration, and production-ready system design*

## 📄 License

This project is licensed under the MIT License.