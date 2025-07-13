import { registerLanguageModelTools } from './languageModelTools';
import { registerTerminalCommands } from './terminalCommands';

export function activate(context: import('vscode').ExtensionContext) {
	console.log('Activating Copilot Terminal Tools extension...');

	registerLanguageModelTools(context);
	registerTerminalCommands(context);
	
	console.log('Copilot Terminal Tools extension is now active!');
}

export function deactivate() {}

