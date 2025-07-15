import * as vscode from 'vscode';

const DONT_PROMPT_KEY = 'terminal-tools.dontPromptShellIntegration';

export async function ensureShellIntegration(context: vscode.ExtensionContext) {
	console.log('Ensuring shell integration is on...');

    await enforceShellIntegration(context);

    const configWatcher = vscode.workspace.onDidChangeConfiguration(async (event) => {
        if (event.affectsConfiguration('terminal.integrated.shellIntegration.enabled')) {
            await enforceShellIntegration(context);
        }
    });

    const resetPromptCommand = vscode.commands.registerCommand(
        'terminal-tools.resetShellIntegrationPrompt',
        async () => {
            await context.globalState.update(DONT_PROMPT_KEY, undefined);
            vscode.window.showInformationMessage(
                'Shell integration prompts have been re-enabled. You will be prompted again if needed.'
            );
            await enableShellIntegration();
        }
    );

    context.subscriptions.push(configWatcher, resetPromptCommand);
}

async function enforceShellIntegration(context: vscode.ExtensionContext): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('terminal.integrated');
    const isEnabled = config.get<boolean>('shellIntegration.enabled', true);
    const dontPrompt = context.globalState.get<boolean>(DONT_PROMPT_KEY, false);

    if (!isEnabled && !dontPrompt) {
        const action = await vscode.window.showWarningMessage(
            'Copilot Terminal Tools requires terminal shell integration for full functionality.',
            {
                modal: false,
                detail: 'Shell integration enables enhanced terminal features like command detection, history, and decorations.'
            },
            'Turn On',
            'Manual',
            'Ignore'
        );

        switch (action) {
            case 'Turn On':
                return await enableShellIntegration();
            case 'Manual':
                showManualInstructions();
                return false;
            case 'Ignore':
                showIgnoreMessage(context);
                return false;
            default:
                return false;
        }
    }
    
    if (isEnabled) {
        console.log('Shell integration is enabled.');
    }

    if (!isEnabled && dontPrompt) {
        console.log('Shell integration is disabled, but user chose not to be prompted.');
        return false;
    }
    return isEnabled;
}

function showIgnoreMessage(context: vscode.ExtensionContext) {
    vscode.window.showWarningMessage(
        'Some features may not work correctly without shell integration. You can enable it later via the Command Palette: "Enable Shell Integration"',
        'Do not show again'
    ).then(async (selection) => {
        if (selection === 'Do not show again') {
            await context.globalState.update(DONT_PROMPT_KEY, true);
            vscode.window.showInformationMessage(
                'Shell integration prompts disabled. You can re-enable prompts via Command Palette: "Reset Shell Integration Prompt"',
                'Undo'
                ).then(async(selection) => {
                    if (selection === 'Undo') {
                        await context.globalState.update(DONT_PROMPT_KEY, false);
                    }
                }
            );
        }
    }
    );
}

async function enableShellIntegration(): Promise<boolean> {
    try {
        const config = vscode.workspace.getConfiguration('terminal.integrated');
        await config.update('shellIntegration.enabled', true, vscode.ConfigurationTarget.Global);

        const reloadAction = await vscode.window.showInformationMessage(
            'Shell integration enabled! Please reload VS Code for changes to take effect.',
            'Reload Now',
            'Reload Later'
        );

        if (reloadAction === 'Reload Now') {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }

        return true;
    } catch (error) {
        vscode.window.showErrorMessage(
            'Failed to enable shell integration. Please enable it manually in VS Code settings.',
            'Settings'
        ).then(selection => {
            if (selection === 'Settings') {
                vscode.commands.executeCommand(
                    'workbench.action.openSettings',
                    '@id:terminal.integrated.shellIntegration.enabled'
                );
            }
        });
        return false;
    }
}

function showManualInstructions() {
    vscode.window.showInformationMessage(
        'To enable shell integration manually:\n' +
        ' -> Open VS Code Settings (Ctrl+,)\n' +
        ' -> Search for "shell integration"\n' +
        ' -> Enable "Terminal › Integrated › Shell Integration: Enabled"',
        'Settings'
    ).then(selection => {
        if (selection === 'Settings') {
            vscode.commands.executeCommand(
                'workbench.action.openSettings',
                '@id:terminal.integrated.shellIntegration.enabled'
            );
        }
    });
}
