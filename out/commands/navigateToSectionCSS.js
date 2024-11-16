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
exports.navigateToSectionCSSCommandId = void 0;
exports.activate = activate;
exports.navigateToSectionCSS = navigateToSectionCSS;
const vscode = __importStar(require("vscode"));
// Initialize cache to store section ID to styling file path and position mappings
const cssCache = new Map();
// Command identifier
exports.navigateToSectionCSSCommandId = 'codestitchHelper.navigateToSectionCSS';
/**
 * Activates the extension and registers commands.
 * @param context The extension context
 */
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand(exports.navigateToSectionCSSCommandId, navigateToSectionCSS));
}
/**
 * Navigates to the styling file (SCSS, LESS, or CSS) for a given section ID and jumps to the style definition.
 * @param document The current text document
 * @param range The range of the section tag
 */
async function navigateToSectionCSS(document, range) {
    const text = document.getText(range);
    const idMatch = text.match(/id="([^"]+)"/);
    if (idMatch) {
        const sectionId = idMatch[1];
        let cacheEntry = cssCache.get(sectionId);
        let stylingPath;
        let position;
        if (cacheEntry) {
            stylingPath = cacheEntry.path;
            position = cacheEntry.position;
        }
        else {
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
        }
        else {
            vscode.window.showErrorMessage(`Styling for section ID "${sectionId}" not found.`);
        }
    }
    else {
        vscode.window.showErrorMessage('No section ID found in the selected range.');
    }
}
//# sourceMappingURL=navigateToSectionCSS.js.map