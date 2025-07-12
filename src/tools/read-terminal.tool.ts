import * as vscode from 'vscode';
import { BaseTool } from './base.tool';
import { ReadTerminalParameters } from '../types/tool.parameters';
import { terminalManager } from '../terminalManager';

export class ReadTerminalTool extends BaseTool<ReadTerminalParameters> {
    public readonly ID = 'terminal-tools_readTerminal';

    prepareInvocation(options: vscode.LanguageModelToolInvocationPrepareOptions<ReadTerminalParameters>, token: vscode.CancellationToken): vscode.ProviderResult<vscode.PreparedToolInvocation> {
        return {
            invocationMessage: `Reading output from terminal '${options.input.terminalName}'`
        };
    }

    async invoke(options: vscode.LanguageModelToolInvocationOptions<ReadTerminalParameters>, token: vscode.CancellationToken): Promise<vscode.LanguageModelToolResult> {
        const { terminalName } = options.input;

        if (!terminalManager.getTerminal(terminalName)) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`Terminal '${terminalName}' not found.`)
            ]);
        }

        const output = await terminalManager.readTerminal(terminalName);
        
        if (output) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(output)
            ]);
        } else {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`Failed to read terminal '${terminalName}'.`)
            ]);
        }
    }
}
