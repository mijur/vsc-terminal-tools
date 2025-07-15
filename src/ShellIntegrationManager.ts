import * as vscode from 'vscode';

const DONT_PROMPT_KEY = 'terminal-tools.dontPromptShellIntegration';


export async function ensureShellIntegration(context: vscode.ExtensionContext) {
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
            'Your Extension Name requires terminal shell integration to be enabled for full functionality.',
            {
                modal: false,
                detail: 'Shell integration enables enhanced terminal features like command detection, history, and decorations.'
            },
            'Enable Automatically',
            'Enable Manually',
            'Continue Without',
            'Never Show Again'
        );

        switch (action) {
            case 'Enable Automatically':
                return await enableShellIntegration();
            case 'Enable Manually':
                showManualInstructions();
                return false;
            case 'Continue Without':
                vscode.window.showWarningMessage(
                    'Some features may not work correctly without shell integration. ' +
                    'You can enable it later via the Command Palette: "Enable Shell Integration"'
                );
                return false;
            case 'Never Show Again':
                await context.globalState.update(DONT_PROMPT_KEY, true);
                vscode.window.showInformationMessage(
                    'Shell integration prompts disabled. You can re-enable prompts via Command Palette: "Reset Shell Integration Prompt"'
                );
                return false;
            default:
                return false;
        }
    }

    if (!isEnabled && dontPrompt) {
        console.log('Shell integration is disabled, but user chose not to be prompted.');
        return false;
    }

    return isEnabled;
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
            'Open Settings'
        ).then(selection => {
            if (selection === 'Open Settings') {
                vscode.commands.executeCommand(
                    'workbench.action.openSettings',
                    'terminal.integrated.shellIntegration.enabled'
                );
            }
        });
        return false;
    }
}

function showManualInstructions() {
    vscode.window.showInformationMessage(
        'To enable shell integration manually:\n' +
        '1. Open VS Code Settings (Ctrl+,)\n' +
        '2. Search for "shell integration"\n' +
        '3. Enable "Terminal › Integrated › Shell Integration: Enabled"',
        'Open Settings'
    ).then(selection => {
        if (selection === 'Open Settings') {
            vscode.commands.executeCommand(
                'workbench.action.openSettings',
                'terminal.integrated.shellIntegration.enabled'
            );
        }
    });
}
