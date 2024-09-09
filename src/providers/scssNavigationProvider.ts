import * as vscode from 'vscode';

export class SCSSNavigationProvider implements vscode.TreeDataProvider<SCSSSection> {
    private _onDidChangeTreeData: vscode.EventEmitter<SCSSSection | undefined | null | void> = new vscode.EventEmitter<SCSSSection | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<SCSSSection | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: SCSSSection): vscode.TreeItem {
        return element;
    }

    getChildren(element?: SCSSSection): Thenable<SCSSSection[]> {
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

    private getSectionsFromDocument(document: vscode.TextDocument): SCSSSection[] {
        const sections: SCSSSection[] = [];
        const text = document.getText();
    
        const sectionRegex = /<---+\s*(.+?)\s*--+>/g;
        const mediaWithCommentRegex = /\/\*\s*(.+?)\s*\*\/\s*\n\s*@media\s+only\s+screen\s+and\s+\(.+?\)/g;
    
        let match;
        let lastIndex = 0;
    
        while ((match = sectionRegex.exec(text)) !== null) {
            const line = document.positionAt(match.index).line;
            const sectionLabel = match[1].trim();
    
            const subsections: SCSSSection[] = [];
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
    
                subsections.push(new SCSSSection(`/* ${fullLabel} */`, mediaLine, document));
            }
    
            sections.push(new SCSSSection(sectionLabel, line, document, subsections.length ? subsections : undefined));
            lastIndex = sectionRegex.lastIndex = sectionEnd;
    
            if (!nextSectionMatch) {
                break;
            }
        }
    
        return sections;
    }
}

export class SCSSSection extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly line: number,
        public readonly document: vscode.TextDocument,
        public readonly children?: SCSSSection[]
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
