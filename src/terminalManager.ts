import * as vscode from 'vscode';
import { registerLanguageModelTools, terminalManager as toolsTerminalManager } from './languageModelTools';

export interface NamedTerminal {
	terminal: vscode.Terminal;
	name: string;
	created: Date;
}

export class TerminalManager {
	private namedTerminals: Map<string, NamedTerminal> = new Map();

	public createTerminal(name: string, shellPath?: string, cwd?: string): NamedTerminal {
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

		this.namedTerminals.set(name, namedTerminal);
		// Also register with the tools terminal manager for cross-module compatibility
		(toolsTerminalManager as any).namedTerminals?.set?.(name, namedTerminal);
		return namedTerminal;
	}

	public getTerminal(name: string): NamedTerminal | undefined {
		return this.namedTerminals.get(name);
	}

	public getAllTerminals(): NamedTerminal[] {
		return Array.from(this.namedTerminals.values());
	}

	public renameTerminal(oldName: string, newName: string): boolean {
		const namedTerminal = this.namedTerminals.get(oldName);
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
		const namedTerminal = this.namedTerminals.get(name);
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

	public sendCommand(terminalName: string, command: string): { success: boolean; message: string } {
		const namedTerminal = this.namedTerminals.get(terminalName);
		if (namedTerminal) {
			namedTerminal.terminal.sendText(command);
			namedTerminal.terminal.show();
			return { success: true, message: `Command sent to terminal '${terminalName}': ${command}` };
		}
		const availableTerminals = Array.from(this.namedTerminals.keys());
		return {
			success: false,
			message: `Terminal '${terminalName}' not found. Available terminals: ${availableTerminals.length > 0 ? availableTerminals.join(', ') : 'none'}`
		};
	}

	public cancelCommand(terminalName: string): boolean {
		const namedTerminal = this.namedTerminals.get(terminalName);
		if (namedTerminal) {
			// Send Ctrl+C to cancel the current command
			namedTerminal.terminal.sendText('\x03');
			namedTerminal.terminal.show();
			return true;
		}
		return false;
	}

	public async readTerminal(terminalName: string): Promise<string | null> {
		const namedTerminal = this.namedTerminals.get(terminalName);
		if (!namedTerminal) {
			return null;
		}
		namedTerminal.terminal.show();
		return `Terminal '${terminalName}' is now active. Note: VS Code's Terminal API does not provide direct access to terminal buffer content for security reasons. The terminal content cannot be programmatically read through the extension API.\n\nTo work around this limitation, you can:\n1. Use commands that output to files (e.g., 'command > output.txt')\n2. Copy terminal content manually\n3. Use terminal-based logging solutions\n\nTerminal: ${terminalName}\nCreated: ${namedTerminal.created.toLocaleString()}\nStatus: Active`;
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
