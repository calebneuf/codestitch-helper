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
exports.optimizeStylesheet = optimizeStylesheet;
const vscode = __importStar(require("vscode"));
async function optimizeStylesheet(document, linkTag) {
    const edit = new vscode.WorkspaceEdit();
    // Create the optimized version of the link tag
    const href = linkTag.match(/href=["']([^"']+)["']/)?.[1];
    if (!href)
        return;
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
//# sourceMappingURL=optimizeStylesheet.js.map