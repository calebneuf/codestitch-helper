import * as vscode from 'vscode';
import { SCSSNavigationProvider, SCSSSection } from './providers/scssNavigationProvider';
import { replaceNavTabs } from './commands/replaceNavTabs';
import { selectAll } from './commands/selectAll';
import { openSection } from './commands/openSection';
import { CodeLensProvider } from './providers/codeLensProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('codestitch-helper is now active!');
    
    const scssNavProvider = new SCSSNavigationProvider();
    vscode.window.registerTreeDataProvider('codestitchHelper', scssNavProvider);

    const openSectionDisposable = vscode.commands.registerCommand('codestitchHelper.openSection', (section: SCSSSection) => {
        openSection(section);
    });

    const selectAllDisposable = vscode.commands.registerCommand('codestitchHelper.selectAll', (section: SCSSSection) => {
        selectAll(section);
    });

    const replaceNavTabsDisposable = vscode.commands.registerCommand('codestitchHelper.replaceNavTabs', (document: vscode.TextDocument) => {
        replaceNavTabs(document);
    });

    // Ensure the Explorer view is open
    vscode.commands.executeCommand('workbench.view.explorer'); // No need to focus on a specific view

    // Register CodeLensProvider for both HTML and SCSS
    context.subscriptions.push(vscode.languages.registerCodeLensProvider({ language: '*' }, new CodeLensProvider()));

    const supportedLanguages = ['scss', 'css', 'sass', 'less'];
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (supportedLanguages.includes(event.document.languageId)) {
            scssNavProvider.refresh();
        }
    });

    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && supportedLanguages.includes(editor.document.languageId)) {
            scssNavProvider.refresh();
        }
    });

    vscode.workspace.onDidOpenTextDocument((document) => {
        if (supportedLanguages.includes(document.languageId)) {
            scssNavProvider.refresh();
        }
    });

    context.subscriptions.push(openSectionDisposable, selectAllDisposable, replaceNavTabsDisposable);
}

export function deactivate() {}
