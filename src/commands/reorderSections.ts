import * as vscode from "vscode";
import { getSectionsFromDocument, CodeSection } from "../utils/sectionUtils";

export async function reorderSections() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor");
    return;
  }

  const styleDocument = editor.document;
  const styleLanguageId = styleDocument.languageId;

  if (!["css", "scss", "less"].includes(styleLanguageId)) {
    vscode.window.showErrorMessage("The current file is not a style file.");
    return;
  }

  try {
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Reordering sections...",
        cancellable: false,
      },
      async () => {
        const htmlFiles = await vscode.workspace.findFiles(
          "src/**/*.{html,njk}",
          "**/node_modules/**"
        );
        if (htmlFiles.length === 0) {
          throw new Error("No HTML files found under /src/.");
        }

        let htmlUri: vscode.Uri;
        if (htmlFiles.length > 1) {
          const selected = await vscode.window.showQuickPick(
            htmlFiles.map((file) => ({
              label: vscode.workspace.asRelativePath(file),
              uri: file,
            })),
            { placeHolder: "Select an HTML file to use for ordering" }
          );
          if (!selected) return;
          htmlUri = selected.uri;
        } else {
          htmlUri = htmlFiles[0];
        }

        const htmlDocument = await vscode.workspace.openTextDocument(htmlUri);
        const htmlSections = getSectionsFromDocument(htmlDocument);
        const styleSections = getSectionsFromDocument(styleDocument);

        // Create a map from style section IDs to style sections
        const styleSectionMap = new Map<string, CodeSection>();
        for (const section of styleSections) {
          const sectionIdMatch = section.label.match(/"(.+?)"/);
          const sectionId = sectionIdMatch ? sectionIdMatch[1] : null;
          if (sectionId) {
            styleSectionMap.set(sectionId, section);
          }
        }

        // Assemble the usedStyleSections in the order of htmlSections
        const orderedUsedStyleSections: CodeSection[] = [];
        for (const htmlSection of htmlSections) {
          const sectionIdMatch = htmlSection.label.match(/"(.+?)"/);
          const sectionId = sectionIdMatch ? sectionIdMatch[1] : null;
          if (sectionId && styleSectionMap.has(sectionId)) {
            orderedUsedStyleSections.push(styleSectionMap.get(sectionId)!);
            // Remove matched sections from the map
            styleSectionMap.delete(sectionId);
          }
        }

        // Remaining style sections are unused
        const unusedStyleSections = Array.from(styleSectionMap.values());

        // Prompt the user for handling unused styles
        const userChoice = await vscode.window.showQuickPick(
          ["Remove unused style sections", "Place unused styles at the end"],
          { placeHolder: "What do you want to do with unused style sections?" }
        );

        // Assemble the final style content
        const newStyleContent = orderedUsedStyleSections
          .map((section) => section.getText())
          .join("\n\n");

        const unusedStyleContent = unusedStyleSections
          .map((section) => section.getText())
          .join("\n\n");

        const finalStyleContent =
          userChoice === "Remove unused style sections"
            ? newStyleContent
            : `${newStyleContent}\n\n/* Unused Styles */\n\n${unusedStyleContent}`;

        // Apply the edits to the style document
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
          styleDocument.positionAt(0),
          styleDocument.positionAt(styleDocument.getText().length)
        );
        edit.replace(styleDocument.uri, fullRange, finalStyleContent);
        await vscode.workspace.applyEdit(edit);

        vscode.window.showInformationMessage(
          "Sections reordered successfully."
        );
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(
        `Error reordering sections: ${error.message}`
      );
    }
  }
}
