import * as vscode from 'vscode';

export abstract class BaseTool<T> implements vscode.LanguageModelTool<T> {
    public abstract readonly ID: string;

    abstract prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<T>, 
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.PreparedToolInvocation>;

    abstract invoke(
        options: vscode.LanguageModelToolInvocationOptions<T>, 
        token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelToolResult>;
}
