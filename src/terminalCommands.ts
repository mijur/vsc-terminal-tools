import * as vscode from 'vscode';
import { listTerminals, createTerminal, sendCommand, cancelCommand, deleteTerminal } from './commands';

export function registerTerminalCommands(context: vscode.ExtensionContext): void {
	const commands = [
		vscode.commands.registerCommand('terminal-tools.listTerminals', listTerminals),
		vscode.commands.registerCommand('terminal-tools.createTerminal', createTerminal),
		vscode.commands.registerCommand('terminal-tools.sendCommand', sendCommand),
		vscode.commands.registerCommand('terminal-tools.cancelCommand', cancelCommand),
		vscode.commands.registerCommand('terminal-tools.deleteTerminal', deleteTerminal),
	];
	context.subscriptions.push(...commands);
}
