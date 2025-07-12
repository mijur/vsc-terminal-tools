// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TerminalToolsParticipant } from './chatParticipant';
import { registerLanguageModelTools, terminalManager as toolsTerminalManager } from './languageModelTools';

interface NamedTerminal {
	terminal: vscode.Terminal;
	name: string;
	created: Date;
}

class TerminalManager {
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

		// Note: VS Code's Terminal API doesn't provide direct access to terminal buffer content
		// This is a limitation of the API for security reasons
		// We can only show the terminal and inform that direct reading is not supported
		namedTerminal.terminal.show();
		
		// Return a message explaining the limitation
		return `Terminal '${terminalName}' is now active. Note: VS Code's Terminal API does not provide direct access to terminal buffer content for security reasons. The terminal content cannot be programmatically read through the extension API.

To work around this limitation, you can:
1. Use commands that output to files (e.g., 'command > output.txt')
2. Copy terminal content manually
3. Use terminal-based logging solutions

Terminal: ${terminalName}
Created: ${namedTerminal.created.toLocaleString()}
Status: Active`;
	}

	public cleanup(): void {
		// Clean up disposed terminals
		for (const [name, namedTerminal] of this.namedTerminals) {
			if (namedTerminal.terminal.exitStatus !== undefined) {
				this.namedTerminals.delete(name);
				// Also clean up from tools terminal manager
				const toolsManager = toolsTerminalManager as any;
				if (toolsManager.namedTerminals) {
					toolsManager.namedTerminals.delete(name);
				}
			}
		}
	}
}

