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

}
