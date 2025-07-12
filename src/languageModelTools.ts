import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Interface for our named terminal objects
interface NamedTerminal {
    terminal: vscode.Terminal;
    name: string;
    created: Date;
    lastCommand?: string;
    lastOutput?: string;
    lastExecution?: Date;
}

// Interface for command execution results
interface CommandResult {
    success: boolean;
    output: string;
    error?: string;
    exitCode: number;
    executionTime: number;
}

// We'll need access to the terminal manager from extension.ts
// For now, we'll implement basic functionality here
class TerminalManagerForTools {
    private namedTerminals: Map<string, NamedTerminal> = new Map();
    private tempDir: string;

    constructor() {
        // Create a temporary directory for storing command outputs
        this.tempDir = path.join(os.tmpdir(), 'vsc-terminal-tools');
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }


    private async executeWithOutput(command: string, cwd?: string, shellPath?: string): Promise<CommandResult> {
        const startTime = Date.now();
        
        try {
            const options: any = {
                cwd: cwd || process.cwd(),
                timeout: 30000, // 30 second timeout
                maxBuffer: 1024 * 1024 * 10, // 10MB buffer
                encoding: 'utf8'
            };

            if (shellPath) {
                options.shell = shellPath;
            }

            const { stdout, stderr } = await execAsync(command, options);
            const executionTime = Date.now() - startTime;

            const stdoutStr = typeof stdout === 'string' ? stdout : stdout.toString();
            const stderrStr = typeof stderr === 'string' ? stderr : stderr.toString();

            return {
                success: true,
                output: stdoutStr.trim(),
                error: stderrStr.trim() || undefined,
                exitCode: 0,
                executionTime
            };
        } catch (error: any) {
            const executionTime = Date.now() - startTime;
            const stdoutStr = error.stdout ? (typeof error.stdout === 'string' ? error.stdout : error.stdout.toString()) : '';
            const stderrStr = error.stderr ? (typeof error.stderr === 'string' ? error.stderr : error.stderr.toString()) : error.message;
            
            return {
                success: false,
                output: stdoutStr.trim(),
                error: stderrStr.trim(),
                exitCode: error.code || 1,
                executionTime
            };
        }
    }

    public createTerminal(name: string, shellPath?: string, cwd?: string): NamedTerminal {
        const terminal = vscode.window.createTerminal({
            name: name,
            shellPath: shellPath,
            cwd: cwd
        });

        const namedTerminal: NamedTerminal = {
            terminal,
            name,
            created: new Date(),
            lastCommand: undefined,
            lastOutput: undefined,
            lastExecution: undefined
        };

        this.namedTerminals.set(name, namedTerminal);
        return namedTerminal;
    }

    public getTerminal(name: string): NamedTerminal | undefined {
        return this.namedTerminals.get(name);
    }

    public getAllTerminals(): NamedTerminal[] {
        return Array.from(this.namedTerminals.values());
    }

    public renameTerminal(oldName: string, newName: string): boolean {
        const namedTerminal = this.namedTerminals.get(oldName);
        if (namedTerminal) {
            namedTerminal.name = newName;
            this.namedTerminals.delete(oldName);
            this.namedTerminals.set(newName, namedTerminal);
            return true;
        }
        return false;
    }

    public deleteTerminal(name: string): boolean {
        const namedTerminal = this.namedTerminals.get(name);
        if (namedTerminal) {
            namedTerminal.terminal.dispose();
            this.namedTerminals.delete(name);
            return true;
        }
        return false;
    }

    public sendCommandOrCreate(terminalName: string, command: string, shellPath?: string, cwd?: string): { success: boolean; message: string; created: boolean } {
        let namedTerminal = this.namedTerminals.get(terminalName);
        let created = false;
        
        if (!namedTerminal) {
            // Create the terminal if it doesn't exist
            namedTerminal = this.createTerminal(terminalName, shellPath, cwd);
            created = true;
        }
        
        // Update command tracking
        namedTerminal.lastCommand = command;
        namedTerminal.lastExecution = new Date();
        
        namedTerminal.terminal.sendText(command);
        namedTerminal.terminal.show();
        
        const createdMessage = created ? ` (terminal created)` : '';
        return { 
            success: true, 
            message: `Command sent to terminal '${terminalName}': ${command}${createdMessage}`,
            created 
        };
    }

