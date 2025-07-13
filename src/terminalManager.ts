import * as vscode from 'vscode';

import { exec } from 'child_process';
import { promisify } from 'util';

export interface NamedTerminal {
	terminal: vscode.Terminal;
	name: string;
	created: Date;
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

	constructor() {

	}

	public createTerminal(name: string, shellPath?: string, cwd?: string): NamedTerminal {
		const existingTerminal = this.getTerminal(name);
		if(existingTerminal){
			return existingTerminal;
		}
		
		const terminal = vscode.window.createTerminal({
			name: name,
			shellPath: shellPath,
			cwd: cwd
		});
		const namedTerminal: NamedTerminal = {
			terminal,
			name,
			created: new Date()
		};
		return namedTerminal;
	}

	public getTerminal(name: string): NamedTerminal | undefined {
		// Try to find in VS Code terminals
		const found = vscode.window.terminals.find(t => t.name === name);
		if (found) {
			const namedTerminal: NamedTerminal = {
				terminal: found,
				name,
				created: new Date(),
			};
			return namedTerminal;
		}
		return undefined;
	}

	public getAllTerminals(): NamedTerminal[] {
		const allVSCodeTerminals = vscode.window.terminals;

		const namedTerminals = allVSCodeTerminals.map(t => 
				({
					terminal: t,
					name: t.name,
					created: new Date(),
				}) as NamedTerminal
			);
		return namedTerminals;
	}

	public deleteTerminal(name: string): boolean {
		const namedTerminal = this.getTerminal(name);
		if (namedTerminal) {
			namedTerminal.terminal.dispose();
			return true;
		}
		return false;
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

	public sendCommandOrCreate(terminalName: string, command: string, shellPath?: string, cwd?: string): CommandResponse {
		let namedTerminal = this.getTerminal(terminalName);
		let created = false;
		if (!namedTerminal) {
			namedTerminal = this.createTerminal(terminalName, shellPath, cwd);
			created = true;
		}
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

}

export const terminalManager = new TerminalManager();