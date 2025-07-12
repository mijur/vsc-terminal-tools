# Terminal Tools for GitHub Copilot

A VS Code extension that provides terminal management tools directly accessible to GitHub Copilot through natural language conversations.

## ✨ Key Features

- **🤖 GitHub Copilot Integration**: Language model tools that work automatically with Copilot chat
- **📱 Natural Language Interface**: Manage terminals through conversational commands  
- **⚡ Instant Access**: No need to remember specific commands or syntax
- **🔄 Seamless Workflow**: Create, manage, and execute commands in terminals without leaving chat

## 🛠️ Available Tools

When installed, GitHub Copilot automatically gains access to these terminal management tools:

| Tool | Description | Example Usage |
|------|-------------|---------------|
| **List Terminals** | Show all named terminals | "Show me my terminals" |
| **Create Terminal** | Create a new named terminal | "Create a terminal called 'dev-server'" |
| **Send Command** | Execute commands in terminals | "Run 'npm start' in the dev-server terminal" |
| **Rename Terminal** | Rename existing terminals | "Rename terminal 'old' to 'new'" |
| **Delete Terminal** | Remove unwanted terminals | "Delete the build terminal" |

## 🚀 Quick Start

1. **Install** the Terminal Tools extension
2. **Open** GitHub Copilot chat (`Ctrl+Shift+I` or `Cmd+Shift+I`)
3. **Talk naturally** about terminal tasks:

```
User: "I need to start a development server. Create a terminal called 'dev' and run npm start in it."

Copilot: I'll set that up for you right away!
✅ Created terminal 'dev'  
✅ Executed 'npm start' in terminal 'dev'

Your development server is now running in the 'dev' terminal.
```

## 📋 Example Conversations

### Setting Up a Development Environment
```
User: "Set up my workspace with terminals for frontend, backend, and testing"

Copilot: I'll create those terminals for you:
✅ Created terminal 'frontend'
✅ Created terminal 'backend' 
✅ Created terminal 'testing'

Your workspace is ready! You now have dedicated terminals for each part of your development workflow.
```

### Running Multiple Commands
```
User: "In the frontend terminal, install dependencies and start the dev server"

Copilot: I'll run those commands in sequence:
✅ Sent 'npm install' to terminal 'frontend'
✅ Sent 'npm run dev' to terminal 'frontend'

Your frontend development server should now be starting up.
```

### Terminal Cleanup
```
User: "Show me all my terminals and help me clean up old ones"

Copilot: Here are your current terminals:
- **frontend** (created: Dec 7, 2:30 PM)
- **old-build** (created: Dec 6, 10:15 AM) 
- **testing** (created: Dec 7, 1:45 PM)

The 'old-build' terminal looks outdated. Would you like me to remove it?
```

## 🎯 Why Use Terminal Tools?

### Before
```bash
# Manual process:
1. Ctrl+Shift+` to open terminal
2. Remember terminal naming conventions
3. Switch between multiple terminals
4. Type repetitive commands
5. Manage terminal lifecycle manually
```

### After  
```
# Natural conversation:
"Create a build terminal and run the production build process"
```

## 🔧 Advanced Usage

### Tool References in Prompts
You can explicitly reference tools using hashtags:

- `#listTerminals` - List all terminals
- `#createTerminal` - Create a new terminal  
- `#sendCommand` - Send command to terminal
- `#renameTerminal` - Rename a terminal
- `#deleteTerminal` - Delete a terminal

### Integration with Other Extensions
Terminal Tools works seamlessly with other Copilot-enabled extensions, allowing for complex workflows:

```
User: "Search the web for the latest Node.js install instructions, then create a terminal called 'setup' and install Node.js"

Copilot: [Uses web search tool] Based on the latest instructions, I'll set up Node.js for you:
✅ Created terminal 'setup'
✅ Executing Node.js installation commands...
```

## 🏗️ Technical Details

- **Extension Type**: Language Model Tools for VS Code
- **Copilot Integration**: Automatic tool discovery and registration
- **Supported Platforms**: Windows, macOS, Linux
- **VS Code Version**: 1.102.0+

## 📦 Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Terminal Tools"
4. Click Install
5. Tools automatically available in Copilot chat

## 🤝 Alternative Usage

Besides Copilot integration, the extension also provides:

- **Chat Participant**: `@terminal-tools` for direct interaction
- **Command Palette**: Traditional VS Code commands
- **Keyboard Shortcuts**: Configurable hotkeys

## Requirements

- VS Code version 1.102.0 or higher
- GitHub Copilot extension (for language model tools integration)

## Extension Settings

This extension does not contribute any settings.

## Known Issues

- Terminal names are not persisted across VS Code sessions
- Renaming terminals doesn't update the actual terminal tab name in VS Code

## Release Notes

### 0.0.1

Initial release with GitHub Copilot language model tools integration:
- Automatic tool registration with Copilot
- Natural language terminal management
- Create, list, rename, delete named terminals
- Send commands to specific terminals
- Chat participant for direct interaction

## Development

To run this extension in development:

1. Clone the repository
2. Run `npm install`
3. Press `F5` to open a new Extension Development Host window
4. Test the tools with GitHub Copilot chat

## Contributing

Feel free to submit issues and enhancement requests!

---

**Made with ❤️ for the VS Code and GitHub Copilot community**
