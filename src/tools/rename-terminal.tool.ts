import * as vscode from 'vscode';
import { BaseTool } from './base.tool';
import { RenameTerminalParameters } from '../types/tool.parameters';
import { terminalManager } from '../managers/terminal.manager';

export class RenameTerminalTool extends BaseTool<RenameTerminalParameters> {
    public readonly ID = 'terminal-tools_renameTerminal';

    prepareInvocation(options: vscode.LanguageModelToolInvocationPrepareOptions<RenameTerminalParameters>, token: vscode.CancellationToken): vscode.ProviderResult<vscode.PreparedToolInvocation> {
        return {
            invocationMessage: `Renaming terminal '${options.input.oldName}' to '${options.input.newName}'`
        };
    }

    async invoke(options: vscode.LanguageModelToolInvocationOptions<RenameTerminalParameters>, token: vscode.CancellationToken): Promise<vscode.LanguageModelToolResult> {
        const { oldName, newName } = options.input;

        if (!terminalManager.getTerminal(oldName)) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`Terminal '${oldName}' not found.`)
            ]);
        }

        if (terminalManager.getTerminal(newName)) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`Terminal '${newName}' already exists.`)
            ]);
        }

        const success = terminalManager.renameTerminal(oldName, newName);
        
        if (success) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`Successfully renamed terminal from '${oldName}' to '${newName}'.`)
            ]);
        } else {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`Failed to rename terminal '${oldName}'.`)
            ]);
        }
    }
}
