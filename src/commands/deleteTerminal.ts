import * as vscode from 'vscode';
import { terminalManager } from '../terminalManager';

export async function deleteTerminal() {
    const terminals = terminalManager.getAllTerminals();
    if (terminals.length === 0) {
        vscode.window.showErrorMessage('No named terminals to delete.');
        return;
    }
    const terminalNames = terminals.map(t => t.name);
    const selectedTerminal = await vscode.window.showQuickPick(terminalNames, { placeHolder: 'Select terminal to delete' });
    if (!selectedTerminal) { return; }
    const confirmation = await vscode.window.showWarningMessage(
        `Are you sure you want to delete terminal '${selectedTerminal}'?`,
        'Yes',
        'No'
    );
    if (confirmation === 'Yes') {
        if (terminalManager.deleteTerminal(selectedTerminal)) {
            vscode.window.showInformationMessage(`Deleted terminal: ${selectedTerminal}`);
        } else {
            vscode.window.showErrorMessage('Failed to delete terminal.');
        }
    }
}
