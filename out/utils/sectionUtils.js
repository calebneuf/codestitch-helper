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
exports.CodeSection = void 0;
exports.getSectionsFromDocument = getSectionsFromDocument;
exports.findNextSectionLine = findNextSectionLine;
exports.selectSection = selectSection;
const vscode = __importStar(require("vscode"));
class CodeSection extends vscode.TreeItem {
    label;
    line;
    document;
    children;
    constructor(label, line, document, children) {
        super(label, children
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.line = line;
        this.document = document;
        this.children = children;
        this.command = {
            command: "codestitchHelper.openSection",
            title: "Open Section",
            arguments: [this],
        };
        this.tooltip = `${label} (line ${line + 1})`;
        this.description = `Line ${line + 1}`;
        if (children) {
            this.contextValue = "selectableSection";
        }
    }
    tooltip;
    description;
    getText() {
        const range = selectSection(this.document, this.line);
        return this.document.getText(range);
    }
}
exports.CodeSection = CodeSection;
function getSectionsFromDocument(document) {
    const sections = [];
    const text = document.getText();
    const sectionRegex = /<---+\s*(.+?)\s*--+>|<!--+\s*([a-zA-Z0-9\s]+?)\s*--+>\s*<!--+\s*[-=]+\s*--+>/g;
    const mediaWithCommentRegex = /\/\*\s*(.+?)\s*\*\/\s*\n\s*@media\s+only\s+screen\s+and\s+\(.+?\)/g;
    let match;
    let lastIndex = 0;
    sectionRegex.lastIndex = 0;
    mediaWithCommentRegex.lastIndex = 0;
    while ((match = sectionRegex.exec(text)) !== null) {
        const line = document.positionAt(match.index).line;
        let sectionLabel = (match[1] || match[2]).trim();
        const idMatch = text
            .slice(sectionRegex.lastIndex)
            .match(/#([A-Za-z0-9_-]+)\s*\{|section\s+id="([A-Za-z0-9_-]+)"/);
        if (idMatch) {
            sectionLabel += ` "${idMatch[1] || idMatch[2]}"`;
        }
        const subsections = [];
        let mediaMatch;
        const sectionStart = match.index;
        lastIndex = sectionRegex.lastIndex;
        let nextSectionMatch = sectionRegex.exec(text);
        const sectionEnd = nextSectionMatch ? nextSectionMatch.index : text.length;
        mediaWithCommentRegex.lastIndex = lastIndex;
        while ((mediaMatch = mediaWithCommentRegex.exec(text)) !== null) {
            const mediaIndex = mediaMatch.index;
            if (mediaIndex >= sectionEnd) {
                break;
            }
            const commentLabel = mediaMatch[1].trim();
            const fullLabel = `${commentLabel} @media`;
            const mediaLine = document.positionAt(mediaIndex).line;
            subsections.push(new CodeSection(`/* ${fullLabel} */`, mediaLine, document));
        }
        sections.push(new CodeSection(sectionLabel, line, document, subsections.length ? subsections : undefined));
        lastIndex = sectionRegex.lastIndex = sectionEnd;
        if (!nextSectionMatch) {
            break;
        }
        sectionRegex.lastIndex = lastIndex;
    }
    return sections;
}
function findNextSectionLine(document, startLine) {
    const text = document.getText();
    const sectionRegex = /<---+\s*(.+?)\s*--+>|<!--+\s*([a-zA-Z0-9\s]+?)\s*--+>\s*<!--+\s*[-=]+\s*--+>/g;
    let match;
    while ((match = sectionRegex.exec(text)) !== null) {
        const matchPosition = document.positionAt(match.index);
        if (matchPosition.line > startLine) {
            return matchPosition.line;
        }
    }
    return document.lineCount;
}
function selectSection(document, startLine) {
    const start = new vscode.Position(startLine - 1, 0);
    // Find the start line of the next section
    const nextSectionLine = findNextSectionLine(document, startLine + 1);
    const documentEndLine = document.lineCount - 1;
    // Use the next section's line or end of document as the initial end line
    let endLine = nextSectionLine !== -1 ? nextSectionLine - 1 : documentEndLine;
    // Trace back to find the last '}' character
    for (let line = endLine; line >= startLine; line--) {
        const lineText = document.lineAt(line).text;
        const lastBraceIndex = lineText.lastIndexOf("}");
        if (lastBraceIndex !== -1) {
            endLine = line;
            break;
        }
    }
    const end = new vscode.Position(endLine, document.lineAt(endLine).text.length);
    return new vscode.Range(start, end);
}
//# sourceMappingURL=sectionUtils.js.map