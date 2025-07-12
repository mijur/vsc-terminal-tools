#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read package.json
const packagePath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Get the version type from command line arguments
const versionType = process.argv[2] || 'patch'; // patch, minor, major

// Parse current version
const [major, minor, patch] = packageJson.version.split('.').map(Number);

// Calculate new version
let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`Version updated from ${major}.${minor}.${patch} to ${newVersion}`);

// Update CHANGELOG.md if it exists
const changelogPath = path.join(__dirname, '../CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  const today = new Date().toISOString().split('T')[0];
  
  const newChangelog = changelog.replace(
    '## [Unreleased]',
    `## [Unreleased]\n\n## [${newVersion}] - ${today}`
  );
  
  fs.writeFileSync(changelogPath, newChangelog);
  console.log(`CHANGELOG.md updated with version ${newVersion}`);
}
