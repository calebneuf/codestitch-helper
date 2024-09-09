import * as vscode from 'vscode';

export class CodeLensProvider implements vscode.CodeLensProvider {
    onDidChangeCodeLenses?: vscode.Event<void> | undefined;

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] {
        const codeLenses: vscode.CodeLens[] = [];
        const text = document.getText();

        // Regex to find the <div class="cs-ul-wrapper"> line
        const divPattern = /<div class="cs-ul-wrapper">/g;
        let match;
        while ((match = divPattern.exec(text)) !== null) {
            const position = document.positionAt(match.index);
            const range = new vscode.Range(position, position);

            // Create a new CodeLens above the <div>
            codeLenses.push(new vscode.CodeLens(range, {
                title: "Make compatible with 11ty",
                command: "codestitchHelper.replaceNavTabs",
                arguments: [document]
            }));
        }

        return codeLenses;
    }
}
