import * as vscode from 'vscode';

export interface TerminalTool {
	name: string;
	description: string;
	schema: any;
	handler: (parameters: any) => Promise<string>;
}

export class TerminalToolsParticipant {
	private tools: TerminalTool[] = [];

	constructor() {
		this.registerTools();
	}

	private registerTools() {
		// Tool: List Terminals
		this.tools.push({
			name: 'listTerminals',
			description: 'List all named terminals with their creation dates',
			schema: {
				type: 'object',
				properties: {},
				required: []
			},
			handler: async () => {
				await vscode.commands.executeCommand('terminal-tools.listTerminals');
				return 'Listed all named terminals';
			}
		});

		// Tool: Create Terminal
		this.tools.push({
			name: 'createTerminal',
			description: 'Create a new named terminal. Use descriptive names like: dev-server, build, test, package-manager, git, docker, database, cloud, general, scripts',
			schema: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						description: 'Name for the new terminal. Use descriptive names that reflect the terminal\'s purpose (e.g., dev-server, build, test, package-manager, git, docker, database, cloud, general, scripts)'
					}
				},
				required: ['name']
			},
			handler: async (params: { name: string }) => {
				// Use the commands directly for tool integration
				try {
					await vscode.commands.executeCommand('terminal-tools.createTerminal');
					return `Created terminal: ${params.name}`;
				} catch (error) {
					return `Failed to create terminal: ${error}`;
				}
			}
		});

		// Tool: Send Command or Create
		this.tools.push({
			name: 'sendCommand',
			description: 'Send a command to a named terminal, creating it if it doesn\'t exist. This is the PRIMARY tool for command execution. Use named terminals like: dev-server, build, test, package-manager, git, docker, database, cloud, general, scripts.',
			schema: {
				type: 'object',
				properties: {
					terminalName: {
						type: 'string',
						description: 'Name of the terminal to send command to (will be created if it doesn\'t exist). Use descriptive names like: dev-server, build, test, package-manager, git, docker, database, cloud, general, scripts'
					},
					command: {
						type: 'string',
						description: 'Command to execute in the terminal. Use platform-appropriate commands (PowerShell for Windows, bash/zsh for Unix-like systems)'
					},
					cwd: {
						type: 'string',
						description: 'Working directory for the terminal if it needs to be created (optional)'
					},
					shellPath: {
						type: 'string',
						description: 'Path to the shell executable if the terminal needs to be created (optional)'
					}
				},
				required: ['terminalName', 'command']
			},
			handler: async (params: { terminalName: string; command: string; cwd?: string; shellPath?: string }) => {
				try {
					await vscode.commands.executeCommand('terminal-tools.sendCommand');
					return `Sent command "${params.command}" to terminal "${params.terminalName}"`;
				} catch (error) {
					return `Failed to send command: ${error}`;
				}
			}
		});

		// Tool: Read Terminal
		this.tools.push({
			name: 'readTerminal',
			description: 'Read and return the visible output from a named terminal. Note: VS Code\'s Terminal API has limitations and may not capture all terminal content.',
			schema: {
				type: 'object',
				properties: {
					terminalName: {
						type: 'string',
						description: 'Name of the terminal to read output from'
					}
				},
				required: ['terminalName']
			},
			handler: async (params: { terminalName: string }) => {
				try {
					await vscode.commands.executeCommand('terminal-tools.readTerminal');
					return `Read output from terminal: ${params.terminalName}`;
				} catch (error) {
					return `Failed to read terminal output: ${error}`;
				}
			}
		});

		// Tool: Rename Terminal
		this.tools.push({
			name: 'renameTerminal',
			description: 'Rename an existing terminal',
			schema: {
				type: 'object',
				properties: {
					oldName: {
						type: 'string',
						description: 'Current name of the terminal'
					},
					newName: {
						type: 'string',
						description: 'New name for the terminal'
					}
				},
				required: ['oldName', 'newName']
			},
			handler: async (params: { oldName: string; newName: string }) => {
				try {
					await vscode.commands.executeCommand('terminal-tools.renameTerminal');
					return `Renamed terminal from "${params.oldName}" to "${params.newName}"`;
				} catch (error) {
					return `Failed to rename terminal: ${error}`;
				}
			}
		});

		// Tool: Delete Terminal
		this.tools.push({
			name: 'deleteTerminal',
			description: 'Delete a named terminal',
			schema: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						description: 'Name of the terminal to delete'
					}
				},
				required: ['name']
			},
			handler: async (params: { name: string }) => {
				try {
					await vscode.commands.executeCommand('terminal-tools.deleteTerminal');
					return `Deleted terminal: ${params.name}`;
				} catch (error) {
					return `Failed to delete terminal: ${error}`;
				}
			}
		});

		// Tool: Cancel Command
		this.tools.push({
			name: 'cancelCommand',
			description: 'Send a cancel signal (Ctrl+C) to interrupt any running command in a terminal',
			schema: {
				type: 'object',
				properties: {
					terminalName: {
						type: 'string',
						description: 'Name of the terminal to send the cancel signal to'
					}
				},
				required: ['terminalName']
			},
			handler: async (params: { terminalName: string }) => {
				try {
					await vscode.commands.executeCommand('terminal-tools.cancelCommand');
					return `Sent cancel signal to terminal: ${params.terminalName}`;
				} catch (error) {
					return `Failed to send cancel signal: ${error}`;
				}
			}
		});
	}

	public getTools(): TerminalTool[] {
		return this.tools;
	}

	public async handleRequest(
		request: vscode.ChatRequest,
		context: vscode.ChatContext,
		stream: vscode.ChatResponseStream,
		token: vscode.CancellationToken
	): Promise<vscode.ChatResult> {
		const prompt = request.prompt;
		
		// Parse the request to understand what the user wants
		if (prompt.includes('list') && prompt.includes('terminal')) {
			stream.markdown('Listing all named terminals...\n\n');
			await this.tools[0].handler({});
			stream.markdown('✅ Listed all named terminals');
		} else if (prompt.includes('create') && prompt.includes('terminal')) {
			const nameMatch = prompt.match(/create.*terminal.*["']([^"']+)["']/i) || 
			                 prompt.match(/terminal.*["']([^"']+)["']/i);
			const terminalName = nameMatch ? nameMatch[1] : 'new-terminal';
			
			stream.markdown(`Creating terminal: ${terminalName}...\n\n`);
			const result = await this.tools[1].handler({ name: terminalName });
			stream.markdown(`✅ ${result}`);
		} else if (prompt.includes('send') && prompt.includes('command')) {
			stream.markdown('Use the "Send Command to Terminal" command from the command palette to interactively select a terminal and enter a command.');
		} else if (prompt.includes('rename') && prompt.includes('terminal')) {
			stream.markdown('Use the "Rename Terminal" command from the command palette to interactively select and rename a terminal.');
		} else if (prompt.includes('delete') && prompt.includes('terminal')) {
			stream.markdown('Use the "Delete Terminal" command from the command palette to interactively select and delete a terminal.');
		} else if (prompt.includes('help') || prompt.includes('guide') || prompt.includes('best practices')) {
			this.showTerminalToolsGuide(stream);
		} else {
			this.showBasicHelp(stream);
		}

		return { metadata: { command: '' } };
	}

	private showBasicHelp(stream: vscode.ChatResponseStream) {
		stream.markdown(`## Terminal Tools Available Commands

I can help you manage named terminals in VS Code. Here are the available commands:

### Commands:
- **List Terminals**: \`Terminal Tools: List Named Terminals\`
- **Create Terminal**: \`Terminal Tools: Create Named Terminal\`
- **Rename Terminal**: \`Terminal Tools: Rename Terminal\`
- **Send Command**: \`Terminal Tools: Send Command to Terminal\`
- **Delete Terminal**: \`Terminal Tools: Delete Terminal\`

### Usage Examples:
- "List all terminals"
- "Create a terminal called 'my-server'"
- "Send command to terminal"
- "Rename a terminal"
- "Delete a terminal"

💡 **Tip**: Ask for "terminal tools guide" to see detailed best practices and recommended usage patterns!

You can access these through the Command Palette (Ctrl+Shift+P) or by asking me directly!`);
	}

	private showTerminalToolsGuide(stream: vscode.ChatResponseStream) {
		stream.markdown(`# Terminal Tools Extension Guide

## Overview
The Terminal Tools extension provides advanced terminal management through dedicated tools. **Always prefer using terminal tools over generic commands** for better process management and continuity.

## Available Tools
- **\`terminal-tools_createTerminal\`**: Creates a new terminal with a specified name
- **\`terminal-tools_sendCommand\`**: Sends a command to a named terminal (creates if needed) 
- **\`terminal-tools_readTerminal\`**: Reads output from a named terminal
- **\`terminal-tools_renameTerminal\`**: Renames an existing terminal
- **\`terminal-tools_deleteTerminal\`**: Deletes a named terminal
- **\`terminal-tools_cancelCommand\`**: Sends Ctrl+C to interrupt running commands

## Recommended Terminal Operation Flow
1. **Use named terminals for process continuity**: Create specific named terminals for each operation type
2. **Primary command tool**: Use \`terminal-tools_sendCommand\` - it creates terminals if needed then executes commands
3. **Monitor terminal state**: Use \`terminal-tools_readTerminal\` to check process status
4. **Clean up**: Use \`terminal-tools_cancelCommand\` and \`terminal-tools_deleteTerminal\` for cleanup

## Recommended Named Terminal Patterns

### Development Workflows
- **\`dev-server\`**: Development servers (\`npm run dev\`, \`python manage.py runserver\`, \`cargo run\`) - keep running
- **\`build\`**: Build operations (\`npm run build\`, \`cargo build\`, \`dotnet build\`) - reuse for all builds
- **\`test\`**: Testing operations (\`npm test\`, \`pytest\`, \`cargo test\`) - reuse for all testing

### Package Management
- **\`package-manager\`**: Dependency management:
  - Node.js: \`npm install\`, \`yarn add\`, \`pnpm install\`
  - Python: \`pip install\`, \`conda install\`, \`poetry install\`
  - Rust: \`cargo add\`, \`cargo update\`
  - .NET: \`dotnet add package\`, \`nuget install\`

### Version Control & Infrastructure
- **\`git\`**: Git operations (\`git add\`, \`git commit\`, \`git push\`, \`git pull\`)
- **\`docker\`**: Container operations (\`docker build\`, \`docker run\`, \`docker-compose up\`)
- **\`database\`**: Database operations (\`psql\`, \`mysql\`, \`mongo\`, \`sqlite3\`)
- **\`cloud\`**: Cloud CLI operations (\`aws\`, \`gcloud\`, \`az\`, \`kubectl\`)

### General Purpose
- **\`general\`**: File system operations and miscellaneous tasks
- **\`scripts\`**: Custom script execution and automation

## File Operations (RECOMMENDED)
Use terminal tools for file system operations with platform-appropriate commands:

### Windows PowerShell
- Delete: \`Remove-Item\`
- Move/Rename: \`Move-Item\`
- Directory listing: \`Get-ChildItem\`
- Create directory: \`New-Item -ItemType Directory\`

### Unix/Linux/macOS
- Delete: \`rm\`, \`rmdir\`
- Move/Rename: \`mv\`
- Directory listing: \`ls\`
- Create directory: \`mkdir\`

**Always use the \`general\` terminal for file operations unless a specific terminal is more appropriate.**

## Best Practices
1. **Terminal Naming**: Use descriptive, consistent names reflecting the terminal's purpose
2. **Command Organization**: Group related commands in appropriate named terminals
3. **Resource Management**: Clean up long-running processes when no longer needed
4. **Error Handling**: Use \`terminal-tools_readTerminal\` to monitor execution and handle errors
5. **Background Processes**: Use dedicated terminals for services that need continuous running

## Cross-Platform Considerations
- **Windows**: PowerShell (default), Command Prompt, Git Bash, WSL
- **macOS**: Zsh (default), Bash, Fish
- **Linux**: Bash (common), Zsh, Fish, Dash
- **Path Separators**: Windows uses \`\\\` or \`/\` (PowerShell accepts both), Unix-like uses \`/\`
- **Environment Variables**: Windows \`$env:VAR\` (PowerShell) or \`%VAR%\` (CMD), Unix-like \`$VAR\`

This approach ensures better process management, continuity, and organization compared to generic terminal commands!`);
	}
}
