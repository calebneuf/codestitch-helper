import * as vscode from 'vscode';

export function addIconClass(document: vscode.TextDocument, range: vscode.Range) {
    const editor = vscode.window.activeTextEditor;

    if (!editor || editor.document.uri.toString() !== document.uri.toString()) {
        vscode.window.showErrorMessage('The active editor does not match the document.');
        return;
    }

    console.log('Range start:', range.start);
    console.log('Range end:', range.end);

    // Get the text at the range
    const svgTag = document.getText(range);
    console.log('Original SVG tag:', svgTag);

    if (!svgTag.includes('<svg')) {
        vscode.window.showErrorMessage('No valid <svg> tag found at this range.');
        return;
    }

    // Find the end of the <svg> tag for the full range
    const svgTagEnd = svgTag.indexOf('>') + 1;
    if (svgTagEnd === 0) {
        vscode.window.showErrorMessage('No closing ">" found for the <svg> tag.');
        return;
    }

    // Calculate the range that includes the full <svg> tag
    const fullRange = new vscode.Range(
        range.start,
        document.positionAt(document.offsetAt(range.start) + svgTagEnd)
    );

    console.log('Full range:', fullRange);

    editor.edit(editBuilder => {
        let updatedSvgTag;

        // Check if the <svg> tag has a class attribute
        if (svgTag.includes('class=')) {
            console.log('Adding cs-icon to existing class attribute.');
            // Add cs-icon to the existing class attribute
            updatedSvgTag = svgTag.replace(/class="([^"]*?)"/, 'class="$1 cs-icon"');
        } else {
            console.log('Adding new class attribute with cs-icon.');
            // Add a class attribute if none exists
            updatedSvgTag = svgTag.replace('<svg', '<svg class="cs-icon"');
        }

        console.log('Updated SVG tag:', updatedSvgTag);

        // Replace the full <svg> tag in the document
        editBuilder.replace(fullRange, updatedSvgTag);
    }).then(success => {
        if (success) {
            console.log('Successfully added cs-icon class!');
            vscode.window.showInformationMessage('cs-icon class added to SVG!');
        } else {
            console.log('Failed to apply the edit.');
            vscode.window.showErrorMessage('Failed to add cs-icon class!');
        }
    });
}
