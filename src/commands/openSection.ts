import * as vscode from "vscode";
import { CodeSection } from "../utils/sectionUtils";

export function openSection(section: CodeSection) {
  const document = section.document;
  const position = new vscode.Position(section.line, 0);
  vscode.window.showTextDocument(document, {
    selection: new vscode.Range(position, position),
  });
}
