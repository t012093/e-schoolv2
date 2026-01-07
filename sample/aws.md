# AWS Architecture Overview - System Interactions

## High-Level AWS Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    Internet                                     │
└─────────────────────────┬───────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────────────────────┐
│                            CloudFront CDN                                       │
│                     (Global Content Delivery)                                   │
└─────────────────────────┬───────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────────────────────┐
│                        Route 53 DNS                                             │
│                    (Domain Management)                                          │
└─────────────────────────┬───────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────────────────────┐
│                    Application Load Balancer                                    │
│                      (Traffic Distribution)                                     │
└─────────────────────────┬───────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Frontend   │ │   Backend    │ │  WebSocket   │
│   (ECS)      │ │   (ECS)      │ │   (ECS)      │
│  Next.js     │ │  FastAPI     │ │   Server     │
└──────────────┘ └──────────────┘ └──────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   RDS        │ │ ElastiCache  │ │     S3       │
│ PostgreSQL   │ │    Redis     │ │ File Storage │
└──────────────┘ └──────────────┘ └──────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Lambda     │ │     SQS      │ │  CloudWatch  │
│ Background   │ │   Message    │ │  Monitoring  │
│   Tasks      │ │    Queue     │ │   & Logs     │
└──────────────┘ └──────────────┘ └──────────────┘
```

## Detailed AWS Service Interactions

### 1. User Request Flow

```
User Browser → CloudFront → Route 53 → ALB → ECS Services
     ↓
Static Assets (S3) ← CloudFront Cache
     ↓
API Requests → Backend (ECS) → Database (RDS) → Cache (ElastiCache)
     ↓
AI Processing → Lambda Functions → External APIs (OpenAI/Claude)
     ↓
Real-time Updates → WebSocket (ECS) → Redis Pub/Sub → Client
```

### 2. AWS Services Breakdown

#### **Frontend Layer**

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Services                        │
├─────────────────────────────────────────────────────────────┤
│ CloudFront CDN                                              │
│ ├── Global edge locations                                   │
│ ├── Static asset caching (JS, CSS, images)                 │
│ ├── SSL/TLS termination                                     │
│ └── DDoS protection                                         │
│                                                             │
│ S3 Bucket (Static Assets)                                   │
│ ├── Next.js build output                                    │
│ ├── Images and media files                                  │
│ ├── User uploaded content                                   │
│ └── Backup storage                                          │
│                                                             │
│ ECS Fargate (Next.js App)                                   │
│ ├── Container: learning-platform-frontend                   │
│ ├── Auto-scaling: 2-10 instances                           │
│ ├── Health checks: /health endpoint                        │
│ └── Environment: Production/Staging                         │
└─────────────────────────────────────────────────────────────┘
```

#### **API Layer**

```
┌─────────────────────────────────────────────────────────────┐
│                     API Services                            │
├─────────────────────────────────────────────────────────────┤
│ Application Load Balancer                                   │
│ ├── Path-based routing: /api/* → Backend                   │
│ ├── Health checks and failover                             │
│ ├── SSL termination                                         │
│ └── Request logging                                         │
│                                                             │
│ ECS Fargate (FastAPI Backend)                               │
│ ├── Container: learning-platform-backend                    │
│ ├── Auto-scaling: 3-15 instances                           │
│ ├── CPU/Memory: 2 vCPU, 4GB RAM                           │
│ └── Environment variables from Parameter Store              │
│                                                             │
│ API Gateway (Optional - for Lambda functions)              │
│ ├── Rate limiting: 1000 req/min per user                   │
│ ├── API key management                                      │
│ ├── Request/response transformation                         │
│ └── CORS configuration                                      │
└─────────────────────────────────────────────────────────────┘
```

