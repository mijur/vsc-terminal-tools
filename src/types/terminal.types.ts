import * as vscode from 'vscode';

// Interface for our named terminal objects
export interface NamedTerminal {
    terminal: vscode.Terminal;
    name: string;
    created: Date;
}

// Interface for command execution results
export interface CommandResult {
    success: boolean;
    output: string;
    error?: string;
    exitCode: number;
    executionTime: number;
}

// Interface for command execution response
export interface CommandExecutionResponse {
    success: boolean;
    message: string;
    result?: CommandResult;
}

// Interface for simple command response
export interface CommandResponse {
    success: boolean;
    message: string;
}
