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
			description: 'Create a new named terminal',
			schema: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						description: 'Name for the new terminal'
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
			name: 'sendCommandOrCreate',
			description: 'Send a command to a named terminal, creating it if it doesn\'t exist',
			schema: {
				type: 'object',
				properties: {
					terminalName: {
						type: 'string',
						description: 'Name of the terminal to send command to (will be created if it doesn\'t exist)'
					},
					command: {
						type: 'string',
						description: 'Command to execute in the terminal'
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
		} else {
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

You can access these through the Command Palette (Ctrl+Shift+P) or by asking me directly!`);
		}

		return { metadata: { command: '' } };
	}
}
