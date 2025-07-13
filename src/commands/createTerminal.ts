import * as vscode from 'vscode';
import { terminalManager } from '../terminalManager';

export async function createTerminal() {
    const name = await vscode.window.showInputBox({
        prompt: 'Enter terminal name',
        placeHolder: 'my-terminal'
    });
    if (!name) { return; }
    if (terminalManager.getTerminal(name)) {
        vscode.window.showErrorMessage(`Terminal '${name}' already exists.`);
        return;
    }
    const namedTerminal = terminalManager.createTerminal(name);
    namedTerminal.terminal.show();
    vscode.window.showInformationMessage(`Created terminal: ${name}`);
}
