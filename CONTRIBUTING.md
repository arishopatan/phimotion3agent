# 🤝 Contributing to PhiMotion3Agent

Thank you for your interest in contributing to PhiMotion3Agent! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- GitHub account

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/phimotion3agent.git
   cd phimotion3agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Contributing Guidelines

### Issue Reporting

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the appropriate template** (Bug Report or Feature Request)
3. **Provide detailed information** following the template structure
4. **Include screenshots** if applicable
5. **Test on the latest version** before reporting

### Feature Requests

When requesting features:

1. **Describe the problem** you're trying to solve
2. **Explain your proposed solution**
3. **Provide use cases** and examples
4. **Consider implementation complexity**
5. **Check if it aligns** with project goals

### Bug Reports

When reporting bugs:

1. **Provide clear steps** to reproduce
2. **Include environment details** (OS, browser, version)
3. **Share error messages** and logs
4. **Test on different browsers** if applicable
5. **Include screenshots** or screen recordings

## 🎨 Code Style

### TypeScript Guidelines

- **Use TypeScript** for all new code
- **Define proper types** for all functions and variables
- **Use interfaces** for object shapes
- **Avoid `any`** - use proper typing
- **Use enums** for constants

### React Guidelines

- **Use functional components** with hooks
- **Follow naming conventions** (PascalCase for components)
- **Use proper prop types** and interfaces
- **Implement error boundaries** where appropriate
- **Use React.memo** for performance optimization

### CSS/Styling Guidelines

- **Use Tailwind CSS** for styling
- **Follow utility-first approach**
- **Use CSS variables** for theming
- **Ensure responsive design**
- **Maintain accessibility standards**

### File Organization

```
src/
├── app/                    # Next.js App Router
├── components/             # Reusable UI components
│   ├── ui/                # shadcn/ui components
│   └── [feature]/         # Feature-specific components
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
├── types/                 # TypeScript type definitions
├── constants/             # Application constants
├── services/              # API and external services
└── styles/                # Global styles
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=ComponentName
```

### Writing Tests

- **Test component behavior** not implementation
- **Use meaningful test descriptions**
- **Test edge cases** and error scenarios
- **Mock external dependencies**
- **Maintain good test coverage**

### Test Structure

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interactions', () => {
    // Test user interactions
  });

  it('should handle error states', () => {
    // Test error scenarios
  });
});
```

## 🔄 Pull Request Process

### Before Submitting

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow code style guidelines
   - Add tests for new functionality
   - Update documentation

3. **Test your changes**
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

### Pull Request Guidelines

1. **Use the PR template** and fill all sections
2. **Link related issues** using keywords
3. **Provide clear description** of changes
4. **Include screenshots** for UI changes
5. **Ensure all checks pass**
6. **Request reviews** from maintainers

## 🚀 Release Process

### Version Management

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Create release branch**
   ```bash
   git checkout -b release/v1.0.0
   ```

2. **Update version**
   ```bash
   npm version patch|minor|major
   ```

3. **Update changelog**
   - Document all changes
   - Include breaking changes
   - List new features

4. **Create pull request**
   - Merge to main branch
   - Create GitHub release
   - Tag the release

## 🏷️ Labels and Milestones

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `priority: high`: High priority issues
- `priority: low`: Low priority issues

### Pull Request Labels

- `ready for review`: Ready for code review
- `work in progress`: Still being developed
- `needs review`: Requires review from maintainers
- `approved`: Approved for merge
- `blocked`: Blocked by other issues

## 📞 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check the [README.md](README.md) first

## 🎉 Recognition

Contributors will be recognized in:

- [Contributors list](https://github.com/arishopatan/phimotion3agent/graphs/contributors)
- [Release notes](https://github.com/arishopatan/phimotion3agent/releases)
- Project documentation

## 📄 License

By contributing to PhiMotion3Agent, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing to PhiMotion3Agent! 🚀
