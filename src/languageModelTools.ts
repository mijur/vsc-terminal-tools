import * as vscode from 'vscode';
import {
    ListTerminalsTool,
    CreateTerminalTool,
    SendCommandOrCreateTool,
    ExecuteCommandWithOutputTool,
    DeleteTerminalTool,
    CancelCommandTool,
} from './tools';

// Registration function
export function registerLanguageModelTools(context: vscode.ExtensionContext): void {
    const tools = [
        vscode.lm.registerTool(new ListTerminalsTool().ID, new ListTerminalsTool()),
        vscode.lm.registerTool(new CreateTerminalTool().ID, new CreateTerminalTool()),
        vscode.lm.registerTool(new SendCommandOrCreateTool().ID, new SendCommandOrCreateTool()),
        vscode.lm.registerTool(new ExecuteCommandWithOutputTool().ID, new ExecuteCommandWithOutputTool()),
        vscode.lm.registerTool(new DeleteTerminalTool().ID, new DeleteTerminalTool()),
        vscode.lm.registerTool(new CancelCommandTool().ID, new CancelCommandTool()),
    ];

    context.subscriptions.push(...tools);
}
