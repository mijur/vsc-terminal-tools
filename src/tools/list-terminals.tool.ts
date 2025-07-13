import * as vscode from 'vscode';
import { BaseTool } from './base.tool';
import { ListTerminalsParameters } from '../types/tool.parameters';
import { terminalManager } from '../terminalManager';

export class ListTerminalsTool extends BaseTool<ListTerminalsParameters> {
    public readonly ID = 'terminal-tools_listTerminals';

    prepareInvocation(options: vscode.LanguageModelToolInvocationPrepareOptions<ListTerminalsParameters>, token: vscode.CancellationToken): vscode.ProviderResult<vscode.PreparedToolInvocation> {
        return {
            invocationMessage: 'Listing all named terminals'
        };
    }

    async invoke(options: vscode.LanguageModelToolInvocationOptions<ListTerminalsParameters>, token: vscode.CancellationToken): Promise<vscode.LanguageModelToolResult> {
        const terminals = terminalManager.getAllTerminals();
        
        if (terminals.length === 0) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart('No named terminals found. Use terminal-tools_sendCommand to create and execute commands.')
            ]);
        }

        const terminalList = terminals.map(t => {
            return `- **${t.name} - shell integration: ${!!t.terminal.shellIntegration}**`;
        }).join('\n\n');

        return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Named Terminals:\n\n${terminalList}`)
        ]);
    }
}
