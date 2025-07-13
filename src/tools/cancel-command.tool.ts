import * as vscode from 'vscode';
import { BaseTool } from './base.tool';
import { CancelCommandParameters } from '../types/tool.parameters';
import { terminalManager } from '../terminalManager';

export class CancelCommandTool extends BaseTool<CancelCommandParameters> {
    public readonly ID = 'terminal-tools_cancelCommand';

    prepareInvocation(options: vscode.LanguageModelToolInvocationPrepareOptions<CancelCommandParameters>, token: vscode.CancellationToken): vscode.ProviderResult<vscode.PreparedToolInvocation> {
        return {
            invocationMessage: `Sending cancel signal to terminal '${options.input.terminalName}'`
        };
    }

    async invoke(options: vscode.LanguageModelToolInvocationOptions<CancelCommandParameters>, token: vscode.CancellationToken): Promise<vscode.LanguageModelToolResult> {
        const { terminalName } = options.input;

        if (!terminalManager.getTerminal(terminalName)) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`Terminal '${terminalName}' not found.`)
            ]);
        }

        const response = await terminalManager.cancelCommand(terminalName);
        
        return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(JSON.stringify(response))
        ]);
    }
}
