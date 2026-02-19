import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import rateLimit from '@fastify/rate-limit';
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
});

const fastify = Fastify({
  logger,
});

// Register plugins
await fastify.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
});

await fastify.register(helmet);

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Swagger documentation
await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'AI Code Reviewer API',
      description: 'Enterprise-grade AI-powered code review system',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
});

await fastify.register(swaggerUI, {
  routePrefix: '/docs',
});

// Health check
fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
}));

// Review endpoint
fastify.post('/api/review', {
  schema: {
    description: 'Review code using AI analysis',
    tags: ['Review'],
    body: {
      type: 'object',
      required: ['code', 'language'],
      properties: {
        code: { type: 'string', description: 'Code to review' },
        language: {
          type: 'string',
          enum: ['javascript', 'typescript', 'python', 'java', 'go', 'rust'],
          description: 'Programming language',
        },
        context: { type: 'string', description: 'Additional context' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          issues: { type: 'array', items: { type: 'object' } },
          suggestions: { type: 'array', items: { type: 'string' } },
          security: { type: 'array', items: { type: 'object' } },
          score: { type: 'number' },
        },
      },
    },
  },
}, async (request, reply) => {
  const { code, language, context } = request.body as any;

  // Simulate AI review (in production, integrate with OpenAI/Claude)
  const review = {
    issues: [
      {
        type: 'error',
        line: 1,
        message: 'Missing error handling',
        severity: 'high',
      },
    ],
    suggestions: [
      'Add try-catch blocks for error handling',
      'Consider using async/await for better readability',
      'Add input validation',
    ],
    security: [],
    score: 75,
  };

  return review;
});

// Security scan endpoint
fastify.post('/api/scan/security', {
  schema: {
    description: 'Security vulnerability scan',
    tags: ['Security'],
    body: {
      type: 'object',
      required: ['code'],
      properties: {
        code: { type: 'string' },
        language: { type: 'string' },
      },
    },
  },
}, async (request, reply) => {
  const { code, language } = request.body as any;

  // Simulate security scan
  const scanResults = {
    vulnerabilities: [],
    secrets: [],
    dependencies: [],
    score: 100,
    recommendations: [],
  };

  return scanResults;
});

// Analytics endpoint
fastify.get('/api/analytics/code-quality', {
  schema: {
    description: 'Code quality metrics',
    tags: ['Analytics'],
    querystring: {
      type: 'object',
      properties: {
        timeframe: { type: 'string', enum: ['7d', '30d', '90d'] },
      },
    },
  },
}, async () => {
  return {
    averageQualityScore: 85,
    totalReviews: 1250,
    issuesFixed: 342,
    securityFindings: 28,
    trends: {
      quality: [80, 82, 83, 85, 86],
      security: [90, 92, 94, 95, 96],
    },
  };
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    await fastify.listen({ port, host: '0.0.0.0' });
    logger.info(`🚀 Server running on port ${port}`);
    logger.info(`📚 Docs available at http://localhost:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
