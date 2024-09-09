import * as vscode from 'vscode';
import { SectionNavigationProvider, CodeSection } from './providers/sectionNavigationProvider';
import { replaceNavTabs } from './commands/replaceNavTabs';
import { selectAll } from './commands/selectAll';
import { openSection } from './commands/openSection';
import { CodeLensProvider } from './providers/codeLensProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('codestitch-helper is now active!');
    
    const sectionNavProvider = new SectionNavigationProvider();
    vscode.window.registerTreeDataProvider('codestitchHelper', sectionNavProvider);

    const openSectionDisposable = vscode.commands.registerCommand('codestitchHelper.openSection', (section: CodeSection) => {
        openSection(section);
    });

    const selectAllDisposable = vscode.commands.registerCommand('codestitchHelper.selectAll', (section: CodeSection) => {
        selectAll(section);
    });

    const replaceNavTabsDisposable = vscode.commands.registerCommand('codestitchHelper.replaceNavTabs', (document: vscode.TextDocument) => {
        replaceNavTabs(document);
    });

    // Ensure the Explorer view is open
    vscode.commands.executeCommand('workbench.view.explorer'); // No need to focus on a specific view

    // Register CodeLensProvider for both HTML and SCSS
    context.subscriptions.push(vscode.languages.registerCodeLensProvider({ language: '*' }, new CodeLensProvider()));

    const supportedLanguages = ['scss', 'css', 'sass', 'less', 'njk', 'nunjucks', 'html'];
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (supportedLanguages.includes(event.document.languageId)) {
            sectionNavProvider.refresh();
        }
    });

    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && supportedLanguages.includes(editor.document.languageId)) {
            sectionNavProvider.refresh();
        }
    });

    vscode.workspace.onDidOpenTextDocument((document) => {
        if (supportedLanguages.includes(document.languageId)) {
            sectionNavProvider.refresh();
        }
    });

    context.subscriptions.push(openSectionDisposable, selectAllDisposable, replaceNavTabsDisposable);
}

export function deactivate() {}
