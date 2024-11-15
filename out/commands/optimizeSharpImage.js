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
exports.optimizeSharpImage = optimizeSharpImage;
const vscode = __importStar(require("vscode"));
async function optimizeSharpImage(document, range) {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    const text = document.getText(range);
    // Extract the tag enclosing the src or srcset
    const tagStartIndex = text.lastIndexOf('<');
    const tagEndIndex = text.indexOf('>') + 1;
    const tagText = text.substring(tagStartIndex, tagEndIndex);
    let width = null;
    let height = null;
    if (/^<source\b/.test(tagText)) {
        // It's a <source> tag
        const mediaMatch = tagText.match(/media="([^"]+)"/);
        if (mediaMatch) {
            const mediaQuery = mediaMatch[1];
            // Find the enclosing <picture> tag
            const documentText = document.getText();
            const pictureStart = documentText.lastIndexOf('<picture', range.start.character);
            const pictureEnd = documentText.indexOf('</picture>', pictureStart) + '</picture>'.length;
            const pictureText = documentText.substring(pictureStart, pictureEnd);
            // Find the associated <img> tag within the <picture>
            const imgTagMatch = pictureText.match(/<img[^>]*>/);
            if (imgTagMatch) {
                const imgTag = imgTagMatch[0];
                const widthMatch = imgTag.match(/width="(\d+)"/);
                const heightMatch = imgTag.match(/height="(\d+)"/);
                const originalWidth = widthMatch ? parseInt(widthMatch[1], 10) : null;
                const originalHeight = heightMatch ? parseInt(heightMatch[1], 10) : null;
                if (/\(max-width:\s*600px\)/.test(mediaQuery)) {
                    // Mobile-specific dimensions
                    if (originalWidth && originalHeight) {
                        width = originalWidth > 600 ? 600 : originalWidth;
                        height = originalHeight;
                    }
                    else {
                        // Dimensions not found; do not resize
                        return;
                    }
                }
                else {
                    // Non-mobile <source>; use original dimensions
                    if (originalWidth && originalHeight) {
                        width = originalWidth;
                        height = originalHeight;
                    }
                    else {
                        // Dimensions not found; do not resize
                        return;
                    }
                }
            }
            else {
                // <img> tag not found; do not resize
                return;
            }
        }
    }
    else if (/^<img\b/.test(tagText)) {
        // It's an <img> tag
        const widthMatch = tagText.match(/width="(\d+)"/);
        const heightMatch = tagText.match(/height="(\d+)"/);
        width = widthMatch ? parseInt(widthMatch[1], 10) : null;
        height = heightMatch ? parseInt(heightMatch[1], 10) : null;
    }
    // If dimensions are not found, do not proceed with resizing
    if (width === null || height === null)
        return;
    // Extract src or srcset attribute
    const srcMatch = tagText.match(/(src|srcset)="([^"]+\.(jpg|JPG|jpeg|png|webp))"/i);
    if (!srcMatch)
        return; // No src or srcset found
    const attr = srcMatch[1];
    const path = srcMatch[2];
    // Construct the resize parameters
    let resizeParams = `{width: ${width}`;
    if (height !== null) {
        resizeParams += `, height: ${height}`;
    }
    resizeParams += `}`;
    // Construct the replacement
    const replacement = `${attr}="{% getUrl '${path}' | resize(${resizeParams}) | avif %}"`;
    // Replace only this specific instance in the converted text
    const converted = text.replace(srcMatch[0], replacement);
    await editor.edit(editBuilder => {
        editBuilder.replace(range, converted);
    });
}
//# sourceMappingURL=optimizeSharpImage.js.map