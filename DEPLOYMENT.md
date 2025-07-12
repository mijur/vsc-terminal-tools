# Continuous Deployment Setup

This project is configured with a comprehensive continuous deployment pipeline using GitHub Actions. The setup includes automated testing, building, and publishing to both the VS Code Marketplace and Open VSX Registry.

## 🚀 Deployment Workflows

### 1. Continuous Integration (CI)
**File:** `.github/workflows/ci.yml`
**Triggers:** Push to `main`/`develop` branches, Pull Requests to `main`

**Jobs:**
- **Test**: Runs tests on Windows, macOS, and Ubuntu
- **Lint**: Code quality checks and TypeScript type checking
- **Build**: Creates production build and uploads artifacts

### 2. Release
**File:** `.github/workflows/release.yml`
**Triggers:** Published GitHub releases

**Actions:**
- Extracts version from release tag
- Updates `package.json` version
- Creates VSIX package
- Uploads VSIX to GitHub release
- Publishes to VS Code Marketplace

### 3. Pre-release
**File:** `.github/workflows/pre-release.yml`
**Triggers:** Push to `main` branch (excluding documentation changes)

**Actions:**
- Creates timestamped pre-release versions
- Generates VSIX packages for testing
- Creates GitHub pre-releases automatically

## 🔧 Setup Instructions

### 1. GitHub Repository Secrets

You need to configure the following secrets in your GitHub repository settings:

#### VS Code Marketplace Publishing
```
VSCE_PAT = your_vscode_marketplace_personal_access_token
```

To get your VS Code Marketplace PAT:
1. Go to [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. Create a new Personal Access Token
3. Give it the "Marketplace (publish)" scope

### 2. Repository Configuration

Update the following in `package.json`:
- `publisher`: Your VS Code Marketplace publisher name
- `repository.url`: Your actual GitHub repository URL
- `bugs.url`: Your GitHub issues URL
- `homepage`: Your project homepage URL

### 3. Branch Protection

Configure branch protection rules for the `main` branch:
- Require status checks (CI workflow)
- Require up-to-date branches
- Require linear history (optional)

## 📦 Release Process

### Automated Release (Recommended)

1. **Create a Release**:
   ```bash
   # Update version (patch/minor/major)
   npm run version:patch
   
   # Commit changes
   git add .
   git commit -m "chore: bump version to x.x.x"
   git push
   
   # Create and push tag
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Create GitHub Release**:
   - Go to GitHub → Releases → Create new release
   - Choose the tag you just created
   - Fill in release notes
   - Publish the release

3. **Automatic Actions**:
   - Release workflow triggers automatically
   - Extension is built and packaged
   - VSIX is uploaded to the release
   - Extension is published to VS Code Marketplace

### Manual Release

```bash
# Build and package
npm run prepare-release

# Publish to VS Code Marketplace
npm run publish:marketplace
```

## 🔄 Version Management

### Automated Version Bumping
```bash
# Patch version (1.0.0 → 1.0.1)
npm run version:patch

# Minor version (1.0.0 → 1.1.0)
npm run version:minor

# Major version (1.0.0 → 2.0.0)
npm run version:major
```

### Pre-release Versions
Pre-release versions are automatically created on every push to `main`:
- Format: `1.0.0-pre.20240712123045`
- Available as GitHub pre-releases
- Useful for testing before official releases

## 📋 Quality Assurance

### Automated Checks
- **ESLint**: Code style and potential errors
- **TypeScript**: Type checking
- **Tests**: Unit and integration tests across platforms
- **Build**: Ensures extension can be packaged successfully

### Dependency Management
- **Dependabot**: Automatically updates dependencies weekly
- **Security**: Automated security vulnerability scanning

## 🎯 Best Practices

### Commit Messages
Use conventional commit format for better automation:
```
feat: add new terminal management feature
fix: resolve terminal creation issue
chore: update dependencies
docs: improve README documentation
ci: update GitHub Actions workflow
```

### Release Notes
When creating releases, include:
- New features
- Bug fixes
- Breaking changes
- Upgrade instructions

### Testing Pre-releases
1. Download VSIX from GitHub pre-release
2. Install manually: `code --install-extension extension.vsix`
3. Test functionality before creating official release

## 🚨 Troubleshooting

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are properly installed
- Review TypeScript compilation errors

### Publishing Issues
- Verify PAT tokens are valid and have correct permissions
- Check marketplace publisher settings
- Ensure extension manifest is valid

### Workflow Failures
- Review GitHub Actions logs
- Check repository secrets configuration
- Verify workflow file syntax

## 📚 Additional Resources

- [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
