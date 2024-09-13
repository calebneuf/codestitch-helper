import * as vscode from 'vscode';

export class CodeLensProvider implements vscode.CodeLensProvider {
    onDidChangeCodeLenses?: vscode.Event<void> | undefined;

    provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] {
        const codeLenses: vscode.CodeLens[] = [];
        const text = document.getText();

        // Regex to find the <div class="cs-ul-wrapper"> line
        const divPattern = /<div class="cs-ul-wrapper">[\s\S]*?<\/div>/g;
        let match;
        while ((match = divPattern.exec(text)) !== null) {
            const startPosition = document.positionAt(match.index);
            const endPosition = document.positionAt(match.index + match[0].length);  // Find the full <div> tag
            const range = new vscode.Range(startPosition, endPosition);

            // Create a new CodeLens above the <div>
            codeLenses.push(new vscode.CodeLens(range, {
                title: "Make compatible with 11ty",
                command: "codestitchHelper.replaceNavTabs",
                arguments: [document]
            }));
        }

        // Regex to find <svg> tags without the class "cs-icon"
        const svgPattern = /<svg([^>]*?)>/g;
        while ((match = svgPattern.exec(text)) !== null) {
            const startPosition = document.positionAt(match.index);
            const endPosition = document.positionAt(match.index + match[0].length);  // Find the full <svg> tag
            const range = new vscode.Range(startPosition, endPosition);

            // Check if the svg tag already has the cs-icon class
            if (!match[0].includes('class="cs-icon"')) {
                codeLenses.push(new vscode.CodeLens(range, {
                    title: "Add cs-icon class",
                    command: "codestitchHelper.addIconClass",
                    arguments: [document, range]
                }));
            }
        }

        return codeLenses;
    }
}
