import * as vscode from 'vscode';
import { terminalManager } from '../terminalManager';

export function listTerminals() {
    const terminals = terminalManager.getAllTerminals();
    if (terminals.length === 0) {
        vscode.window.showInformationMessage('No named terminals found.');
        return;
    }
    const terminalList = terminals.map(t => `${t.name} - shell integration: ${!!t.terminal.shellIntegration}`).join('\n');
    vscode.window.showInformationMessage(`Named Terminals:\n${terminalList}`);
}
