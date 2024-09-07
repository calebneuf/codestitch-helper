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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    console.log('codestitch-helper is now active!');
    // Initialize SCSSNavigationProvider
    const scssNavProvider = new SCSSNavigationProvider();
    vscode.window.registerTreeDataProvider('codestitchHelper', scssNavProvider);
    // Command to open a section
    const openSectionDisposable = vscode.commands.registerCommand('codestitchHelper.openSection', (section) => {
        const document = section.document;
        const position = new vscode.Position(section.line, 0);
        vscode.window.showTextDocument(document, { selection: new vscode.Range(position, position) });
    });
    // Command to select all text in a section
    const selectAllDisposable = vscode.commands.registerCommand('codestitchHelper.selectAll', (section) => {
        const document = section.document;
        // Start at the line where the section begins
        const start = new vscode.Position(section.line - 1, 0);
        // Find the end of the section: either the start of the next top-level section or the end of the document
        let end;
        const text = document.getText();
        let nextSectionLine = document.lineCount - 1; // Default to end of document
        // Regex to match the top section (like <-- Section Name -->)
        const sectionRegex = /<---+\s*(.+?)\s*--+>/g;
        let match;
        // Find the next top-level section after the current one
        while ((match = sectionRegex.exec(text)) !== null) {
            const matchPosition = document.positionAt(match.index);
            if (matchPosition.line > section.line + 1) {
                // Set the next section line to just before the next top-level section
                nextSectionLine = matchPosition.line - 2;
                break;
            }
        }
        // Set the end position 1 line before the next section or the end of the document
        end = new vscode.Position(nextSectionLine, document.lineAt(nextSectionLine).range.end.character);
        // Show the document and select the section range
        vscode.window.showTextDocument(document, { selection: new vscode.Range(start, end) });
        // Copy the selected section text to the clipboard
        vscode.env.clipboard.writeText(document.getText(new vscode.Range(start, end)));
    });
    // Add document change listeners to auto-refresh the tree when the SCSS file is modified or opened
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'scss') {
            scssNavProvider.refresh();
        }
    });
    // Listen for editor change and refresh the tree view when switching between files
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document.languageId === 'scss') {
            scssNavProvider.refresh();
        }
    });
    vscode.workspace.onDidOpenTextDocument((document) => {
        if (document.languageId === 'scss') {
            scssNavProvider.refresh();
        }
    });
    // Add both commands to subscriptions for proper disposal
    context.subscriptions.push(openSectionDisposable, selectAllDisposable);
}
class SCSSNavigationProvider {
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
        // Improved regex to match section headers like <--- Side By Side --->
        const sectionRegex = /<---+\s*(.+?)\s*--+>/g;
        // Regex to match both comments and media queries (e.g., /* Mobile - 360px */ followed by @media)
        const mediaWithCommentRegex = /\/\*\s*(.+?)\s*\*\/\s*\n\s*@media\s+only\s+screen\s+and\s+\(.+?\)/g;
        let match;
        let lastIndex = 0;
        while ((match = sectionRegex.exec(text)) !== null) {
            const line = document.positionAt(match.index).line;
            const sectionLabel = match[1].trim();
            console.log(`Matched section: ${sectionLabel} at line: ${line}`);
            const subsections = [];
            let mediaMatch;
            const sectionStart = match.index;
            lastIndex = sectionRegex.lastIndex;
            let nextSectionMatch = sectionRegex.exec(text);
            const sectionEnd = nextSectionMatch ? nextSectionMatch.index : text.length;
            console.log(`Section starts at index: ${sectionStart}, ends at index: ${sectionEnd}`);
            mediaWithCommentRegex.lastIndex = lastIndex;
            // Only add a single entry for both the comment and media query
            while ((mediaMatch = mediaWithCommentRegex.exec(text)) !== null) {
                const mediaIndex = mediaMatch.index;
                if (mediaIndex >= sectionEnd) {
                    break;
                }
                const commentLabel = mediaMatch[1].trim(); // Extract the comment (e.g., "Mobile - 360px")
                const fullLabel = `${commentLabel} @media`; // Combine comment and media query
                const mediaLine = document.positionAt(mediaIndex).line;
                console.log(`Matched media query: ${fullLabel} at line: ${mediaLine}`);
                // Add combined comment and media query as a single subsection
                subsections.push(new SCSSSection(`/* ${fullLabel} */`, mediaLine, document));
            }
            // Add the section with its combined subsections (if any)
            sections.push(new SCSSSection(sectionLabel, line, document, subsections.length ? subsections : undefined));
            console.log(`Pushed section: ${sectionLabel} to tree`);
            lastIndex = sectionRegex.lastIndex = sectionEnd;
            if (!nextSectionMatch) {
                console.log(`No next section found after: ${sectionLabel}`);
                break;
            }
        }
        return sections;
    }
}
class SCSSSection extends vscode.TreeItem {
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
        // Set the command to open the section on click
        this.command = {
            command: 'codestitchHelper.openSection',
            title: 'Open Section',
            arguments: [this]
        };
        // Initialize tooltip and description
        this.tooltip = `${label} (line ${line + 1})`;
        this.description = `Line ${line + 1}`;
        if (children) {
            this.contextValue = 'selectableSection';
        }
    }
    // Make sure the tooltip and description are initialized here
    tooltip;
    description;
}
function deactivate() { }
//# sourceMappingURL=extension.js.map