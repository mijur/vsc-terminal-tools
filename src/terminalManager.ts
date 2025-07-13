import * as vscode from 'vscode';
import { CommandExecutionResponse, CommandResponse, CommandResult, NamedTerminal } from './types';

export class TerminalManager {

	constructor() {
	}

	public getOrCreateTerminal(name: string, shellPath?: string, workingDirectory?: string): NamedTerminal {
		const existingTerminal = this.getTerminal(name);
		if(existingTerminal){
			return existingTerminal;
		}
		
		const terminal = vscode.window.createTerminal({
			name: name,
			shellPath: shellPath,
			cwd: workingDirectory
		});
		
		const namedTerminal: NamedTerminal = {
			terminal,
			name,
		};
		terminal.show(true);
		return namedTerminal;
	}

	public getTerminal(name: string): NamedTerminal | undefined {
		const found = vscode.window.terminals.find(t => t.name === name);
		if (found) {
			const namedTerminal: NamedTerminal = {
				terminal: found,
				name,
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
	
	public async cancelCommand(terminalName: string): Promise<boolean> {
		const namedTerminal = this.getTerminal(terminalName);
		if (namedTerminal) {
			// Send Ctrl+C to cancel the current command
			namedTerminal.terminal.show(true);
			if(!namedTerminal.terminal.shellIntegration) {
				namedTerminal.terminal.sendText('\x03');
			}else{
				const res = namedTerminal.terminal.shellIntegration?.executeCommand('\x03'); // Ensure shell integration is used if available
				const stream = res.read();
				for await (const data of stream) {
					console.log(data);
				}
			}
			return true;
		}
		return false;
	}

	public sendCommand(terminalName: string, command: string, shellPath?: string, workingDirectory?: string): CommandResponse {
		const namedTerminal = this.getOrCreateTerminal(terminalName, shellPath, workingDirectory);

		namedTerminal.terminal.sendText(command);

		return {
			success: true,
			message: `Command sent to terminal '${terminalName}': ${command}$`,
		};
	}

	public async executeCommandWithOutput(terminalName: string, command: string, shellPath?: string, workingDirectory?: string): Promise<CommandExecutionResponse> {
		let namedTerminal = this.getOrCreateTerminal(terminalName,shellPath, workingDirectory);
		
		try {
			// Execute command in the actual VS Code terminal and capture output
			const result = await this.executeInTerminalWithOutput(namedTerminal.terminal, command);
			const executionMessage = `Command executed in terminal '${terminalName}': ${command}`;
			return {
				success: result.success,
				message: executionMessage,
				result
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			return {
				success: false,
				message: `Failed to execute command in terminal '${terminalName}': ${errorMessage}`,
			};
		}
	}

	private async executeInTerminalWithOutput(terminal: vscode.Terminal, command: string): Promise<CommandResult> {
		const startTime = Date.now();
		
		// Check if shell integration is available
		if (!terminal.shellIntegration) {
			// Fallback: send command without output capture
			terminal.sendText(command);
			return {
				success: true,
				output: 'Command sent to terminal (shell integration not available - output capture disabled)',
				error: undefined,
				exitCode: 0,
				executionTime: Date.now() - startTime
			};
		}

		try {
			// Execute command using shell integration
			const execution = terminal.shellIntegration.executeCommand(command);
			
			// Create a stream to read the output
			const stream = execution.read();
			let output = '';
			
			// Set up a promise to wait for the command to complete
			const executionPromise = new Promise<{ exitCode: number | undefined }>((resolve) => {
				const disposable = vscode.window.onDidEndTerminalShellExecution(event => {
					if (event.execution === execution) {
						disposable.dispose();
						resolve({ exitCode: event.exitCode });
					}
				});
			});
			
			// Read all output from the stream
			for await (const data of stream) {
				
				output += data;
			}
			
			// Wait for the command to complete and get exit code
			const result = await executionPromise;
			const exitCode = result.exitCode ?? 1; // Default to error if undefined
			const executionTime = Date.now() - startTime;
			
			// Clean up output (remove ANSI escape sequences for cleaner text)
			const cleanOutput = this.cleanAnsiEscapes(output);
			
			return {
				success: exitCode === 0,
				output: cleanOutput.trim(),
				error: exitCode !== 0 ? `Command failed with exit code ${exitCode}` : undefined,
				exitCode: exitCode,
				executionTime
			};
		} catch (error: any) {
			const executionTime = Date.now() - startTime;
			// If shell integration fails, fall back to sendText
			terminal.sendText(command);
			return {
				success: false,
				output: '',
				error: `Shell integration failed: ${error.message || error}. Command sent to terminal without output capture.`,
				exitCode: 1,
				executionTime
			};
		}
	}

	private cleanAnsiEscapes(text: string): string {
		// Remove ANSI escape sequences to clean up the output
		return text.replace(/\x1b\[[0-9;]*[mGKHF]/g, '');
	}

}

export const terminalManager = new TerminalManager();