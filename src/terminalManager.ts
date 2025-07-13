import * as vscode from 'vscode';
import { CancelCommandResponse, CommandExecutionResponse, CommandResponse, CommandResult, NamedTerminal } from './types';

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
	
	public async cancelCommand(terminalName: string): Promise<CancelCommandResponse> {
		const namedTerminal = this.getTerminal(terminalName);
		if (namedTerminal) {
			// Send Ctrl+C to cancel the current command
			namedTerminal.terminal.show(true);
			if(!namedTerminal.terminal.shellIntegration) {
				namedTerminal.terminal.sendText('\x03');
				return {
					success:true, 
					cancelledCommand: `Shell integration is unsupported. Impossible to determine cancelled command. Sent cancel signal (Ctrl+C) to terminal '${terminalName}'.`
				};
			}else{
				const endPromise = new Promise<CancelCommandResponse>((resolve)=>{
					const disposable = vscode.window.onDidEndTerminalShellExecution(async (event) => {
						if(event.exitCode!==1 ||terminalName !== event.terminal.name){
							return;
						}
						const exitCode = event.exitCode ?? 1; // Default to 1 if exitCode is undefined
						resolve({success: exitCode===1, cancelledCommand: event.execution.commandLine.value});
						disposable.dispose(); // Clean up the event listener
					});
				});
				namedTerminal.terminal.shellIntegration.executeCommand('');
				var response = await endPromise;
				return response;
			}
		}
		return {success:false, cancelledCommand: `Terminal '${terminalName}' was not found.`};

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
			const startPromise = new Promise<string>((resolve)=>{
				const disposable = vscode.window.onDidStartTerminalShellExecution(async (event) => {
					if (event.terminal.name === terminal.name) {
						const stream = event.execution.read();
						let output = '';
					
						for await (const result of stream) {
							console.log(`Received output from terminal '${terminal.name}':`, result);
							output += result;
						}
						disposable.dispose(); // Clean up the event listener
						resolve(this.cleanAnsiEscapes(output));
					}
				});
			});
			
				
			const endPromise = new Promise<number>((resolve)=>{
				const disposable = vscode.window.onDidEndTerminalShellExecution(async (event) => {
					if( event.execution.commandLine.value !== command){
						return;
					}
					
					const exitCode = event.exitCode ?? 1; // Default to 1 if exitCode is undefined
					console.log(`Terminal '${terminal.name}' finished with exit code ${exitCode} in ${executionTime}ms`);
					resolve(exitCode);
					console.log(`Terminal '${terminal.name}' finished with exit code ${exitCode}`);
					disposable.dispose(); // Clean up the event listener
				});
			});
			
			const promises = Promise.all([
				startPromise,
				endPromise
			]);

			let execution=terminal.shellIntegration.executeCommand(command);
			if (!execution) {
				throw new Error('Shell integration failed to execute command');
			}
			const executionTime = Date.now() - startTime;
			const result = await promises;
			return {
				success: result[1] !== 1,
				output: result[0],
				error:  `Command failed with exit code ${ result[1] !== 1}`,
				exitCode: result[1],
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