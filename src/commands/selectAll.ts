import * as vscode from "vscode";
import { CodeSection, selectSection } from "../utils/sectionUtils";

export function selectAll(section: CodeSection) {
  const document = section.document;
  const range = selectSection(document, section.line);

  vscode.window.showTextDocument(document, {
    selection: range,
  });
}