#### **Data Layer**

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Services                            │
├─────────────────────────────────────────────────────────────┤
│ RDS PostgreSQL                                              │
│ ├── Multi-AZ deployment for high availability               │
│ ├── Read replicas for scaling                               │
│ ├── Automated backups (7-day retention)                     │
│ ├── Instance: db.r6g.xlarge (4 vCPU, 32GB RAM)              │
│ └── Encryption at rest and in transit                       │
│                                                             │
│ ElastiCache Redis                                           │
│ ├── Cluster mode for high availability                      │
│ ├── Session storage and caching                             │
│ ├── Real-time data for WebSocket connections                │
│ ├── Instance: cache.r6g.large (2 vCPU, 13GB RAM)            │
│ └── Automatic failover                                      │
│                                                             │
│ S3 Buckets                                                  │
│ ├── User uploads: learning-platform-uploads                 │
│ ├── Backups: learning-platform-backups                      │
│ ├── Static assets: learning-platform-static                 │
│ └── Logs: learning-platform-logs                            │
└─────────────────────────────────────────────────────────────┘
```

#### **Processing Layer**

```
┌─────────────────────────────────────────────────────────────┐
│                 Processing Services                         │
├─────────────────────────────────────────────────────────────┤
│ Lambda Functions                                            │
│ ├── AI Processing: assessment-analyzer                      │
│ ├── Health Insights: health-pattern-detector                │
│ ├── Email Notifications: notification-sender                │
│ ├── Data Processing: analytics-processor                    │
│ └── Scheduled Tasks: daily-report-generator                 │
│                                                             │
│ SQS (Simple Queue Service)                                  │
│ ├── Assessment processing queue                             │
│ ├── Email notification queue                                │
│ ├── Health analysis queue                                   │
│ ├── Dead letter queues for error handling                   │
│ └── FIFO queues for ordered processing                      │
│                                                             │
│ EventBridge                                                 │
│ ├── Scheduled events (daily health reminders)               │
│ ├── System events (user registration, completion)           │
│ ├── Cross-service communication                             │
│ └── Third-party integrations                                │
└─────────────────────────────────────────────────────────────┘
```

#### **Monitoring & Security**

```
┌─────────────────────────────────────────────────────────────┐
│               Monitoring & Security                         │
├─────────────────────────────────────────────────────────────┤
│ CloudWatch                                                  │
│ ├── Application logs from ECS containers                    │
│ ├── Custom metrics (API response times, user activity)      │
│ ├── Alarms for system health                                │
│ └── Dashboards for real-time monitoring                     │
│                                                             │
│ AWS WAF                                                     │
│ ├── SQL injection protection                                │
│ ├── XSS attack prevention                                   │
│ ├── Rate limiting rules                                     │
│ └── IP whitelisting/blacklisting                            │
│                                                             │
│ Secrets Manager                                             │
│ ├── Database credentials                                    │
│ ├── API keys (OpenAI, Claude)                               │
│ ├── JWT secrets                                             │
│ └── Third-party service credentials                         │
│                                                             │
│ IAM (Identity and Access Management)                        │
│ ├── Service roles for ECS tasks                             │
│ ├── Lambda execution roles                                  │
│ ├── Cross-service permissions                               │
│ └── User access policies                                    │
└─────────────────────────────────────────────────────────────┘
```

## System Interaction Flows

### 1. User Registration & Assessment Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │ CloudFront  │    │     ALB     │    │ ECS Backend │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │                  │
      │ 1. Register      │                  │                  │
      ├─────────────────►│                  │                  │
      │                  │ 2. Route to ALB  │                  │
      │                  ├─────────────────►│                  │
      │                  │                  │ 3. Forward       │
      │                  │                  ├─────────────────►│
      │                  │                  │                  │ 4. Validate & Store
      │                  │                  │                  ├──────────────┐
      │                  │                  │                  │              │
┌─────▼───────┐    ┌─────▼───────┐    ┌─────▼───────┐    ┌─────▼───────┐    │
│     RDS     │    │ Secrets Mgr │    │     SQS     │    │   Lambda    │    │
│ PostgreSQL  │    │             │    │   Queue     │    │  Functions  │    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    │
      ▲                  ▲                  ▲                  ▲              │
      │                  │                  │                  │              │
      │ 5. Store user    │ 6. Get secrets   │ 7. Queue email   │ 8. Process   │
      └──────────────────┴──────────────────┴──────────────────┴──────────────┘
```

### 2. AI Coaching Interaction Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │ WebSocket   │    │ ECS Backend │    │   Lambda    │
│  (React)    │    │   Server    │    │  (FastAPI)  │    │ AI Processor│
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │                  │
      │ 1. Send message  │                  │                  │
      ├─────────────────►│                  │                  │
      │                  │ 2. Process msg   │                  │
      │                  ├─────────────────►│                  │
      │                  │                  │ 3. Queue AI req  │
      │                  │                  ├─────────────────►│
      │                  │                  │                  │ 4. Call OpenAI
      │                  │                  │                  ├──────────────┐
      │                  │                  │                  │              │
