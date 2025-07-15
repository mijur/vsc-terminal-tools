
import { registerLanguageModelTools } from './languageModelTools';
import { ensureShellIntegration } from './ShellIntegrationManager';
import { registerTerminalCommands } from './terminalCommands';

export async function activate(context: import('vscode').ExtensionContext) {
	console.log('Ensuring shell integration...');
    ensureShellIntegration(context);

    console.log('Activating Copilot Terminal Tools extension...');

    registerLanguageModelTools(context);
    registerTerminalCommands(context);

    console.log('Copilot Terminal Tools extension is now active!');
}


export function deactivate() {}


