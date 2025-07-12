import * as vscode from 'vscode';
import {
    ListTerminalsTool,
    CreateTerminalTool,
    SendCommandOrCreateTool,
    ExecuteCommandWithOutputTool,
    RenameTerminalTool,
    DeleteTerminalTool,
    CancelCommandTool,
    ReadTerminalTool
} from './tools';

// Registration function
export function registerLanguageModelTools(context: vscode.ExtensionContext): void {
    const tools = [
        vscode.lm.registerTool(new ListTerminalsTool().ID, new ListTerminalsTool()),
        vscode.lm.registerTool(new CreateTerminalTool().ID, new CreateTerminalTool()),
        vscode.lm.registerTool(new SendCommandOrCreateTool().ID, new SendCommandOrCreateTool()),
        vscode.lm.registerTool(new ExecuteCommandWithOutputTool().ID, new ExecuteCommandWithOutputTool()),
        vscode.lm.registerTool(new RenameTerminalTool().ID, new RenameTerminalTool()),
        vscode.lm.registerTool(new DeleteTerminalTool().ID, new DeleteTerminalTool()),
        vscode.lm.registerTool(new CancelCommandTool().ID, new CancelCommandTool()),
        vscode.lm.registerTool(new ReadTerminalTool().ID, new ReadTerminalTool())
    ];

    context.subscriptions.push(...tools);
}

// Export the shared terminal manager for other modules to use
export { terminalManager } from './managers/terminal.manager';

// Export types
export * from './types/terminal.types';
export * from './types/tool.parameters';
