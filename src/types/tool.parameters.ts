// Tool parameter interfaces

export interface ListTerminalsParameters {
    // No parameters needed
}

export interface CreateTerminalParameters {
    name: string;
    workingDirectory?: string;
    shellPath?: string;
}

export interface SendCommandOrCreateParameters {
    terminalName: string;
    command: string;
    workingDirectory?: string;
    shellPath?: string;
    captureOutput?: boolean; // New parameter to control output capture
}

export interface ExecuteCommandWithOutputParameters {
    terminalName: string;
    command: string;
    workingDirectory?: string;
    shellPath?: string;
}

export interface DeleteTerminalParameters {
    name: string;
}

export interface CancelCommandParameters {
    terminalName: string;
}
