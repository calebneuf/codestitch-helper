import * as vscode from "vscode";

export async function optimizeStylesheet(
  document: vscode.TextDocument,
  linkTag: string
) {
  const edit = new vscode.WorkspaceEdit();

  // Create the optimized version of the link tag
  const href = linkTag.match(/href=["']([^"']+)["']/)?.[1];
  if (!href) return;

  const optimizedLink = `<link rel="stylesheet" href="${href}" media="print" onload="this.media='all'; this.onload=null;">
    <noscript>
        <link rel="stylesheet" href="${href}" />
    </noscript>`;

  // Get the range of the original link tag
  const text = document.getText();
  const index = text.indexOf(linkTag);
  const startPos = document.positionAt(index);
  const endPos = document.positionAt(index + linkTag.length);

  // Replace the original with optimized version
  edit.replace(document.uri, new vscode.Range(startPos, endPos), optimizedLink);

  await vscode.workspace.applyEdit(edit);
}