    public async executeCommandWithOutput(terminalName: string, command: string, shellPath?: string, cwd?: string): Promise<{ success: boolean; message: string; created: boolean; result?: CommandResult }> {
        let namedTerminal = this.namedTerminals.get(terminalName);
        let created = false;
        
        if (!namedTerminal) {
            // Create the terminal if it doesn't exist
            namedTerminal = this.createTerminal(terminalName, shellPath, cwd);
            created = true;
        }

        try {
            // Execute command and capture output
            const result = await this.executeWithOutput(command, cwd, shellPath);
            
            // Update terminal tracking
            namedTerminal.lastCommand = command;
            namedTerminal.lastOutput = result.output;
            namedTerminal.lastExecution = new Date();
            
            // Also send to visual terminal for user visibility
            namedTerminal.terminal.sendText(command);
            namedTerminal.terminal.show();
            
            const createdMessage = created ? ` (terminal created)` : '';
            const executionMessage = `Command executed in terminal '${terminalName}': ${command}${createdMessage}`;
            
            return { 
                success: true, 
                message: executionMessage,
                created,
                result
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                message: `Failed to execute command in terminal '${terminalName}': ${errorMessage}`,
                created
            };
        }
    }

    public cancelCommand(terminalName: string): boolean {
        const namedTerminal = this.namedTerminals.get(terminalName);
        if (namedTerminal) {
            // Send Ctrl+C to cancel the current command
            namedTerminal.terminal.sendText('\x03');
            namedTerminal.terminal.show();
            return true;
        }
        return false;
    }

    public async readTerminal(terminalName: string): Promise<string | null> {
        const namedTerminal = this.namedTerminals.get(terminalName);
        if (!namedTerminal) {
            return null;
        }

        // Show the terminal
        namedTerminal.terminal.show();
        
        // If we have captured output from the last command, return it
        if (namedTerminal.lastOutput !== undefined) {
            const lastCommandInfo = namedTerminal.lastCommand ? `Last command: ${namedTerminal.lastCommand}\n` : '';
            const lastExecutionInfo = namedTerminal.lastExecution ? `Executed: ${namedTerminal.lastExecution.toLocaleString()}\n` : '';
            
            return `Terminal: ${terminalName}
Created: ${namedTerminal.created.toLocaleString()}
Status: Active

${lastCommandInfo}${lastExecutionInfo}
Last Captured Output:
\`\`\`
${namedTerminal.lastOutput}
\`\`\`

Note: This shows the output from the last command executed with output capture. For real-time terminal interaction, use the visual terminal that is now active.`;
        }
        
        // Return a message explaining the limitation
        return `Terminal '${terminalName}' is now active. 

Terminal: ${terminalName}
Created: ${namedTerminal.created.toLocaleString()}
Status: Active
Last command: ${namedTerminal.lastCommand || 'None'}

Note: VS Code's Terminal API does not provide direct access to terminal buffer content for security reasons. To capture command output, use the 'executeCommandWithOutput' tool or the 'sendCommandOrCreate' tool with captureOutput=true.

To work around this limitation, you can:
1. Use the executeCommandWithOutput tool for commands you want to capture output from
2. Use commands that output to files (e.g., 'command > output.txt')
3. Copy terminal content manually
4. Use terminal-based logging solutions`;
    }
}

// Create a shared instance
const terminalManager = new TerminalManagerForTools();

// Tool parameter interfaces
interface ListTerminalsParameters {
    // No parameters needed
}

interface CreateTerminalParameters {
    name: string;
    cwd?: string;
    shellPath?: string;
}

interface SendCommandOrCreateParameters {
    terminalName: string;
    command: string;
    cwd?: string;
    shellPath?: string;
    captureOutput?: boolean; // New parameter to control output capture
}

interface ExecuteCommandWithOutputParameters {
    terminalName: string;
    command: string;
    cwd?: string;
    shellPath?: string;
}

interface RenameTerminalParameters {
    oldName: string;
    newName: string;
}

interface DeleteTerminalParameters {
    name: string;
}

interface CancelCommandParameters {
    terminalName: string;
}

interface ReadTerminalParameters {
    terminalName: string;
}

// List Terminals Tool
export class ListTerminalsTool implements vscode.LanguageModelTool<ListTerminalsParameters> {
    static readonly ID = 'terminal-tools_listTerminals';

    prepareInvocation(options: vscode.LanguageModelToolInvocationPrepareOptions<ListTerminalsParameters>, token: vscode.CancellationToken): vscode.ProviderResult<vscode.PreparedToolInvocation> {
        return {
            invocationMessage: 'Listing all named terminals'
        };
    }

