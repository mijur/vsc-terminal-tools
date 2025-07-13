import * as vscode from 'vscode';
import { terminalManager } from './terminalManager';

export class TerminalCommands {
	static register(context: vscode.ExtensionContext) {
		context.subscriptions.push(
			vscode.commands.registerCommand('terminal-tools.listTerminals', TerminalCommands.listTerminals),
			vscode.commands.registerCommand('terminal-tools.createTerminal', TerminalCommands.createTerminal),
			vscode.commands.registerCommand('terminal-tools.sendCommand', TerminalCommands.sendCommand),
			vscode.commands.registerCommand('terminal-tools.cancelCommand', TerminalCommands.cancelCommand),
			vscode.commands.registerCommand('terminal-tools.deleteTerminal', TerminalCommands.deleteTerminal),
		);
	}

	private static listTerminals() {
		const terminals = terminalManager.getAllTerminals();
		if (terminals.length === 0) {
			vscode.window.showInformationMessage('No named terminals found.');
			return;
		}
		const terminalList = terminals.map(t => `${t.name} (created: ${t.created.toLocaleString()})`).join('\n');
		vscode.window.showInformationMessage(`Named Terminals:\n${terminalList}`);
	}

	private static async createTerminal() {
		const name = await vscode.window.showInputBox({
			prompt: 'Enter terminal name',
			placeHolder: 'my-terminal'
		});
		if (!name) { return; }
		if (terminalManager.getTerminal(name)) {
			vscode.window.showErrorMessage(`Terminal '${name}' already exists.`);
			return;
		}
		const namedTerminal = terminalManager.createTerminal(name);
		namedTerminal.terminal.show();
		vscode.window.showInformationMessage(`Created terminal: ${name}`);
	}

	private static async sendCommand() {
		const terminals = terminalManager.getAllTerminals();
		if (terminals.length === 0) {
			vscode.window.showErrorMessage('No named terminals available.');
			return;
		}
		const terminalNames = terminals.map(t => t.name);
		const selectedTerminal = await vscode.window.showQuickPick(terminalNames, { placeHolder: 'Select terminal to send command to' });
		if (!selectedTerminal) { return; }
		const command = await vscode.window.showInputBox({ prompt: 'Enter command to send', placeHolder: 'ls -la' });
		if (!command) { return; }
		const result = terminalManager.sendCommandOrCreate(selectedTerminal, command);
		if (result.success) {
			vscode.window.showInformationMessage(result.message);
		} else {
			vscode.window.showErrorMessage(result.message);
		}
	}

	private static async cancelCommand() {
		const terminals = terminalManager.getAllTerminals();
		if (terminals.length === 0) {
			vscode.window.showErrorMessage('No named terminals available.');
			return;
		}
		const terminalNames = terminals.map(t => t.name);
		const selectedTerminal = await vscode.window.showQuickPick(terminalNames, { placeHolder: 'Select terminal to cancel command in' });
		if (!selectedTerminal) { return; }
		if (terminalManager.cancelCommand(selectedTerminal)) {
			vscode.window.showInformationMessage(`Sent cancel signal to terminal '${selectedTerminal}'`);
		} else {
			vscode.window.showErrorMessage('Failed to send cancel signal to terminal.');
		}
	}

	private static async deleteTerminal() {
		const terminals = terminalManager.getAllTerminals();
		if (terminals.length === 0) {
			vscode.window.showErrorMessage('No named terminals to delete.');
			return;
		}
		const terminalNames = terminals.map(t => t.name);
		const selectedTerminal = await vscode.window.showQuickPick(terminalNames, { placeHolder: 'Select terminal to delete' });
		if (!selectedTerminal) { return; }
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
	}
}
