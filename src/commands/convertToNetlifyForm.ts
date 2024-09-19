import * as vscode from 'vscode';

export function convertToNetlifyForm(document: vscode.TextDocument) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const text = document.getText();
    const formPattern = /<form[\s\S]*?>/g;
    let match;
    let updatedText = text;

    while ((match = formPattern.exec(text)) !== null) {
        const formTag = match[0];

        // Check if the form already has Netlify attributes
        if (!formTag.includes('data-netlify="true"')) {
            const netlifyFormTag = formTag.replace('<form', '<form data-netlify="true"');
            updatedText = updatedText.replace(formTag, netlifyFormTag);
        }
    }

    // Add the recaptcha div before the submit button
    const recaptchaDiv = '<div data-netlify-recaptcha="true"></div>';
    const buttonPattern = /<button[\s\S]*?<\/button>/g;
    const buttonMatch = buttonPattern.exec(updatedText);
    if (buttonMatch && !updatedText.includes(recaptchaDiv)) {
        updatedText = updatedText.replace(buttonMatch[0], recaptchaDiv + '\n' + buttonMatch[0]);
    }

    editor.edit((editBuilder) => {
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(text.length)
        );
        editBuilder.replace(fullRange, updatedText);
    });
}
