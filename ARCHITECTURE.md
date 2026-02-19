# Architecture - AI Code Reviewer

## System Overview

AI Code Reviewer is an enterprise-grade system designed for high-performance code analysis with LLM integration and comprehensive security scanning.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Web UI     │  │   CLI Tool   │  │   API SDK    │       │
│  │  (React)     │  │   (Node)     │  │  (TS/JS)     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway (Fastify)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Rate Limit  │  │  Auth/JWT    │  │  Validation   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└───────────────────┬───────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌────────┐
   │  AI    │  │Security│  │ Report │
   │Engine  │  │Scanner │  │Engine  │
   └───┬────┘  └───┬────┘  └───┬────┘
       │           │           │
       ▼           ▼           ▼
   ┌──────────────────────────────┐
   │    Message Queue (BullMQ)    │
   └───────────┬──────────────────┘
               │
               ▼
   ┌──────────────────────────────┐
   │    Worker Pool              │
   │  ┌────────┐  ┌────────┐   │
   │  │ Worker │  │ Worker │   │
   │  │ 1-10   │  │ 11-20  │   │
   │  └────────┘  └────────┘   │
   └───────────┬────────────────┘
               │
       ┌───────┼────────┬────────┐
       ▼       ▼        ▼        ▼
   ┌────────┐┌───────┐┌───────┐┌───────┐
   │OpenAI  ││Claude ││Semgrep││ Snyk  │
   │ GPT-4  ││LLM    ││ Scan  ││Scan   │
   └────────┘└───────┘└───────┘└───────┘
               │
               ▼
   ┌──────────────────────────────┐
   │    PostgreSQL + Redis       │
   │    (Persistence & Cache)   │
   └──────────────────────────────┘
```

---

## Component Breakdown

### 1. API Gateway (Fastify)

**Responsibilities:**
- Request validation
- Authentication & authorization (JWT)
- Rate limiting (100 req/min per user)
- Request routing to services
- Response aggregation

**Key Endpoints:**
```typescript
POST /api/review          - Review code with AI
POST /api/scan/security   - Security vulnerability scan
GET  /api/analytics      - Code quality metrics
POST /api/webhook        - GitHub webhook handler
```

**Technology:**
- Fastify (high-performance web framework)
- JWT (authentication)
- BullMQ (job queue)
- Zod (schema validation)

---

### 2. AI Engine

**Responsibilities:**
- Code analysis using LLMs
- Context-aware suggestions
- Multi-model support (OpenAI, Claude)
- Prompt engineering for code review

**LLM Integration:**
```typescript
interface AIAnalysis {
  issues: Issue[];
  suggestions: string[];
  score: number;
  complexity: number;
}

async function analyzeCode(code: string, language: string): Promise<AIAnalysis> {
  const prompt = buildPrompt(code, language);
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }],
    temperature: 0.3,
  });
  return parseResponse(response);
}
```

**Prompt Strategy:**
1. **System Prompt**: Define role and review standards
2. **Code Context**: Include relevant files and docstrings
3. **Language-Specific Rules**: Tailored to each language
4. **Security Focus**: Prioritize vulnerability detection

---

### 3. Security Scanner

**Responsibilities:**
- SAST (Static Application Security Testing)
- Dependency vulnerability scanning
- Secret detection (API keys, passwords)
- OWASP Top 10 compliance

**Tools Integrated:**
- **Semgrep**: Custom rules for code patterns
- **Snyk**: Dependency vulnerability scanning
- **Trivy**: Container security
- **Gitleaks**: Secret detection

**Workflow:**
```
1. Receive code → 2. Run Semgrep → 3. Scan dependencies
          ↓                    ↓                    ↓
    Identify patterns → Check vulnerabilities → Find secrets
          ↓                    ↓                    ↓
    4. Aggregate results → 5. Score severity → 6. Generate report
