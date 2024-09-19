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
exports.convertToNetlifyForm = convertToNetlifyForm;
const vscode = __importStar(require("vscode"));
function convertToNetlifyForm(document) {
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
        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
        editBuilder.replace(fullRange, updatedText);
    });
}
//# sourceMappingURL=convertToNetlifyForm.js.map