# Deployment Guide

This guide covers all deployment options for Lamatic Clone, from development to production environments.

## 🎯 Deployment Overview

Lamatic Clone supports multiple deployment strategies:

- **Edge Functions** - Serverless deployment with global CDN
- **Traditional Server** - VM or container-based deployment
- **Docker Containers** - Containerized deployment with orchestration
- **Kubernetes** - Scalable container orchestration
- **Hybrid Cloud** - Multi-cloud deployment strategy

## 🚀 Quick Deploy

### One-Click Deployments

#### Vercel (Recommended for Frontend)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/arturwyroslak/lamatic-clone)

#### Railway (Full Stack)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/lamatic-clone)

#### Heroku (API Server)
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/arturwyroslak/lamatic-clone)

## 🐳 Docker Deployment

### Development Environment

```bash
# Build all images
npm run docker:build

# Start all services
npm run docker:up

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
npm run docker:down
```

### Production Environment

```bash
# Build production images
docker-compose -f docker/docker-compose.prod.yml build

# Deploy with production configuration
docker-compose -f docker/docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker/docker-compose.prod.yml up -d --scale api=3 --scale web=2
```

### Docker Compose Configuration

```yaml
# docker/docker-compose.prod.yml
version: '3.8'

services:
  web:
    build:
      context: ../
      dockerfile: ./docker/Dockerfile.web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXTAUTH_URL=https://your-domain.com
    depends_on:
      - api
      - redis

  api:
    build:
      context: ../
      dockerfile: ./docker/Dockerfile.api
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=lamatic
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
      - api

volumes:
  postgres_data:
  redis_data:
```

## ☁️ Cloud Deployments

### AWS Deployment

#### Using AWS CDK

```typescript
// infrastructure/aws-cdk/lib/lamatic-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';

export class LamaticStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'LamaticVPC', {
      maxAzs: 2,
      natGateways: 1,
    });

    // RDS PostgreSQL
    const database = new rds.DatabaseInstance(this, 'LamaticDB', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      multiAz: false,
      deletionProtection: false,
    });

    // ElastiCache Redis
    const redis = new elasticache.CfnCacheCluster(this, 'LamaticRedis', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      numCacheNodes: 1,
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'LamaticCluster', {
      vpc,
      containerInsights: true,
    });

    // Task Definitions and Services...
  }
}
```

#### Deploy with CDK

```bash
cd infrastructure/aws-cdk
npm install
cdk bootstrap
cdk deploy
```

### Google Cloud Platform

#### Using Cloud Run

```yaml
# cloudbuild.yaml
steps:
  # Build web app
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/lamatic-web', '-f', 'docker/Dockerfile.web', '.']
  
  # Build API server
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/lamatic-api', '-f', 'docker/Dockerfile.api', '.']

  # Push images
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/lamatic-web']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/lamatic-api']

  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['run', 'deploy', 'lamatic-web', '--image', 'gcr.io/$PROJECT_ID/lamatic-web', '--region', 'us-central1', '--allow-unauthenticated']
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['run', 'deploy', 'lamatic-api', '--image', 'gcr.io/$PROJECT_ID/lamatic-api', '--region', 'us-central1', '--allow-unauthenticated']
```

### Microsoft Azure

#### Using Container Instances

```bash
# Create resource group
az group create --name lamatic-rg --location eastus

# Create container registry
az acr create --resource-group lamatic-rg --name lamaticregistry --sku Basic

# Build and push images
az acr build --registry lamaticregistry --image lamatic-web ./docker/Dockerfile.web
az acr build --registry lamaticregistry --image lamatic-api ./docker/Dockerfile.api

# Deploy container instances
az container create \
  --resource-group lamatic-rg \
  --name lamatic-web \
  --image lamaticregistry.azurecr.io/lamatic-web \
  --ports 3000 \
  --environment-variables NODE_ENV=production
```

## 🌐 Edge Functions

### Vercel Edge Functions