┌─────▼───────┐    ┌─────▼───────┐    ┌─────▼───────┐    ┌─────▼───────┐    │
│ElastiCache  │    │     RDS     │    │     SQS     │    │  OpenAI     │    │
│   Redis     │    │ PostgreSQL  │    │   Queue     │    │    API      │    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    │
      ▲                  ▲                  ▲                  ▲              │
      │                  │                  │                  │              │
      │ 5. Cache context │ 6. Store convo  │ 7. Response      │ 8. AI response│
      └──────────────────┴──────────────────┴──────────────────┴──────────────┘
```

### 3. Health Tracking & Analytics Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Mobile    │    │     ALB     │    │ ECS Backend │    │   Lambda    │
│    App      │    │             │    │  (FastAPI)  │    │ Analytics   │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │                  │
      │ 1. Health data   │                  │                  │
      ├─────────────────►│                  │                  │
      │                  │ 2. Route API     │                  │
      │                  ├─────────────────►│                  │
      │                  │                  │ 3. Store & queue │
      │                  │                  ├─────────────────►│
      │                  │                  │                  │ 4. Analyze patterns
      │                  │                  │                  ├──────────────┐
      │                  │                  │                  │              │
┌─────▼───────┐    ┌─────▼───────┐    ┌─────▼───────┐    ┌─────▼───────┐    │
│     RDS     │    │ElastiCache  │    │ CloudWatch  │    │     SQS     │    │
│ PostgreSQL  │    │   Redis     │    │  Metrics    │    │   Queue     │    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    │
      ▲                  ▲                  ▲                  ▲              │
      │                  │                  │                  │              │
      │ 5. Store data    │ 6. Cache insights│ 7. Log metrics  │ 8. Queue jobs │
      └──────────────────┴──────────────────┴──────────────────┴──────────────┘
```

## AWS Service Configuration

### 1. VPC Network Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    VPC                                          │
│                            10.0.0.0/16                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐    │
│  │   Public Subnet     │  │   Public Subnet     │  │   Public Subnet     │    │
│  │   10.0.1.0/24       │  │   10.0.2.0/24       │  │   10.0.3.0/24       │    │
│  │   (AZ-1a)           │  │   (AZ-1b)           │  │   (AZ-1c)           │    │
│  │                     │  │                     │  │                     │    │
│  │  ┌─────────────┐    │  │  ┌─────────────┐    │  │  ┌─────────────┐    │    │
│  │  │     ALB     │    │  │  │     ALB     │    │  │  │     ALB     │    │    │
│  │  └─────────────┘    │  │  └─────────────┘    │  │  └─────────────┘    │    │
│  │  ┌─────────────┐    │  │  ┌─────────────┐    │  │  ┌─────────────┐    │    │
│  │  │   NAT GW    │    │  │  │   NAT GW    │    │  │  │   NAT GW    │    │    │
│  │  └─────────────┘    │  │  └─────────────┘    │  │  └─────────────┘    │    │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐    │
│  │  Private Subnet     │  │  Private Subnet     │  │  Private Subnet     │    │
│  │   10.0.4.0/24       │  │   10.0.5.0/24       │  │   10.0.6.0/24       │    │
│  │   (AZ-1a)           │  │   (AZ-1b)           │  │   (AZ-1c)           │    │
│  │                     │  │                     │  │                     │    │
│  │  ┌─────────────┐    │  │  ┌─────────────┐    │  │  ┌─────────────┐    │    │
│  │  │ ECS Tasks   │    │  │  │ ECS Tasks   │    │  │  │ ECS Tasks   │    │    │
│  │  └─────────────┘    │  │  └─────────────┘    │  │  └─────────────┘    │    │
│  │  ┌─────────────┐    │  │  ┌─────────────┐    │  │  ┌─────────────┐    │    │
│  │  │   Lambda    │    │  │  │   Lambda    │    │  │  │   Lambda    │    │    │
│  │  └─────────────┘    │  │  └─────────────┘    │  │  └─────────────┘    │    │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘    │
│                                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐    │
│  │  Database Subnet    │  │  Database Subnet    │  │  Database Subnet    │    │
│  │   10.0.7.0/24       │  │   10.0.8.0/24       │  │   10.0.9.0/24       │    │
│  │   (AZ-1a)           │  │   (AZ-1b)           │  │   (AZ-1c)           │    │
│  │                     │  │                     │  │                     │    │
│  │  ┌─────────────┐    │  │  ┌─────────────┐    │  │  ┌─────────────┐    │    │
│  │  │     RDS     │    │  │  │     RDS     │    │  │  │ElastiCache  │    │    │
│  │  │  (Primary)  │    │  │  │  (Replica)  │    │  │  │   Redis     │    │    │
│  │  └─────────────┘    │  │  └─────────────┘    │  │  └─────────────┘    │    │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2. ECS Cluster Configuration

