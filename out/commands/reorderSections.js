"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderSections = reorderSections;
const vscode = __importStar(require("vscode"));
const sectionUtils_1 = require("../utils/sectionUtils");
async function reorderSections() {
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
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Reordering sections...",
            cancellable: false,
        }, async () => {
            const htmlFiles = await vscode.workspace.findFiles("src/**/*.{html,njk}", "**/node_modules/**");
            if (htmlFiles.length === 0) {
                throw new Error("No HTML files found under /src/.");
            }
            let htmlUri;
            if (htmlFiles.length > 1) {
                const selected = await vscode.window.showQuickPick(htmlFiles.map((file) => ({
                    label: vscode.workspace.asRelativePath(file),
                    uri: file,
                })), { placeHolder: "Select an HTML file to use for ordering" });
                if (!selected)
                    return;
                htmlUri = selected.uri;
            }
            else {
                htmlUri = htmlFiles[0];
            }
            const htmlDocument = await vscode.workspace.openTextDocument(htmlUri);
            const htmlSections = (0, sectionUtils_1.getSectionsFromDocument)(htmlDocument);
            const styleSections = (0, sectionUtils_1.getSectionsFromDocument)(styleDocument);
            // Create a map from style section IDs to style sections
            const styleSectionMap = new Map();
            for (const section of styleSections) {
                const sectionIdMatch = section.label.match(/"(.+?)"/);
                const sectionId = sectionIdMatch ? sectionIdMatch[1] : null;
                if (sectionId) {
                    styleSectionMap.set(sectionId, section);
                }
            }
            // Assemble the usedStyleSections in the order of htmlSections
            const orderedUsedStyleSections = [];
            for (const htmlSection of htmlSections) {
                const sectionIdMatch = htmlSection.label.match(/"(.+?)"/);
                const sectionId = sectionIdMatch ? sectionIdMatch[1] : null;
                if (sectionId && styleSectionMap.has(sectionId)) {
                    orderedUsedStyleSections.push(styleSectionMap.get(sectionId));
                    // Remove matched sections from the map
                    styleSectionMap.delete(sectionId);
                }
            }
            // Remaining style sections are unused
            const unusedStyleSections = Array.from(styleSectionMap.values());
            // Prompt the user for handling unused styles
            const userChoice = await vscode.window.showQuickPick(["Remove unused style sections", "Place unused styles at the end"], { placeHolder: "What do you want to do with unused style sections?" });
            // Assemble the final style content
            const newStyleContent = orderedUsedStyleSections
                .map((section) => section.getText())
                .join("\n\n");
            const unusedStyleContent = unusedStyleSections
                .map((section) => section.getText())
                .join("\n\n");
            const finalStyleContent = userChoice === "Remove unused style sections"
                ? newStyleContent
                : `${newStyleContent}\n\n/* Unused Styles */\n\n${unusedStyleContent}`;
            // Apply the edits to the style document
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(styleDocument.positionAt(0), styleDocument.positionAt(styleDocument.getText().length));
            edit.replace(styleDocument.uri, fullRange, finalStyleContent);
            await vscode.workspace.applyEdit(edit);
            vscode.window.showInformationMessage("Sections reordered successfully.");
        });
    }
    catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error reordering sections: ${error.message}`);
        }
    }
}
//# sourceMappingURL=reorderSections.js.map