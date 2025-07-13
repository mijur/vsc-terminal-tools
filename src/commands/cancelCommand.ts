import * as vscode from 'vscode';
import { terminalManager } from '../terminalManager';

export async function cancelCommand() {
    const terminals = terminalManager.getAllTerminals();
    if (terminals.length === 0) {
        vscode.window.showErrorMessage('No named terminals available.');
        return;
    }
    const terminalNames = terminals.map(t => t.name);
    const selectedTerminal = await vscode.window.showQuickPick(terminalNames, { placeHolder: 'Select terminal to cancel command in' });
    if (!selectedTerminal) { return; }
    if (terminalManager.cancelCommand(selectedTerminal)) {
        vscode.window.showInformationMessage(`Sent cancel signal to terminal '${selectedTerminal}'`);
    } else {
        vscode.window.showErrorMessage('Failed to send cancel signal to terminal.');
    }
}
