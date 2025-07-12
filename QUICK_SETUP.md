# Quick Setup Guide for Continuous Deployment

## ⚡ Quick Start

### 1. Set up GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add this repository secret:
- `VSCE_PAT`: Your VS Code Marketplace Personal Access Token

### 2. Update Repository URLs
Edit `package.json` and update:
```json
{
  "repository": {
    "url": "https://github.com/YOUR_USERNAME/vsc-terminal-tools.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/vsc-terminal-tools/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/vsc-terminal-tools#readme"
}
```

### 3. Test the Setup
```bash
# Run tests locally
npm test

# Build the extension
npm run package

# Test version bumping
npm run version:patch
```

### 4. Create Your First Release

```bash
# Bump version and commit
npm run version:minor
git add .
git commit -m "chore: bump version to 0.1.0"
git push

# Create and push tag
git tag v0.1.0
git push origin v0.1.0
```

Then go to GitHub → Releases → Draft a new release → Choose tag `v0.1.0` → Publish

The extension will automatically be published to the VS Code Marketplace! 🚀

## 📋 Checklist
- [ ] GitHub secrets configured
- [ ] Repository URLs updated
- [ ] VS Code Marketplace publisher account created
- [ ] First release created
- [ ] Extension published successfully

## 🆘 Need Help?
See `DEPLOYMENT.md` for detailed instructions and troubleshooting.
