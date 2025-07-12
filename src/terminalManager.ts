import * as vscode from 'vscode';

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { terminalManager as toolsTerminalManager } from './languageModelTools';

export interface NamedTerminal {
	terminal: vscode.Terminal;
	name: string;
	created: Date;
	lastCommand?: string;
	lastOutput?: string;
	lastExecution?: Date;
}


export interface CommandResult {
	success: boolean;
	output: string;
	error?: string;
	exitCode: number;
	executionTime: number;
}

export interface CommandExecutionResponse {
	success: boolean;
	message: string;
	created: boolean;
	result?: CommandResult;
}

export interface CommandResponse {
	success: boolean;
	message: string;
	created: boolean;
}

const execAsync = promisify(exec);

export class TerminalManager {
	private namedTerminals: Map<string, NamedTerminal> = new Map();
	private tempDir: string;

	constructor() {
		// Create a temporary directory for storing command outputs
		// Only used for caching in getAllTerminals
		this.namedTerminals = new Map();
		this.tempDir = path.join(os.tmpdir(), 'vsc-terminal-tools');
		if (!fs.existsSync(this.tempDir)) {
			fs.mkdirSync(this.tempDir, { recursive: true });
		}
	}

	private async executeWithOutput(command: string, cwd?: string, shellPath?: string): Promise<CommandResult> {
		const startTime = Date.now();
		try {
			const options: any = {
				cwd: cwd || process.cwd(),
				timeout: 30000, // 30 second timeout
				maxBuffer: 1024 * 1024 * 10, // 10MB buffer
				encoding: 'utf8'
			};
			if (shellPath) {
				options.shell = shellPath;
			}
			const { stdout, stderr } = await execAsync(command, options);
			const executionTime = Date.now() - startTime;
			const stdoutStr = typeof stdout === 'string' ? stdout : stdout.toString();
			const stderrStr = typeof stderr === 'string' ? stderr : stderr.toString();
			return {
				success: true,
				output: stdoutStr.trim(),
				error: stderrStr.trim() || undefined,
				exitCode: 0,
				executionTime
			};
		} catch (error: any) {
			const executionTime = Date.now() - startTime;
			const stdoutStr = error.stdout ? (typeof error.stdout === 'string' ? error.stdout : error.stdout.toString()) : '';
			const stderrStr = error.stderr ? (typeof error.stderr === 'string' ? error.stderr : error.toString()) : error.message;
			return {
				success: false,
				output: stdoutStr.trim(),
				error: stderrStr.trim(),
				exitCode: error.code || 1,
				executionTime
			};
		}
	}

	public createTerminal(name: string, shellPath?: string, cwd?: string): NamedTerminal {
		const terminal = vscode.window.createTerminal({
			name: name,
			shellPath: shellPath,
			cwd: cwd
		});
		const namedTerminal: NamedTerminal = {
			terminal,
			name,
			created: new Date(),
			lastCommand: undefined,
			lastOutput: undefined,
			lastExecution: undefined
		};
		// Update cache
		this.namedTerminals.set(name, namedTerminal);
		// Also register with the tools terminal manager for cross-module compatibility
		(toolsTerminalManager as any).namedTerminals?.set?.(name, namedTerminal);
		return namedTerminal;
	}

	public getTerminal(name: string): NamedTerminal | undefined {
		// Always try to get the latest from VS Code workspace
		// If not found in cache, try to find in VS Code terminals
		let cached = this.namedTerminals.get(name);
		if (cached && vscode.window.terminals.find(t => t.name === name)) {
			return cached;
		}
		// Try to find in VS Code terminals
		const found = vscode.window.terminals.find(t => t.name === name);
		if (found) {
			const namedTerminal: NamedTerminal = {
				terminal: found,
				name,
				created: new Date(),
				lastCommand: undefined,
				lastOutput: undefined,
				lastExecution: undefined
			};
			this.namedTerminals.set(name, namedTerminal);
			return namedTerminal;
		}
		return undefined;
	}

	public getAllTerminals(): NamedTerminal[] {
		// Synchronize cache with VS Code workspace terminals
		const allVSCodeTerminals = vscode.window.terminals;
		// Remove any cached terminals that no longer exist
		for (const name of Array.from(this.namedTerminals.keys())) {
			if (!allVSCodeTerminals.find(t => t.name === name)) {
				this.namedTerminals.delete(name);
			}
		}
		// Add any new VS Code terminals to the cache
		for (const t of allVSCodeTerminals) {
			if (!this.namedTerminals.has(t.name)) {
				this.namedTerminals.set(t.name, {
					terminal: t,
					name: t.name,
					created: new Date(),
					lastCommand: undefined,
					lastOutput: undefined,
					lastExecution: undefined
				});
			}
		}
		return Array.from(this.namedTerminals.values());
	}

	public renameTerminal(oldName: string, newName: string): boolean {
		const namedTerminal = this.getTerminal(oldName);
		if (namedTerminal) {
			namedTerminal.name = newName;
			this.namedTerminals.delete(oldName);
			this.namedTerminals.set(newName, namedTerminal);
			// Also update in tools terminal manager
			const toolsManager = toolsTerminalManager as any;
			if (toolsManager.namedTerminals) {
				toolsManager.namedTerminals.delete(oldName);
				toolsManager.namedTerminals.set(newName, namedTerminal);
			}
			return true;
		}
		return false;
	}