```yaml
# ECS Cluster: learning-platform-cluster
Cluster:
  Name: learning-platform-cluster
  CapacityProviders:
    - FARGATE
    - FARGATE_SPOT
  DefaultCapacityProviderStrategy:
    - CapacityProvider: FARGATE
      Weight: 1
      Base: 2
    - CapacityProvider: FARGATE_SPOT
      Weight: 4

# Frontend Service
FrontendService:
  ServiceName: learning-platform-frontend
  TaskDefinition:
    Family: frontend-task
    NetworkMode: awsvpc
    RequiresCompatibilities: [FARGATE]
    Cpu: 1024
    Memory: 2048
    ContainerDefinitions:
      - Name: frontend
        Image: learning-platform/frontend:latest
        PortMappings:
          - ContainerPort: 3000
            Protocol: tcp
        Environment:
          - Name: NODE_ENV
            Value: production
          - Name: NEXT_PUBLIC_API_URL
            Value: https://api.learningplatform.com
        LogConfiguration:
          LogDriver: awslogs
          Options:
            awslogs-group: /ecs/frontend
            awslogs-region: us-east-1
            awslogs-stream-prefix: ecs

# Backend Service
BackendService:
  ServiceName: learning-platform-backend
  TaskDefinition:
    Family: backend-task
    NetworkMode: awsvpc
    RequiresCompatibilities: [FARGATE]
    Cpu: 2048
    Memory: 4096
    ContainerDefinitions:
      - Name: backend
        Image: learning-platform/backend:latest
        PortMappings:
          - ContainerPort: 8000
            Protocol: tcp
        Environment:
          - Name: DATABASE_URL
            ValueFrom: arn:aws:secretsmanager:us-east-1:123456789:secret:db-credentials
          - Name: REDIS_URL
            ValueFrom: arn:aws:secretsmanager:us-east-1:123456789:secret:redis-url
        LogConfiguration:
          LogDriver: awslogs
          Options:
            awslogs-group: /ecs/backend
            awslogs-region: us-east-1
            awslogs-stream-prefix: ecs
```

### 3. RDS Configuration

```yaml
# Primary Database
PrimaryDB:
  DBInstanceIdentifier: learning-platform-primary
  DBInstanceClass: db.r6g.xlarge
  Engine: postgres
  EngineVersion: "15.4"
  AllocatedStorage: 100
  StorageType: gp3
  StorageEncrypted: true
  MultiAZ: true
  BackupRetentionPeriod: 7
  PreferredBackupWindow: "03:00-04:00"
  PreferredMaintenanceWindow: "sun:04:00-sun:05:00"
  VpcSecurityGroupIds:
    - sg-database-security-group
  DBSubnetGroupName: learning-platform-db-subnet-group

# Read Replica
ReadReplica:
  DBInstanceIdentifier: learning-platform-replica
  SourceDBInstanceIdentifier: learning-platform-primary
  DBInstanceClass: db.r6g.large
  PubliclyAccessible: false
```

### 4. ElastiCache Configuration

```yaml
# Redis Cluster
RedisCluster:
  CacheClusterId: learning-platform-redis
  Engine: redis
  CacheNodeType: cache.r6g.large
  NumCacheNodes: 3
  Port: 6379
  VpcSecurityGroupIds:
    - sg-redis-security-group
  CacheSubnetGroupName: learning-platform-cache-subnet-group

# Redis Replication Group
ReplicationGroup:
  ReplicationGroupId: learning-platform-redis-cluster
  Description: Redis cluster for learning platform
  NumCacheClusters: 3
  CacheNodeType: cache.r6g.large
  Engine: redis
  Port: 6379
  AutomaticFailoverEnabled: true
  MultiAZEnabled: true
```