    async invoke(options: vscode.LanguageModelToolInvocationOptions<ListTerminalsParameters>, token: vscode.CancellationToken): Promise<vscode.LanguageModelToolResult> {
        const terminals = terminalManager.getAllTerminals();
        
        if (terminals.length === 0) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart('No named terminals found.')
            ]);
        }

        const terminalList = terminals.map(t => {
            const lastCommandInfo = t.lastCommand ? `\n  - Last command: \`${t.lastCommand}\`` : '';
            const lastExecutionInfo = t.lastExecution ? `\n  - Last execution: ${t.lastExecution.toLocaleString()}` : '';
            const lastOutputInfo = t.lastOutput ? `\n  - Has captured output: Yes` : '';
            
            return `- **${t.name}** (created: ${t.created.toLocaleString()})${lastCommandInfo}${lastExecutionInfo}${lastOutputInfo}`;
        }).join('\n\n');

        return new vscode.LanguageModelToolResult([
            new vscode.LanguageModelTextPart(`Named Terminals:\n\n${terminalList}`)
        ]);
    }
}

// Create Terminal Tool
export class CreateTerminalTool implements vscode.LanguageModelTool<CreateTerminalParameters> {
    static readonly ID = 'terminal-tools_createTerminal';

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

// Send Command or Create Tool
export class SendCommandOrCreateTool implements vscode.LanguageModelTool<SendCommandOrCreateParameters> {
    static readonly ID = 'terminal-tools_sendCommandOrCreate';

    prepareInvocation(options: vscode.LanguageModelToolInvocationPrepareOptions<SendCommandOrCreateParameters>, token: vscode.CancellationToken): vscode.ProviderResult<vscode.PreparedToolInvocation> {
        const captureMode = options.input.captureOutput ? ' (with output capture)' : '';
        return {
            invocationMessage: `Sending command to terminal '${options.input.terminalName}': ${options.input.command}${captureMode}`
        };
    }

    async invoke(options: vscode.LanguageModelToolInvocationOptions<SendCommandOrCreateParameters>, token: vscode.CancellationToken): Promise<vscode.LanguageModelToolResult> {
        const { terminalName, command, cwd, shellPath, captureOutput } = options.input;

        if (captureOutput) {
            // Use the new method that captures output
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
        } else {
            // Use the original method that just sends to terminal
            const result = terminalManager.sendCommandOrCreate(terminalName, command, shellPath, cwd);
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(result.message)
            ]);
        }
    }
}

// Execute Command with Output Tool
export class ExecuteCommandWithOutputTool implements vscode.LanguageModelTool<ExecuteCommandWithOutputParameters> {
    static readonly ID = 'terminal-tools_executeCommandWithOutput';

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

// Rename Terminal Tool
export class RenameTerminalTool implements vscode.LanguageModelTool<RenameTerminalParameters> {
    static readonly ID = 'terminal-tools_renameTerminal';

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

// Delete Terminal Tool
export class DeleteTerminalTool implements vscode.LanguageModelTool<DeleteTerminalParameters> {
    static readonly ID = 'terminal-tools_deleteTerminal';

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

// Cancel Command Tool
export class CancelCommandTool implements vscode.LanguageModelTool<CancelCommandParameters> {
    static readonly ID = 'terminal-tools_cancelCommand';

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

        const success = terminalManager.cancelCommand(terminalName);
        
        if (success) {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`Successfully sent cancel signal (Ctrl+C) to terminal '${terminalName}'.`)
            ]);
        } else {
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`Failed to send cancel signal to terminal '${terminalName}'.`)
            ]);
        }
    }
}

// Read Terminal Tool
export class ReadTerminalTool implements vscode.LanguageModelTool<ReadTerminalParameters> {
    static readonly ID = 'terminal-tools_readTerminal';

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

// Registration function
export function registerLanguageModelTools(context: vscode.ExtensionContext): void {
    const tools = [
        vscode.lm.registerTool(ListTerminalsTool.ID, new ListTerminalsTool()),
        vscode.lm.registerTool(CreateTerminalTool.ID, new CreateTerminalTool()),
        vscode.lm.registerTool(SendCommandOrCreateTool.ID, new SendCommandOrCreateTool()),
        vscode.lm.registerTool(ExecuteCommandWithOutputTool.ID, new ExecuteCommandWithOutputTool()),
        vscode.lm.registerTool(RenameTerminalTool.ID, new RenameTerminalTool()),
        vscode.lm.registerTool(DeleteTerminalTool.ID, new DeleteTerminalTool()),
        vscode.lm.registerTool(CancelCommandTool.ID, new CancelCommandTool()),
        vscode.lm.registerTool(ReadTerminalTool.ID, new ReadTerminalTool())
    ];

    context.subscriptions.push(...tools);
}

// Export the shared terminal manager for other modules to use
export { terminalManager };
