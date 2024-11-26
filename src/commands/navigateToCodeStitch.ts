import * as vscode from "vscode";

export async function navigateToCodeStitch(sectionId: string) {
  const url = `https://codestitch.app/app/dashboard/catalog?search=${sectionId}`;
  await vscode.env.openExternal(vscode.Uri.parse(url));
}
