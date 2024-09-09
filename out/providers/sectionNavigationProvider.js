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
exports.CodeSection = exports.SectionNavigationProvider = void 0;
const vscode = __importStar(require("vscode"));
class SectionNavigationProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!vscode.window.activeTextEditor) {
            return Promise.resolve([]);
        }
        const document = vscode.window.activeTextEditor.document;
        if (element) {
            return Promise.resolve(element.children || []);
        }
        else {
            const sections = this.getSectionsFromDocument(document);
            return Promise.resolve(sections);
        }
    }
    getSectionsFromDocument(document) {
        const sections = [];
        const text = document.getText();
        // Updated regex to match both arrow-style and valid HTML comment sections
        const sectionRegex = /<---+\s*(.+?)\s*--+>|<!--+\s*([a-zA-Z0-9\s]+?)\s*--+>\s*<!--+\s*[-=]+\s*--+>/g;
        const mediaWithCommentRegex = /\/\*\s*(.+?)\s*\*\/\s*\n\s*@media\s+only\s+screen\s+and\s+\(.+?\)/g;
        let match;
        let lastIndex = 0;
        // Reset the regex state by setting lastIndex to 0 before the loop
        sectionRegex.lastIndex = 0;
        mediaWithCommentRegex.lastIndex = 0;
        while ((match = sectionRegex.exec(text)) !== null) {
            const line = document.positionAt(match.index).line;
            // Capture the section label from either match[1] (arrow-style) or match[2] (HTML-style)
            const sectionLabel = (match[1] || match[2]).trim();
            const subsections = [];
            let mediaMatch;
            const sectionStart = match.index;
            lastIndex = sectionRegex.lastIndex;
            // Find the next section or the end of the document
            let nextSectionMatch = sectionRegex.exec(text);
            const sectionEnd = nextSectionMatch ? nextSectionMatch.index : text.length;
            // Look for media queries within the current section
            mediaWithCommentRegex.lastIndex = lastIndex;
            while ((mediaMatch = mediaWithCommentRegex.exec(text)) !== null) {
                const mediaIndex = mediaMatch.index;
                // Stop if media query is beyond the current section
                if (mediaIndex >= sectionEnd) {
                    break;
                }
                const commentLabel = mediaMatch[1].trim();
                const fullLabel = `${commentLabel} @media`;
                const mediaLine = document.positionAt(mediaIndex).line;
                subsections.push(new CodeSection(`/* ${fullLabel} */`, mediaLine, document));
            }
            // Add the section with possible subsections
            sections.push(new CodeSection(sectionLabel, line, document, subsections.length ? subsections : undefined));
            // Move to the next section
            lastIndex = sectionRegex.lastIndex = sectionEnd;
            if (!nextSectionMatch) {
                break;
            }
            // Reset sectionRegex lastIndex to ensure it can re-execute
            sectionRegex.lastIndex = lastIndex;
        }
        return sections;
    }
}
exports.SectionNavigationProvider = SectionNavigationProvider;
class CodeSection extends vscode.TreeItem {
    label;
    line;
    document;
    children;
    constructor(label, line, document, children) {
        super(label, children ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.line = line;
        this.document = document;
        this.children = children;
        this.command = {
            command: 'codestitchHelper.openSection',
            title: 'Open Section',
            arguments: [this]
        };
        this.tooltip = `${label} (line ${line + 1})`;
        this.description = `Line ${line + 1}`;
        if (children) {
            this.contextValue = 'selectableSection';
        }
    }
    tooltip;
    description;
}
exports.CodeSection = CodeSection;
//# sourceMappingURL=sectionNavigationProvider.js.map