import * as vscode from 'vscode';
import { BaseTool } from './base.tool';
import { SendCommandOrCreateParameters as SendCommandParameters } from '../types/tool.parameters';
import { terminalManager } from '../terminalManager';

export class SendCommandOrCreateTool extends BaseTool<SendCommandParameters> {
    public readonly ID = 'terminal-tools_sendCommand';

    prepareInvocation(options: vscode.LanguageModelToolInvocationPrepareOptions<SendCommandParameters>, token: vscode.CancellationToken): vscode.ProviderResult<vscode.PreparedToolInvocation> {
        const captureMode = options.input.captureOutput ? ' (with output capture)' : '';
        return {
            invocationMessage: `Sending command to terminal '${options.input.terminalName}': ${options.input.command}${captureMode}`
        };
    }

    async invoke(options: vscode.LanguageModelToolInvocationOptions<SendCommandParameters>, token: vscode.CancellationToken): Promise<vscode.LanguageModelToolResult> {
        const { terminalName, command, workingDirectory, shellPath, captureOutput=false } = options.input;

        if (captureOutput) {
            // Use the new method that captures output
            const result = await terminalManager.executeCommandWithOutput(terminalName, command, shellPath, workingDirectory);
            
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
        } else {
            // Use the original method that just sends to terminal
            const result = terminalManager.sendCommand(terminalName, command, shellPath, workingDirectory);
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(result.message)
            ]);
        }
    }
}
