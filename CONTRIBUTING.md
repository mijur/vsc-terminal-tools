# Contributing to Copilot Terminal Tools

Thank you for your interest in contributing to Copilot Terminal Tools! We welcome contributions from the community and appreciate your help in making this extension better.

## 🎯 How to Contribute

### 1. Find or Create an Issue

- Browse [existing issues](https://github.com/mijur/vsc-terminal-tools/issues) to find something that interests you
- Look for issues labeled `good first issue` or `help wanted` for beginner-friendly tasks
- If you have a new idea or found a bug, [create a new issue](https://github.com/mijur/vsc-terminal-tools/issues/new) first to discuss it

### 2. Claim an Issue

- Comment on the issue saying you'd like to work on it
- Wait for maintainer confirmation before starting work
- Issues will typically be assigned on a first-come, first-served basis

### 3. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/vsc-terminal-tools.git
cd vsc-terminal-tools

# Add the original repository as upstream
git remote add upstream https://github.com/mijur/vsc-terminal-tools.git
```

### 4. Set Up Development Environment

```bash
# Install dependencies
npm install

# Start development mode (watches for changes and recompiles)
npm run watch

# In VS Code, press F5 to launch Extension Development Host
```

### 5. Make Your Changes

- Create a new branch for your feature/fix: `git checkout -b feature/your-feature-name`
- Make your changes following our [coding standards](#coding-standards)
- Test your changes thoroughly
- Write or update tests if applicable

### 6. Test Your Changes

```bash
# Run tests
npm test

# Run tests in watch mode during development
npm run watch-tests

# Test the extension manually in the Extension Development Host
```

### 7. Submit a Pull Request

```bash
# Commit your changes
git add .
git commit -m "feat: add your feature description"

# Push to your fork
git push origin feature/your-feature-name
```

- Open a Pull Request from your fork to the main repository
- Fill out the PR template completely
- Link the issue you're addressing in the PR description

## 📋 Types of Contributions

### 🐛 Bug Fixes
- Fix existing functionality that isn't working as expected
- Include steps to reproduce the bug in your PR description

### ✨ New Features
- Add new tools or functionality
- Enhance existing tools with new capabilities
- Improve user experience

### 📚 Documentation
- Improve README, API docs, or code comments
- Add examples or tutorials
- Fix typos or clarify unclear sections

### 🧪 Testing
- Add missing test coverage
- Improve existing tests
- Add integration tests

### 🎨 Code Quality
- Refactor code for better maintainability
- Improve performance
- Fix linting issues

## 🔧 Development Guidelines

### Coding Standards

- **TypeScript**: Use TypeScript for all source code
- **Formatting**: Code is automatically formatted with Prettier
- **Linting**: Follow ESLint rules (run `npm run lint`)
- **Naming**: Use descriptive names for functions, variables, and files
- **Comments**: Add JSDoc comments for public APIs

### File Structure

```
src/
├── extension.ts           # Extension entry point
├── terminalManager.ts     # Core terminal management
├── languageModelTools.ts  # AI tool definitions
├── commands/              # VS Code commands
├── tools/                 # Individual tool implementations
└── types/                 # TypeScript type definitions
```

### Code Style

```typescript
// Use descriptive function names and JSDoc comments
/**
 * Creates a new named terminal with optional configuration
 * @param name - The name of the terminal
 * @param options - Optional terminal configuration
 * @returns Promise that resolves to the created terminal
 */
export async function createNamedTerminal(
  name: string, 
  options?: TerminalOptions
): Promise<NamedTerminal> {
  // Implementation here
}

// Use meaningful variable names
const terminalName = 'dev-server';
const commandToExecute = 'npm run dev';

// Prefer async/await over .then()
try {
  const result = await executeCommand(command);
  return result;
} catch (error) {
  logger.error('Command execution failed', error);
  throw error;
}
```

### Testing

- Write unit tests for new functions and classes
- Add integration tests for complex workflows
- Test both success and error scenarios
- Ensure tests are deterministic and don't depend on external state

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new terminal creation tool
fix: resolve terminal deletion race condition
docs: update README with new examples
test: add unit tests for command execution
refactor: improve error handling in terminal manager
```

## 🚀 Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-review of the code has been performed
- [ ] Tests have been added or updated
- [ ] Documentation has been updated if needed
- [ ] All tests pass locally
- [ ] No new linting errors

### PR Requirements

1. **Clear Description**: Explain what changes you made and why
2. **Issue Reference**: Link to the issue you're addressing
3. **Testing**: Describe how you tested your changes
4. **Breaking Changes**: Call out any breaking changes
5. **Screenshots**: Include screenshots for UI changes

### Review Process

1. Maintainers will review your PR within 2-5 business days
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Your contribution will be included in the next release

## 🤔 Need Help?

- **Questions about the codebase**: Ask in the issue you're working on
- **General questions**: Start a [GitHub Discussion](https://github.com/mijur/vsc-terminal-tools/discussions)
- **Bugs or problems**: Open a [new issue](https://github.com/mijur/vsc-terminal-tools/issues/new)

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code.

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**Thank you for contributing! 🎉**

Your contributions help make Copilot Terminal Tools better for everyone. We appreciate your time and effort!
