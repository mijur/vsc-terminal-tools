import { registerLanguageModelTools } from './languageModelTools';

export function activate(context: import('vscode').ExtensionContext) {
	console.log('Terminal Tools extension is now active!');
	import('./terminalCommands.js').then(module => { module.TerminalCommands.register(context); });
	import('./terminalChatIntegration.js').then(module => { module.TerminalChatIntegration.register(context); });
	registerLanguageModelTools(context);
	import('./terminalManager.js').then(module => {
		const cleanupInterval = setInterval(() => { module.terminalManager.cleanup(); }, 5000);
		context.subscriptions.push({ dispose: () => clearInterval(cleanupInterval) });
	});
}

export function deactivate() {}

