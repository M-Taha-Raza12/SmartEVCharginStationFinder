# Contributing to Smart EV Charging Station Finder

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/SmartEVCharginStationFinder.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit: `git commit -m 'Add some feature'`
7. Push: `git push origin feature/your-feature-name`
8. Open a Pull Request

## 📋 Development Setup

### Prerequisites
- .NET 10.0 SDK
- Node.js 18+
- Git

### Setup Steps

1. **Install dependencies:**
   ```bash
   # Backend
   cd src/EvCharging.Api
   dotnet restore

   # Frontend
   cd src/EvCharging.Web
   npm install
   ```

2. **Run the application:**
   ```bash
   # Backend (Terminal 1)
   cd src/EvCharging.Api
   dotnet run

   # Frontend (Terminal 2)
   cd src/EvCharging.Web
   npm run dev
   ```

## 🎯 Contribution Guidelines

### Code Style

**Backend (C#):**
- Follow Microsoft C# coding conventions
- Use meaningful variable and method names
- Add XML documentation comments for public APIs
- Keep methods small and focused

**Frontend (TypeScript/React):**
- Use functional components with hooks
- Follow React best practices
- Use TypeScript for type safety
- Keep components small and reusable

### Commit Messages

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example: `feat: add wallet top-up functionality`

### Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Update README.md** if adding new features
5. **Request review** from maintainers

### Testing

**Backend:**
```bash
cd src/EvCharging.Api
dotnet test
```

**Frontend:**
```bash
cd src/EvCharging.Web
npm test
```

## 🐛 Reporting Bugs

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, etc.)

## 💡 Suggesting Features

When suggesting features:
- Explain the use case
- Describe the expected behavior
- Provide examples if possible
- Consider implementation complexity

## 📝 Documentation

- Update README.md for user-facing changes
- Update API documentation for new endpoints
- Add inline comments for complex logic
- Update deployment guides if needed

## ✅ Code Review

All submissions require review. We use GitHub pull requests for this purpose.

Reviewers will check:
- Code quality and style
- Test coverage
- Documentation
- Performance implications
- Security considerations

## 🔒 Security

If you discover a security vulnerability:
- **DO NOT** open a public issue
- Email the maintainers directly
- Provide detailed information
- Allow time for a fix before disclosure

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Your contributions make this project better for everyone!

---

**Questions?** Open an issue or reach out to the maintainers.