```typescript
// apps/edge/api/workflow/[id].ts
import { NextRequest, NextResponse } from 'next/server';
import { WorkflowEngine } from '@lamatic/agents';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workflowId = searchParams.get('id');
  
  if (!workflowId) {
    return NextResponse.json({ error: 'Workflow ID required' }, { status: 400 });
  }

  try {
    const engine = new WorkflowEngine();
    const result = await engine.execute(workflowId, await req.json());
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Cloudflare Workers

```javascript
// workers/workflow-executor.js
import { WorkflowEngine } from '@lamatic/agents';

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { workflowId, input } = await request.json();
      const engine = new WorkflowEngine(env);
      const result = await engine.execute(workflowId, input);
      
      return Response.json(result);
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
};
```

## 🔧 Configuration Management

### Environment Variables

```bash
# Production environment template
NODE_ENV=production

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/lamatic"
DIRECT_URL="postgresql://user:pass@localhost:5432/lamatic"
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# AI Models
OPENAI_API_KEY="sk-your-openai-key"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key"
COHERE_API_KEY="your-cohere-key"

# External Services
SLACK_BOT_TOKEN="xoxb-your-bot-token"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Monitoring
SENTRY_DSN="https://your-sentry-dsn"
GRAFANA_URL="https://your-grafana-instance"

# File Storage
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket"
```

### Secrets Management

#### AWS Secrets Manager

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });

export async function getSecret(secretName: string) {
  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretName })
    );
    return JSON.parse(response.SecretString || '{}');
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
}
```

## 📊 Monitoring & Observability

### Health Checks

```typescript
// apps/api/src/health.ts
export async function healthCheck() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    integrations: await checkIntegrations(),
    timestamp: new Date().toISOString(),
  };

  const isHealthy = Object.values(checks).every(check => 
    typeof check === 'boolean' ? check : check.status === 'ok'
  );

  return {
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
  };
}
```

### Logging Configuration

```typescript
// packages/shared/src/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Metrics Collection

```typescript
// packages/shared/src/metrics.ts
import client from 'prom-client';

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
});

export const workflowExecutions = new client.Counter({
  name: 'workflow_executions_total',
  help: 'Total number of workflow executions',
  labelNames: ['workflow_id', 'status'],
});
```

## 🔒 Security Considerations

### SSL/TLS Configuration

```nginx
# nginx/ssl.conf
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
}
```

### Network Security

```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: lamatic-network-policy
spec:
  podSelector:
    matchLabels:
      app: lamatic
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: frontend
    ports:
    - protocol: TCP
      port: 4000
```

## 🚀 Scaling Strategies

### Horizontal Scaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: lamatic-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: lamatic-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Database Scaling

```sql
-- Read replicas configuration
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'password';
SELECT pg_create_physical_replication_slot('replica_slot');

-- Connection pooling with PgBouncer
[databases]
lamatic = host=postgres port=5432 dbname=lamatic

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

## 📈 Performance Optimization

### CDN Configuration

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/your-cloud/',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### Database Optimization

```sql
-- Performance indexes
CREATE INDEX CONCURRENTLY idx_workflows_user_id ON workflows(user_id);
CREATE INDEX CONCURRENTLY idx_executions_workflow_id ON executions(workflow_id);
CREATE INDEX CONCURRENTLY idx_integrations_workspace_id ON integrations(workspace_id);

-- Partial indexes for active records
CREATE INDEX CONCURRENTLY idx_active_workflows ON workflows(user_id) WHERE status = 'active';
```

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
npm run db:studio

# Reset database
npm run db:reset
npm run db:migrate
```

#### Memory Issues
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### SSL Certificate Issues
```bash
# Generate self-signed certificates for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem
```

### Monitoring Commands

```bash
# Container resource usage
docker stats

# Application logs
docker-compose logs -f api
docker-compose logs -f web

# Database queries
docker exec -it postgres psql -U postgres -d lamatic -c "SELECT * FROM pg_stat_activity;"
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Run all tests: `npm run test`
- [ ] Type checking: `npm run type-check`
- [ ] Security audit: `npm audit`
- [ ] Build verification: `npm run build`
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed

### Post-deployment
- [ ] Health checks passing
- [ ] Performance metrics baseline
- [ ] Error monitoring configured
- [ ] Backup procedures tested
- [ ] Rollback plan documented
- [ ] Team notified

Ready to deploy your Lamatic Clone? Choose your deployment strategy and follow the guides above! 🚀