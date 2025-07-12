import * as vscode from 'vscode';
import { BaseTool } from './base.tool';
import { CreateTerminalParameters } from '../types/tool.parameters';
import { terminalManager } from '../managers/terminal.manager';

export class CreateTerminalTool extends BaseTool<CreateTerminalParameters> {
    public readonly ID = 'terminal-tools_createTerminal';

    prepareInvocation(options: vscode.LanguageModelToolInvocationPrepareOptions<CreateTerminalParameters>, token: vscode.CancellationToken): vscode.ProviderResult<vscode.PreparedToolInvocation> {
        return {
            invocationMessage: `Creating terminal '${options.input.name}'`
        };
    }

    async invoke(options: vscode.LanguageModelToolInvocationOptions<CreateTerminalParameters>, token: vscode.CancellationToken): Promise<vscode.LanguageModelToolResult> {
        const { name, cwd, shellPath } = options.input;

        if (terminalManager.getTerminal(name)) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`Terminal '${name}' already exists.`)
            ]);
        }

        const namedTerminal = terminalManager.createTerminal(name, shellPath, cwd);
        namedTerminal.terminal.show();

        return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Successfully created terminal: ${name}`)
        ]);
    }
}