	public deleteTerminal(name: string): boolean {
		const namedTerminal = this.getTerminal(name);
		if (namedTerminal) {
			namedTerminal.terminal.dispose();
			this.namedTerminals.delete(name);
			// Also remove from tools terminal manager
			const toolsManager = toolsTerminalManager as any;
			if (toolsManager.namedTerminals) {
				toolsManager.namedTerminals.delete(name);
			}
			return true;
		}
		return false;
	}

	public sendCommandOrCreate(terminalName: string, command: string, shellPath?: string, cwd?: string): CommandResponse {
		let namedTerminal = this.getTerminal(terminalName);
		let created = false;
		if (!namedTerminal) {
			// Create the terminal if it doesn't exist
			namedTerminal = this.createTerminal(terminalName, shellPath, cwd);
			created = true;
		}
		// Update command tracking
		namedTerminal.lastCommand = command;
		namedTerminal.lastExecution = new Date();
		namedTerminal.terminal.sendText(command);
		namedTerminal.terminal.show();
		const createdMessage = created ? ` (terminal created)` : '';
		return {
			success: true,
			message: `Command sent to terminal '${terminalName}': ${command}${createdMessage}`,
			created
		};
	}

	public async executeCommandWithOutput(terminalName: string, command: string, shellPath?: string, cwd?: string): Promise<CommandExecutionResponse> {
		let namedTerminal = this.getTerminal(terminalName);
		let created = false;
		if (!namedTerminal) {
			// Create the terminal if it doesn't exist
			namedTerminal = this.createTerminal(terminalName, shellPath, cwd);
			created = true;
		}
		try {
			// Execute command and capture output
			const result = await this.executeWithOutput(command, cwd, shellPath);
			// Update terminal tracking
			namedTerminal.lastCommand = command;
			namedTerminal.lastOutput = result.output;
			namedTerminal.lastExecution = new Date();
			// Also send to visual terminal for user visibility
			namedTerminal.terminal.sendText(command);
			namedTerminal.terminal.show();
			const createdMessage = created ? ` (terminal created)` : '';
			const executionMessage = `Command executed in terminal '${terminalName}': ${command}${createdMessage}`;
			return {
				success: true,
				message: executionMessage,
				created,
				result
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			return {
				success: false,
				message: `Failed to execute command in terminal '${terminalName}': ${errorMessage}`,
				created
			};
		}
	}

	public cancelCommand(terminalName: string): boolean {
		const namedTerminal = this.getTerminal(terminalName);
		if (namedTerminal) {
			// Send Ctrl+C to cancel the current command
			namedTerminal.terminal.sendText('\x03');
			namedTerminal.terminal.show();
			return true;
		}
		return false;
	}

	public async readTerminal(terminalName: string): Promise<string | null> {
		const namedTerminal = this.getTerminal(terminalName);
		if (!namedTerminal) {
			return null;
		}
		// Show the terminal
		namedTerminal.terminal.show();
		// If we have captured output from the last command, return it
		if (namedTerminal.lastOutput !== undefined) {
			const lastCommandInfo = namedTerminal.lastCommand ? `Last command: ${namedTerminal.lastCommand}\n` : '';
			const lastExecutionInfo = namedTerminal.lastExecution ? `Executed: ${namedTerminal.lastExecution.toLocaleString()}\n` : '';
			return `Terminal: ${terminalName}\nCreated: ${namedTerminal.created.toLocaleString()}\nStatus: Active\n\n${lastCommandInfo}${lastExecutionInfo}Last Captured Output:\n\\u00b6\u00b6\u00b6\n${namedTerminal.lastOutput}\n\\u00b6\u00b6\u00b6\n\nNote: This shows the output from the last command executed with output capture. For real-time terminal interaction, use the visual terminal that is now active.`;
		}
		// Return a message explaining the limitation
		return `Terminal '${terminalName}' is now active. \n\nTerminal: ${terminalName}\nCreated: ${namedTerminal.created.toLocaleString()}\nStatus: Active\nLast command: ${namedTerminal.lastCommand || 'None'}\n\nNote: VS Code's Terminal API does not provide direct access to terminal buffer content for security reasons. To capture command output, use the 'executeCommandWithOutput' tool or the 'sendCommandOrCreate' tool with captureOutput=true.\n\nTo work around this limitation, you can:\n1. Use the executeCommandWithOutput tool for commands you want to capture output from\n2. Use commands that output to files (e.g., 'command > output.txt')\n3. Copy terminal content manually\n4. Use terminal-based logging solutions`;
	}

	public cleanup(): void {
		for (const [name, namedTerminal] of this.namedTerminals) {
			if (namedTerminal.terminal.exitStatus !== undefined) {
				this.namedTerminals.delete(name);
				const toolsManager = toolsTerminalManager as any;
				if (toolsManager.namedTerminals) {
					toolsManager.namedTerminals.delete(name);
				}
			}
		}
	}
}

export const terminalManager = new TerminalManager();