## Data Flow & Processing

### 1. Real-time Data Processing

```
User Action → WebSocket → ECS Backend → Redis Pub/Sub → Lambda → Analytics
     ↓              ↓           ↓            ↓           ↓          ↓
CloudWatch ← SQS ← Database ← Cache ← Processing ← Insights ← Storage
```

### 2. Batch Processing Pipeline

```
Scheduled Event (EventBridge) → Lambda Trigger → SQS Queue → Batch Processing
                                      ↓
                              Data Extraction (RDS)
                                      ↓
                              Analysis & ML Processing
                                      ↓
                              Results Storage (S3 + RDS)
                                      ↓
                              Notification (SNS/SES)
```

### 3. AI Processing Workflow

```
User Input → API Gateway → Lambda (AI Processor) → OpenAI/Claude API
     ↓              ↓              ↓                      ↓
Context Retrieval ← Cache ← Response Processing ← AI Response
     ↓              ↓              ↓                      ↓
Database Storage ← Redis ← WebSocket Broadcast ← User Interface
```

## Security & Compliance

### 1. Security Groups Configuration

```yaml
# ALB Security Group
ALBSecurityGroup:
  GroupDescription: Security group for Application Load Balancer
  SecurityGroupIngress:
    - IpProtocol: tcp
      FromPort: 80
      ToPort: 80
      CidrIp: 0.0.0.0/0
    - IpProtocol: tcp
      FromPort: 443
      ToPort: 443
      CidrIp: 0.0.0.0/0

# ECS Security Group
ECSSecurityGroup:
  GroupDescription: Security group for ECS tasks
  SecurityGroupIngress:
    - IpProtocol: tcp
      FromPort: 3000
      ToPort: 3000
      SourceSecurityGroupId: !Ref ALBSecurityGroup
    - IpProtocol: tcp
      FromPort: 8000
      ToPort: 8000
      SourceSecurityGroupId: !Ref ALBSecurityGroup

# Database Security Group
DatabaseSecurityGroup:
  GroupDescription: Security group for RDS database
  SecurityGroupIngress:
    - IpProtocol: tcp
      FromPort: 5432
      ToPort: 5432
      SourceSecurityGroupId: !Ref ECSSecurityGroup
    - IpProtocol: tcp
      FromPort: 5432
      ToPort: 5432
      SourceSecurityGroupId: !Ref LambdaSecurityGroup

# Redis Security Group
RedisSecurityGroup:
  GroupDescription: Security group for ElastiCache Redis
  SecurityGroupIngress:
    - IpProtocol: tcp
      FromPort: 6379
      ToPort: 6379
      SourceSecurityGroupId: !Ref ECSSecurityGroup
```

### 2. IAM Roles & Policies

```yaml
# ECS Task Execution Role
ECSTaskExecutionRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Statement:
        - Effect: Allow
          Principal:
            Service: ecs-tasks.amazonaws.com
          Action: sts:AssumeRole
    ManagedPolicyArns:
      - arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
    Policies:
      - PolicyName: SecretsManagerAccess
        PolicyDocument:
          Statement:
            - Effect: Allow
              Action:
                - secretsmanager:GetSecretValue
              Resource:
                - arn:aws:secretsmanager:*:*:secret:learning-platform/*

# Lambda Execution Role
LambdaExecutionRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Statement:
        - Effect: Allow
          Principal:
            Service: lambda.amazonaws.com
          Action: sts:AssumeRole
    ManagedPolicyArns:
      - arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole
    Policies:
      - PolicyName: DatabaseAccess
        PolicyDocument:
          Statement:
            - Effect: Allow
              Action:
                - rds:DescribeDBInstances
                - rds:Connect
              Resource: "*"
      - PolicyName: SQSAccess
        PolicyDocument:
          Statement:
            - Effect: Allow
              Action:
                - sqs:ReceiveMessage
                - sqs:DeleteMessage
                - sqs:SendMessage
              Resource:
                - arn:aws:sqs:*:*:learning-platform-*
```

## Monitoring & Alerting

### 1. CloudWatch Dashboards

