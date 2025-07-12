import * as vscode from 'vscode';
import { BaseTool } from './base.tool';
import { DeleteTerminalParameters } from '../types/tool.parameters';
import { terminalManager } from '../terminalManager';

export class DeleteTerminalTool extends BaseTool<DeleteTerminalParameters> {
    public readonly ID = 'terminal-tools_deleteTerminal';

    prepareInvocation(options: vscode.LanguageModelToolInvocationPrepareOptions<DeleteTerminalParameters>, token: vscode.CancellationToken): vscode.ProviderResult<vscode.PreparedToolInvocation> {
        return {
            invocationMessage: `Deleting terminal '${options.input.name}'`
        };
    }

    async invoke(options: vscode.LanguageModelToolInvocationOptions<DeleteTerminalParameters>, token: vscode.CancellationToken): Promise<vscode.LanguageModelToolResult> {
        const { name } = options.input;

        if (!terminalManager.getTerminal(name)) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`Terminal '${name}' not found.`)
            ]);
        }

        const success = terminalManager.deleteTerminal(name);
        
        if (success) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`Successfully deleted terminal: ${name}`)
            ]);
        } else {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`Failed to delete terminal '${name}'.`)
            ]);
        }
    }
}
