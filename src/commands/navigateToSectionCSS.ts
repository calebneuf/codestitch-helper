import * as vscode from 'vscode';

// Initialize cache to store section ID to styling file path and position mappings
const cssCache: Map<string, { path: string; position: vscode.Position }> = new Map();

// Command identifier
export const navigateToSectionCSSCommandId = 'codestitchHelper.navigateToSectionCSS';

/**
 * Activates the extension and registers commands.
 * @param context The extension context
 */
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(navigateToSectionCSSCommandId, navigateToSectionCSS)
  );
}

/**
 * Navigates to the styling file (SCSS, LESS, or CSS) for a given section ID and jumps to the style definition.
 * @param document The current text document
 * @param range The range of the section tag
 */
export async function navigateToSectionCSS(document: vscode.TextDocument, range: vscode.Range) {
  const text = document.getText(range);
  const idMatch = text.match(/id="([^"]+)"/);

  if (idMatch) {
    const sectionId = idMatch[1];
    let cacheEntry = cssCache.get(sectionId);
    let stylingPath: string | undefined;
    let position: vscode.Position | undefined;

    if (cacheEntry) {
      stylingPath = cacheEntry.path;
      position = cacheEntry.position;
    } else {
      const patterns = ['**/*.scss', '**/*.less', '**/*.css'];
      outerLoop: for (const pattern of patterns) {
        const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**');
        for (const file of files) {
          const contentBytes = await vscode.workspace.fs.readFile(file);
          const content = contentBytes.toString();
          const lines = content.split(/\r?\n/);

          for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
            const line = lines[lineNumber];
            // Adjust the match pattern according to the CSS preprocessor syntax if needed
            if (line.includes(`#${sectionId}`)) {
              stylingPath = file.fsPath;
              position = new vscode.Position(lineNumber, line.indexOf(`#${sectionId}`));
              cssCache.set(sectionId, { path: stylingPath, position });
              break outerLoop;
            }
          }
        }
      }
    }

    if (stylingPath && position) {
      const uri = vscode.Uri.file(stylingPath);
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc, {
        selection: new vscode.Range(position, position),
      });
      vscode.window.showInformationMessage(`Navigated to styling for section ID "${sectionId}".`);
    } else {
      vscode.window.showErrorMessage(`Styling for section ID "${sectionId}" not found.`);
    }
  } else {
    vscode.window.showErrorMessage('No section ID found in the selected range.');
  }
}