const terminalManager = new TerminalManager();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Terminal Tools extension is now active!');

	// Register command to list terminals
	const listTerminalsCommand = vscode.commands.registerCommand('terminal-tools.listTerminals', () => {
		const terminals = terminalManager.getAllTerminals();
		if (terminals.length === 0) {
			vscode.window.showInformationMessage('No named terminals found.');
			return;
		}

		const terminalList = terminals.map(t => 
			`${t.name} (created: ${t.created.toLocaleString()})`
		).join('\n');

		vscode.window.showInformationMessage(`Named Terminals:\n${terminalList}`);
	});

	// Register command to create terminal
	const createTerminalCommand = vscode.commands.registerCommand('terminal-tools.createTerminal', async () => {
		const name = await vscode.window.showInputBox({
			prompt: 'Enter terminal name',
			placeHolder: 'my-terminal'
		});

		if (!name) {
			return;
		}

		if (terminalManager.getTerminal(name)) {
			vscode.window.showErrorMessage(`Terminal '${name}' already exists.`);
			return;
		}

		const namedTerminal = terminalManager.createTerminal(name);
		namedTerminal.terminal.show();
		vscode.window.showInformationMessage(`Created terminal: ${name}`);
	});

	// Register command to rename terminal
	const renameTerminalCommand = vscode.commands.registerCommand('terminal-tools.renameTerminal', async () => {
		const terminals = terminalManager.getAllTerminals();
		if (terminals.length === 0) {
			vscode.window.showErrorMessage('No named terminals to rename.');
			return;
		}

		const terminalNames = terminals.map(t => t.name);
		const selectedTerminal = await vscode.window.showQuickPick(terminalNames, {
			placeHolder: 'Select terminal to rename'
		});

		if (!selectedTerminal) {
			return;
		}

		const newName = await vscode.window.showInputBox({
			prompt: 'Enter new terminal name',
			value: selectedTerminal
		});

		if (!newName || newName === selectedTerminal) {
			return;
		}

		if (terminalManager.getTerminal(newName)) {
			vscode.window.showErrorMessage(`Terminal '${newName}' already exists.`);
			return;
		}

		if (terminalManager.renameTerminal(selectedTerminal, newName)) {
			vscode.window.showInformationMessage(`Renamed terminal from '${selectedTerminal}' to '${newName}'`);
		} else {
			vscode.window.showErrorMessage('Failed to rename terminal.');
		}
	});

	// Register command to send command to terminal
	const sendCommandCommand = vscode.commands.registerCommand('terminal-tools.sendCommand', async () => {
		const terminals = terminalManager.getAllTerminals();
		if (terminals.length === 0) {
			vscode.window.showErrorMessage('No named terminals available.');
			return;
		}

		const terminalNames = terminals.map(t => t.name);
		const selectedTerminal = await vscode.window.showQuickPick(terminalNames, {
			placeHolder: 'Select terminal to send command to'
		});

		if (!selectedTerminal) {
			return;
		}

		const command = await vscode.window.showInputBox({
			prompt: 'Enter command to send',
			placeHolder: 'ls -la'
		});

		if (!command) {
			return;
		}

		const result = terminalManager.sendCommand(selectedTerminal, command);
		if (result.success) {
			vscode.window.showInformationMessage(result.message);
		} else {
			vscode.window.showErrorMessage(result.message);
		}
	});

	// Register command to cancel command in terminal
	const cancelCommandCommand = vscode.commands.registerCommand('terminal-tools.cancelCommand', async () => {
		const terminals = terminalManager.getAllTerminals();
		if (terminals.length === 0) {
			vscode.window.showErrorMessage('No named terminals available.');
			return;
		}

		const terminalNames = terminals.map(t => t.name);
		const selectedTerminal = await vscode.window.showQuickPick(terminalNames, {
			placeHolder: 'Select terminal to cancel command in'
		});

		if (!selectedTerminal) {
			return;
		}

		if (terminalManager.cancelCommand(selectedTerminal)) {
			vscode.window.showInformationMessage(`Sent cancel signal to terminal '${selectedTerminal}'`);
		} else {
			vscode.window.showErrorMessage('Failed to send cancel signal to terminal.');
		}
	});

	// Register command to delete terminal
	const deleteTerminalCommand = vscode.commands.registerCommand('terminal-tools.deleteTerminal', async () => {
		const terminals = terminalManager.getAllTerminals();
		if (terminals.length === 0) {
			vscode.window.showErrorMessage('No named terminals to delete.');
			return;
		}

		const terminalNames = terminals.map(t => t.name);
		const selectedTerminal = await vscode.window.showQuickPick(terminalNames, {
			placeHolder: 'Select terminal to delete'
		});

		if (!selectedTerminal) {
			return;
		}

		const confirmation = await vscode.window.showWarningMessage(
			`Are you sure you want to delete terminal '${selectedTerminal}'?`,
			'Yes',
			'No'
		);

		if (confirmation === 'Yes') {
			if (terminalManager.deleteTerminal(selectedTerminal)) {
				vscode.window.showInformationMessage(`Deleted terminal: ${selectedTerminal}`);
			} else {
				vscode.window.showErrorMessage('Failed to delete terminal.');
			}
		}
	});

	// Register command to read terminal
	const readTerminalCommand = vscode.commands.registerCommand('terminal-tools.readTerminal', async () => {
		const terminals = terminalManager.getAllTerminals();
		if (terminals.length === 0) {
			vscode.window.showErrorMessage('No named terminals available.');
			return;
		}

		const terminalNames = terminals.map(t => t.name);
		const selectedTerminal = await vscode.window.showQuickPick(terminalNames, {
			placeHolder: 'Select terminal to read'
		});

		if (!selectedTerminal) {
			return;
		}

		const output = await terminalManager.readTerminal(selectedTerminal);
		if (output) {
			// Show the information in a new document
			const document = await vscode.workspace.openTextDocument({
				content: output,
				language: 'plaintext'
			});
			await vscode.window.showTextDocument(document);
		} else {
			vscode.window.showErrorMessage('Failed to read terminal.');
		}
	});

	// Clean up disposed terminals periodically
	const cleanupInterval = setInterval(() => {
		terminalManager.cleanup();
	}, 5000);

	// Register chat participant for GitHub Copilot integration
	const terminalToolsParticipant = new TerminalToolsParticipant();
	const chatParticipant = vscode.chat.createChatParticipant('terminal-tools', terminalToolsParticipant.handleRequest.bind(terminalToolsParticipant));
	chatParticipant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'terminal-icon.svg');
	chatParticipant.followupProvider = {
		provideFollowups(result: vscode.ChatResult, context: vscode.ChatContext, token: vscode.CancellationToken) {
			return [
				{
					prompt: 'List all terminals',
					label: '📋 List terminals'
				},
				{
					prompt: 'Create a new terminal',
					label: '➕ Create terminal'
				},
				{
					prompt: 'Send command to terminal',
					label: '📤 Send command'
				},
				{
					prompt: 'Cancel command in terminal',
					label: '🛑 Cancel command'
				},
				{
					prompt: 'Read terminal output',
					label: '👁️ Read terminal'
				}
			];
		}
	};

	// Register language model tools for GitHub Copilot
	registerLanguageModelTools(context);

	// Register all commands and cleanup
	context.subscriptions.push(
		listTerminalsCommand,
		createTerminalCommand,
		renameTerminalCommand,
		sendCommandCommand,
		cancelCommandCommand,
		deleteTerminalCommand,
		readTerminalCommand,
		chatParticipant,
		{ dispose: () => clearInterval(cleanupInterval) }
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
