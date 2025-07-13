import { registerLanguageModelTools } from './languageModelTools';

export function activate(context: import('vscode').ExtensionContext) {
	console.log('Terminal Tools extension is now active!');
	import('./terminalCommands.js').then(module => { module.TerminalCommands.register(context); });
	registerLanguageModelTools(context);
}

export function deactivate() {}

