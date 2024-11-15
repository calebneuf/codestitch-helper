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
exports.CodeLensProvider = void 0;
const vscode = __importStar(require("vscode"));
const navigateToSectionCSS_1 = require("../commands/navigateToSectionCSS");
class CodeLensProvider {
    onDidChangeCodeLenses;
    provideCodeLenses(document, token) {
        const codeLenses = [];
        const text = document.getText();
        let match;
        // Regex to find the <div class="cs-ul-wrapper"> line
        const divPattern = /<div class="cs-ul-wrapper">[\s\S]*?<\/div>/g;
        while ((match = divPattern.exec(text)) !== null) {
            const startPosition = document.positionAt(match.index);
            const endPosition = document.positionAt(match.index + match[0].length); // Find the full <div> tag
            const range = new vscode.Range(startPosition, endPosition);
            // Create a new CodeLens above the <div>
            codeLenses.push(new vscode.CodeLens(range, {
                title: "Make compatible with 11ty",
                command: "codestitchHelper.replaceNavTabs",
                arguments: [document],
            }));
        }
        const formPattern = /<form[\s\S]*?>/g;
        while ((match = formPattern.exec(text)) !== null) {
            const startPosition = document.positionAt(match.index);
            const endPosition = document.positionAt(match.index + match[0].length); // Find the full <form> tag
            const range = new vscode.Range(startPosition, endPosition);
            // Create a new CodeLens above the form tag
            codeLenses.push(new vscode.CodeLens(range, {
                title: "Convert to Netlify Form",
                command: "codestitchHelper.convertToNetlifyForm",
                arguments: [document],
            }));
        }
        // Regex to find <svg> tags without the class "cs-icon"
        const svgPattern = /<svg([^>]*?)>/g;
        while ((match = svgPattern.exec(text)) !== null) {
            const startPosition = document.positionAt(match.index);
            const endPosition = document.positionAt(match.index + match[0].length); // Find the full <svg> tag
            const range = new vscode.Range(startPosition, endPosition);
            // Check if the svg tag already has the cs-icon class
            if (!match[0].includes('class="cs-icon"')) {
                codeLenses.push(new vscode.CodeLens(range, {
                    title: "Add cs-icon class",
                    command: "codestitchHelper.addIconClass",
                    arguments: [document, range],
                }));
            }
        }
        // Regex to find any <picture> tags regardless of attributes
        const picturePattern = /<picture\b[^>]*>[\s\S]*?<\/picture>/g;
        while ((match = picturePattern.exec(text)) !== null) {
            const startPosition = document.positionAt(match.index);
            const endPosition = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPosition, endPosition);
            // Add lens for the entire picture block
            codeLenses.push(new vscode.CodeLens(range, {
                title: "Optimize sharp images",
                command: "codestitchHelper.optimizeSharpImages",
                arguments: [document, range],
            }));
        }
        // Regex to find <section> tags with an id attribute
        const sectionPattern = /<section[^>]*id="([^"]+)"[^>]*>/g;
        while ((match = sectionPattern.exec(text)) !== null) {
            const startPosition = document.positionAt(match.index);
            const endPosition = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPosition, endPosition);
            // Create a new CodeLens above the section tag
            codeLenses.push(new vscode.CodeLens(range, {
                title: "Go to Styling",
                command: navigateToSectionCSS_1.navigateToSectionCSSCommandId,
                arguments: [document, range],
            }));
        }
        return codeLenses;
    }
}
exports.CodeLensProvider = CodeLensProvider;
//# sourceMappingURL=codeLensProvider.js.map