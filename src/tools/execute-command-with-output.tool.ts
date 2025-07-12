import * as vscode from 'vscode';
import { BaseTool } from './base.tool';
import { ExecuteCommandWithOutputParameters } from '../types/tool.parameters';
import { terminalManager } from '../managers/terminal.manager';

export class ExecuteCommandWithOutputTool extends BaseTool<ExecuteCommandWithOutputParameters> {
    public readonly ID = 'terminal-tools_executeCommandWithOutput';

    prepareInvocation(options: vscode.LanguageModelToolInvocationPrepareOptions<ExecuteCommandWithOutputParameters>, token: vscode.CancellationToken): vscode.ProviderResult<vscode.PreparedToolInvocation> {
        return {
            invocationMessage: `Executing command with output capture in terminal '${options.input.terminalName}': ${options.input.command}`
        };
    }

    async invoke(options: vscode.LanguageModelToolInvocationOptions<ExecuteCommandWithOutputParameters>, token: vscode.CancellationToken): Promise<vscode.LanguageModelToolResult> {
        const { terminalName, command, cwd, shellPath } = options.input;

        const result = await terminalManager.executeCommandWithOutput(terminalName, command, shellPath, cwd);
        
        if (result.success && result.result) {
            const executionInfo = `\n\n**Execution Details:**
- Success: ${result.result.success}
- Exit Code: ${result.result.exitCode}
- Execution Time: ${result.result.executionTime}ms`;

            const output = result.result.output ? `\n\n**Output:**\n\`\`\`\n${result.result.output}\n\`\`\`` : '';
            const errorOutput = result.result.error ? `\n\n**Error/Warnings:**\n\`\`\`\n${result.result.error}\n\`\`\`` : '';

            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`${result.message}${executionInfo}${output}${errorOutput}`)
            ]);
        } else {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(result.message)
            ]);
        }
    }
}
