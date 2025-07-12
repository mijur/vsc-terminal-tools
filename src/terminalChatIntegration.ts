import * as vscode from 'vscode';
import { TerminalToolsParticipant } from './chatParticipant';

export class TerminalChatIntegration {
	static register(context: vscode.ExtensionContext) {
		const terminalToolsParticipant = new TerminalToolsParticipant();
		const chatParticipant = vscode.chat.createChatParticipant('terminal-tools', terminalToolsParticipant.handleRequest.bind(terminalToolsParticipant));
		chatParticipant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'resources/terminal-icon.svg');
		chatParticipant.followupProvider = {
			provideFollowups(result: vscode.ChatResult, context: vscode.ChatContext, token: vscode.CancellationToken) {
				return [
					{ prompt: 'List all terminals', label: '📋 List terminals' },
					{ prompt: 'Create a new terminal', label: '➕ Create terminal' },
					{ prompt: 'Send command to terminal', label: '📤 Send command' },
					{ prompt: 'Cancel command in terminal', label: '🛑 Cancel command' },
					{ prompt: 'Read terminal output', label: '👁️ Read terminal' }
				];
			}
		};
		context.subscriptions.push(chatParticipant);
	}
}
