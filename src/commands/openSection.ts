import * as vscode from 'vscode';
import { SCSSSection } from '../providers/scssNavigationProvider';

export function openSection(section: SCSSSection) {
    const document = section.document;
    const position = new vscode.Position(section.line, 0);
    vscode.window.showTextDocument(document, { selection: new vscode.Range(position, position) });
}