```

---

### 4. Worker Pool (BullMQ)

**Responsibilities:**
- Async job processing
- Concurrency control
- Job prioritization
- Retry logic with exponential backoff

**Job Types:**
```typescript
enum JobType {
  CODE_REVIEW = 'code_review',
  SECURITY_SCAN = 'security_scan',
  DEPENDENCY_CHECK = 'dependency_check',
  REPORT_GENERATION = 'report_generation'
}

interface ReviewJob {
  type: JobType.CODE_REVIEW;
  data: {
    code: string;
    language: string;
    options: ReviewOptions;
  };
  priority: number;  // Higher = more important
}
```

**Concurrency Strategy:**
- Standard reviews: 10 concurrent workers
- Priority reviews: 20 concurrent workers
- Bulk scans: 5 concurrent workers

---

### 5. Report Engine

**Responsibilities:**
- Aggregate review results
- Generate formatted reports (PDF, JSON, CSV)
- Track metrics over time
- Executive summary generation

**Report Types:**
- **Single File Review**: Detailed analysis per file
- **Project Scan**: Aggregate across entire codebase
- **Team Analytics**: Performance metrics by developer
- **Executive Summary**: High-level overview for stakeholders

---

## Data Flow

### Review Request Flow

```
1. Client submits code
   POST /api/review
   { code: "...", language: "typescript" }

2. API Gateway validates
   - Check JWT token
   - Validate rate limit
   - Sanitize input

3. Queue job in BullMQ
   { type: 'code_review', priority: 10 }

4. Worker picks up job
   - Acquire lock on code
   - Process with AI Engine
   - Run Security Scanner

5. Results aggregated
   - Combine AI insights
   - Add security findings
   - Calculate quality score

6. Cache result in Redis
   - TTL: 1 hour
   - Key: review:{hash(code)}

7. Return to client
   - Polling or WebSocket push
```

---

## Security Considerations

### 1. API Key Management
- Stored in environment variables
- Rotated every 90 days
- Separate keys per environment

### 2. Rate Limiting
- Per-user: 100 requests/minute
- Per-IP: 200 requests/minute
- Enterprise plans: Custom limits

### 3. Data Privacy
- Code not stored permanently
- Results cached for 1 hour
- Logs anonymized after 30 days

### 4. Input Sanitization
- Remove comments before analysis
- Strip sensitive data
- Limit code size to 100KB

---

## Scalability

### Horizontal Scaling
- API Gateway: Stateless, can scale to 100+ instances
- Worker Pool: Can scale independently
- Database: Read replicas for queries

### Performance Targets
- **Latency**: < 2 seconds per review (P95)
- **Throughput**: 1000+ reviews/minute
- **Concurrent Users**: 10,000+

### Caching Strategy
- **Redis**: Review results (1 hour TTL)
- **CDN**: Static assets (1 week TTL)
- **Database**: Query results (5 minute TTL)

---

## Monitoring

### Metrics Collected
- Request latency (P50, P95, P99)
- Error rate by endpoint
- Worker queue depth
- LLM API call costs
- Database query performance

### Alerts Configured
- Error rate > 5%
- Queue depth > 1000
- API latency > 5s
- Database connection pool exhausted

---

## Deployment

### Infrastructure
- **Cloud**: AWS
- **Compute**: ECS Fargate (serverless containers)
- **Database**: RDS PostgreSQL
- **Cache**: ElastiCache Redis
- **Queue**: Managed RabbitMQ or self-hosted Redis

### CI/CD Pipeline
1. Code push → GitHub
2. Run tests → Jest + Vitest
3. Build Docker image
4. Push to ECR
5. Deploy to ECS (blue-green)

---

## Future Enhancements

- [ ] Support for more languages (Rust, Swift, Kotlin)
- [ ] Custom rule engine for enterprise clients
- [ ] IDE plugins (VS Code, IntelliJ)
- [ ] Real-time collaborative review
- [ ] Code similarity detection (plagiarism)
- [ ] Performance profiling integration
- [ ] Multi-tenant architecture

---

**Last Updated:** 2026-02-19
