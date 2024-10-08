import * as vscode from 'vscode';

export class SectionNavigationProvider implements vscode.TreeDataProvider<CodeSection> {
    private _onDidChangeTreeData: vscode.EventEmitter<CodeSection | undefined | null | void> = new vscode.EventEmitter<CodeSection | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<CodeSection | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: CodeSection): vscode.TreeItem {
        return element;
    }

    getChildren(element?: CodeSection): Thenable<CodeSection[]> {
        if (!vscode.window.activeTextEditor) {
            return Promise.resolve([]);
        }

        const document = vscode.window.activeTextEditor.document;

        if (element) {
            return Promise.resolve(element.children || []);
        } else {
            const sections = this.getSectionsFromDocument(document);
            return Promise.resolve(sections);
        }
    }

    private getSectionsFromDocument(document: vscode.TextDocument): CodeSection[] {
        const sections: CodeSection[] = [];
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
    
            const subsections: CodeSection[] = [];
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

export class CodeSection extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly line: number,
        public readonly document: vscode.TextDocument,
        public readonly children?: CodeSection[]
    ) {
        super(label, children ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
        
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

    tooltip: string;
    description: string;
}