```yaml
# Main Application Dashboard
ApplicationDashboard:
  DashboardName: LearningPlatform-Main
  Widgets:
    - Type: Metric
      Properties:
        Metrics:
          - [
              AWS/ApplicationELB,
              RequestCount,
              LoadBalancer,
              learning-platform-alb,
            ]
          - [
              AWS/ApplicationELB,
              TargetResponseTime,
              LoadBalancer,
              learning-platform-alb,
            ]
        Period: 300
        Stat: Average
        Region: us-east-1
        Title: ALB Metrics

    - Type: Metric
      Properties:
        Metrics:
          - [AWS/ECS, CPUUtilization, ServiceName, learning-platform-backend]
          - [AWS/ECS, MemoryUtilization, ServiceName, learning-platform-backend]
        Period: 300
        Stat: Average
        Region: us-east-1
        Title: ECS Backend Metrics

    - Type: Metric
      Properties:
        Metrics:
          - [
              AWS/RDS,
              CPUUtilization,
              DBInstanceIdentifier,
              learning-platform-primary,
            ]
          - [
              AWS/RDS,
              DatabaseConnections,
              DBInstanceIdentifier,
              learning-platform-primary,
            ]
        Period: 300
        Stat: Average
        Region: us-east-1
        Title: RDS Metrics
```

### 2. CloudWatch Alarms

```yaml
# High CPU Alarm
HighCPUAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: LearningPlatform-HighCPU
    AlarmDescription: Alert when CPU exceeds 80%
    MetricName: CPUUtilization
    Namespace: AWS/ECS
    Statistic: Average
    Period: 300
    EvaluationPeriods: 2
    Threshold: 80
    ComparisonOperator: GreaterThanThreshold
    Dimensions:
      - Name: ServiceName
        Value: learning-platform-backend
    AlarmActions:
      - !Ref SNSTopicArn

# Database Connection Alarm
DatabaseConnectionAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: LearningPlatform-DatabaseConnections
    AlarmDescription: Alert when database connections exceed 80
    MetricName: DatabaseConnections
    Namespace: AWS/RDS
    Statistic: Average
    Period: 300
    EvaluationPeriods: 2
    Threshold: 80
    ComparisonOperator: GreaterThanThreshold
    Dimensions:
      - Name: DBInstanceIdentifier
        Value: learning-platform-primary
```

## Cost Optimization

### 1. Resource Sizing

```yaml
# Production Environment Costs (Monthly Estimates)
Services:
  ECS_Fargate:
    Frontend:
      - Instances: 2-6 (auto-scaling)
      - CPU: 1 vCPU per instance
      - Memory: 2GB per instance
      - Cost: ~$50-150/month

    Backend:
      - Instances: 3-10 (auto-scaling)
      - CPU: 2 vCPU per instance
      - Memory: 4GB per instance
      - Cost: ~$200-600/month

  RDS_PostgreSQL:
    Primary:
      - Instance: db.r6g.xlarge
      - Storage: 100GB GP3
      - Cost: ~$400/month
    Replica:
      - Instance: db.r6g.large
      - Cost: ~$200/month

  ElastiCache_Redis:
    - Instance: cache.r6g.large (3 nodes)
    - Cost: ~$300/month

  ALB:
    - Cost: ~$25/month

  CloudFront:
    - Data Transfer: Variable
    - Cost: ~$10-50/month

  S3:
    - Storage: 100GB
    - Requests: 1M/month
    - Cost: ~$25/month

  Lambda:
    - Executions: 1M/month
    - Duration: 500ms average
    - Cost: ~$20/month

Total_Estimated_Cost: $1,230-1,850/month
```

### 2. Cost Optimization Strategies

```yaml
Optimization_Strategies:
  Compute:
    - Use Fargate Spot for non-critical workloads (50-70% savings)
    - Implement auto-scaling based on metrics
    - Use smaller instances during off-peak hours

  Storage:
    - Use S3 Intelligent Tiering for file storage
    - Implement lifecycle policies for old data
    - Use GP3 storage for better price/performance

  Database:
    - Use read replicas for read-heavy workloads
    - Implement connection pooling
    - Schedule non-critical tasks during off-peak hours

  Networking:
    - Use CloudFront for static content caching
    - Optimize data transfer between services
    - Use VPC endpoints for AWS service communication
```

This comprehensive AWS architecture overview shows how all systems interact in a production cloud environment, providing scalability, reliability, and security for your personalized learning platform.