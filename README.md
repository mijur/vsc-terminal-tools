# Copilot Terminal Tools

A VS Code extension that provides intelligent terminal management for GitHub Copilot and AI assistants. The primary benefit is **preventing terminal spawning chaos** - instead of creating new terminals for every command, this extension allows AI agents to reuse named terminals, maintaining clean workspace organization and process continuity.

## 🎯 Key Benefits

- **Prevents Terminal Spam**: Stop AI agents from creating dozens of disposable terminals
- **Organized Workflow**: Group related commands in appropriately named terminals
- **Process Continuity**: Maintain context between commands in the same terminal
- **Resource Efficiency**: Reuse terminals instead of spawning new processes
- **Better Debugging**: Named terminals make it easy to track command history and output

## 🚀 Features

### Core Functionality

- **Named Terminal Management**: Create, list, and delete terminals with meaningful names
- **Smart Command Execution**: Send commands to existing terminals or create them automatically
- **Output Capture**: Execute commands and capture their output, errors, and execution details
- **Process Control**: Cancel running commands with proper signal handling
- **GitHub Copilot Integration**: Provides language model tools for AI-driven development

### Available Tools

| Tool | Description | Use Case |
|------|-------------|----------|
| `listTerminals` | List all named terminals with status | Check existing terminals before creating new ones |
| `createTerminal` | Create a new named terminal | Set up dedicated terminals for specific purposes |
| `sendCommand` | Send command to terminal (create if needed) | **Primary tool** for command execution |
| `executeCommandWithOutput` | Execute command and capture output | Get command results for processing |
| `deleteTerminal` | Remove a named terminal | Clean up when terminals are no longer needed |
| `cancelCommand` | Send Ctrl+C to interrupt commands | Stop long-running or stuck processes |

## 📋 Recommended Terminal Names

Organize your development workflow with these suggested terminal names:

- **`dev-server`** - Development servers (`npm run dev`, `python manage.py runserver`, `cargo run`)
- **`build`** - Build operations (`npm run build`, `cargo build`, `dotnet build`)
- **`test`** - Testing commands (`npm test`, `pytest`, `cargo test`)
- **`package-manager`** - Dependencies (`npm install`, `pip install`, `cargo add`)
- **`git`** - Version control operations
- **`docker`** - Container management
- **`database`** - Database operations
- **`cloud`** - Cloud CLI commands
- **`general`** - File operations and utilities
- **`scripts`** - Automation and custom scripts

## 🛠️ Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Copilot Terminal Tools"
4. Click Install

### Manual Installation
1. Download the latest `.vsix` file from [releases](https://github.com/mijur/vsc-terminal-tools/releases)
2. In VS Code: `Ctrl+Shift+P` → "Extensions: Install from VSIX..."
3. Select the downloaded file

## 💡 Usage Examples

### With GitHub Copilot Chat

Instead of Copilot creating multiple terminals:
```
❌ Before: "run npm install" → Creates Terminal 1
❌ Before: "start dev server" → Creates Terminal 2  
❌ Before: "run tests" → Creates Terminal 3
```

With this extension:
```
✅ After: Commands go to organized, named terminals
📁 package-manager: npm install, npm update
🖥️ dev-server: npm run dev (keeps running)
🧪 test: npm test, npm run test:watch
```

### Manual Commands

Use the Command Palette (`Ctrl+Shift+P`):

- **Terminal Tools: List Named Terminals** - See all your named terminals
- **Terminal Tools: Create Named Terminal** - Create a new terminal with a specific name
- **Terminal Tools: Send Command to Terminal** - Execute commands in named terminals
- **Terminal Tools: Delete Terminal** - Clean up unused terminals
- **Terminal Tools: Cancel Command** - Stop running processes

## ⚙️ Configuration

The extension works out of the box with no configuration required. When using the tools:

- **Terminal Name**: Choose descriptive names that match your workflow
- **Working Directory**: Optionally specify where commands should run
- **Shell Path**: Use custom shells if needed (defaults to system shell)

## 🔄 How It Works

1. **AI Request**: Copilot or other AI wants to run a command
2. **Tool Selection**: Extension provides the `sendCommand` tool instead of generic terminal access
3. **Terminal Resolution**: 
   - If named terminal exists → Use it
   - If not → Create it automatically
4. **Command Execution**: Run the command in the appropriate terminal
5. **Output Handling**: Capture and return results to the AI

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to contribute to this project.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/mijur/vsc-terminal-tools.git
cd vsc-terminal-tools

# Install dependencies
npm install

# Start development
npm run watch
```

### Testing

```bash
# Run tests
npm test

# Watch mode for development
npm run watch-tests
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/mijur/vsc-terminal-tools/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/mijur/vsc-terminal-tools/discussions)
- **Documentation**: [Wiki](https://github.com/mijur/vsc-terminal-tools/wiki)

## 🔗 Related

- [GitHub Copilot](https://copilot.github.com/) - AI pair programmer
- [VS Code API](https://code.visualstudio.com/api) - Extension development docs

---

**Made with ❤️ for developers who want organized, efficient AI-assisted workflows**