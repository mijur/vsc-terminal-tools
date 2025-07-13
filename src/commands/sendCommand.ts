import * as vscode from 'vscode';
import { terminalManager } from '../terminalManager';

export async function sendCommand() {
    const terminals = terminalManager.getAllTerminals();
    if (terminals.length === 0) {
        vscode.window.showErrorMessage('No named terminals available.');
        return;
    }
    const terminalNames = terminals.map(t => t.name);
    const selectedTerminal = await vscode.window.showQuickPick(terminalNames, { placeHolder: 'Select terminal to send command to' });
    if (!selectedTerminal) { return; }
    const command = await vscode.window.showInputBox({ prompt: 'Enter command to send', placeHolder: 'ls -la' });
    if (!command) { return; }
    const result = terminalManager.sendCommandOrCreate(selectedTerminal, command);
    if (result.success) {
        vscode.window.showInformationMessage(result.message);
    } else {
        vscode.window.showErrorMessage(result.message);
    }
}
