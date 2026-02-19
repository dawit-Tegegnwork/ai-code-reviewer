# Contributing to AI Code Reviewer

Thank you for your interest in contributing to AI Code Reviewer!

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)

---

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct.

- Be respectful and inclusive
- Focus on constructive feedback
- Collaborate openly and honestly

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL
- Redis

### Setup

```bash
# Clone the repository
git clone https://github.com/dawit-Tegegnwork/ai-code-reviewer.git
cd ai-code-reviewer

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start services
docker-compose up -d

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

---

## 🔄 Development Workflow

### 1. Branching

Create a new branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `perf/` - Performance improvements

### 2. Making Changes

```bash
# Make your changes
# ...

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

### 3. Committing

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add support for Python code review"
git commit -m "fix: resolve timeout issue with OpenAI API"
git commit -m "docs: update API documentation"
```

### 4. Pushing

```bash
git push origin feature/your-feature-name
```

---

## 📥 Pull Request Process

### Before Submitting

- [ ] Code passes all tests
- [ ] Code is properly formatted
- [ ] Documentation is updated
- [ ] Comments are clear and helpful
- [ ] No console.log or debugging code

### PR Checklist

- [ ] Title follows conventional commits
- [ ] Description explains what and why
- [ ] Links to related issues
- [ ] Screenshots for UI changes
- [ ] Tests added/updated
- [ ] Documentation updated

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test this change?

## Screenshots
If applicable, add screenshots

## Checklist
- [ ] Tests pass
- [ ] Linter passes
- [ ] Documentation updated
```

---

## 📏 Coding Standards

### TypeScript

- Use strict mode
- Prefer `const` over `let`
- Use arrow functions for callbacks
- Avoid `any` type
- Add JSDoc comments for public APIs

### Code Style

- 2 space indentation
- Single quotes for strings
- Trailing commas
- Semicolons required
- Max line length: 100 chars

### Error Handling

```typescript
// Good
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  logger.error('Operation failed', { error });
  throw new AppError('Operation failed', 500);
}

// Bad
try {
  const result = await riskyOperation();
  return result;
} catch (e) {
  console.log(e);
}
```

---

## 🧪 Testing

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Code Review', () => {
  it('should review JavaScript code', async () => {
    const code = 'const x = 10;';
    const result = await reviewCode(code, 'javascript');
    expect(result.issues).toBeDefined();
  });
});
```

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage

# Integration tests
npm run test:integration
```

---

## 🐛 Reporting Bugs

Use the [issue tracker](https://github.com/dawit-Tegegnwork/ai-code-reviewer/issues) to report bugs.

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Logs/screenshots

---

## 💡 Feature Requests

We welcome feature requests! Please:

- Use the issue tracker
- Describe the use case
- Explain why it's valuable
- Consider proposing a solution

---

## 📧 Questions?

- Open an issue for questions
- Join our Discord community
- Email: support@ai-code-reviewer.com

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
