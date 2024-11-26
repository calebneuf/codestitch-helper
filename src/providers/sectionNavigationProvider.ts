import * as vscode from "vscode";
import { CodeSection, getSectionsFromDocument } from "../utils/sectionUtils";

export class SectionNavigationProvider
  implements vscode.TreeDataProvider<CodeSection>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    CodeSection | undefined | null | void
  > = new vscode.EventEmitter<CodeSection | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    CodeSection | undefined | null | void
  > = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: CodeSection): vscode.TreeItem {
    return element;
  }

  getChildren(element?: CodeSection): Thenable<CodeSection[]> {
    if (!vscode.window.activeTextEditor) {
      return Promise.resolve([]);
    }

    const document = vscode.window.activeTextEditor.document;

    if (element) {
      return Promise.resolve(element.children || []);
    } else {
      const sections = getSectionsFromDocument(document);
      return Promise.resolve(sections);
    }
  }
}
