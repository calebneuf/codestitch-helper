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
exports.selectAll = selectAll;
const vscode = __importStar(require("vscode"));
function selectAll(section) {
    const document = section.document;
    const start = new vscode.Position(section.line - 1, 0);
    let end;
    const text = document.getText();
    let nextSectionLine = document.lineCount - 1; // Default to the end of the document
    const sectionRegex = /<---+\s*(.+?)\s*--+>/g;
    let match;
    while ((match = sectionRegex.exec(text)) !== null) {
        const matchPosition = document.positionAt(match.index);
        if (matchPosition.line > section.line + 1) {
            nextSectionLine = matchPosition.line - 2;
            break;
        }
    }
    end = new vscode.Position(nextSectionLine, document.lineAt(nextSectionLine).range.end.character);
    vscode.window.showTextDocument(document, { selection: new vscode.Range(start, end) });
}
//# sourceMappingURL=selectAll.js.map