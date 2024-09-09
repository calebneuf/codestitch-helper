import * as vscode from 'vscode';
import { CodeSection } from '../providers/sectionNavigationProvider';

export function selectAll(section: CodeSection) {
    const document = section.document;
    
    const start = new vscode.Position(section.line - 1, 0);
    let end: vscode.Position;
    
    const text = document.getText();
    let nextSectionLine = document.lineCount - 1; // Default to the end of the document
    const sectionRegex = /<---+\s*(.+?)\s*--+>/g;
    let match;

    while ((match = sectionRegex.exec(text)) !== null) {
        const matchPosition = document.positionAt(match.index);
        if (matchPosition.line > section.line + 1) {
            nextSectionLine = matchPosition.line - 2;
            break;
        }
    }

    end = new vscode.Position(nextSectionLine, document.lineAt(nextSectionLine).range.end.character);
    vscode.window.showTextDocument(document, { selection: new vscode.Range(start, end) });
}
