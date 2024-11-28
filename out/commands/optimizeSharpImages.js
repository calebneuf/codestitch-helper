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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeSharpImages = optimizeSharpImages;
const path_1 = __importDefault(require("path"));
const vscode = __importStar(require("vscode"));
const fs_1 = require("fs");
let isSharpImagesPluginInstalled = null;
async function optimizeSharpImages(document, range) {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    const text = document.getText(range);
    let converted = text;
    // Match each src or srcset individually
    const regex = /(src|srcset)="([^"]+\.(jpg|JPG|jpeg|png|webp))"/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        const fullMatch = match[0];
        const attr = match[1];
        const path = match[2];
        // Determine the tag enclosing this src or srcset
        const tagStartIndex = text.lastIndexOf("<", match.index);
        const tagEndIndex = text.indexOf(">", match.index) + 1;
        const tagText = text.substring(tagStartIndex, tagEndIndex);
        let width = null;
        let height = null;
        // Extract dimensions from the <img> tag
        const imgTagMatch = text.match(/<img[^>]*>/);
        let originalWidth = null;
        let originalHeight = null;
        if (imgTagMatch) {
            const imgTag = imgTagMatch[0];
            const widthMatch = imgTag.match(/width="(\d+)"/);
            const heightMatch = imgTag.match(/height="(\d+)"/);
            originalWidth = widthMatch ? parseInt(widthMatch[1], 10) : null;
            originalHeight = heightMatch ? parseInt(heightMatch[1], 10) : null;
        }
        if (/^<source\b/.test(tagText)) {
            // It's a <source> tag
            const mediaMatch = tagText.match(/media="([^"]+)"/);
            if (mediaMatch) {
                const mediaQuery = mediaMatch[1];
                if (/\(max-width:\s*600px\)/.test(mediaQuery)) {
                    // Mobile-specific dimensions
                    if (originalWidth !== null) {
                        width = Math.min(originalWidth, 600);
                    }
                    else {
                        width = 600; // Default to 600 if width not found
                    }
                    height = originalHeight; // Use the same height as the original image
                }
                else {
                    // Use original dimensions
                    width = originalWidth;
                    height = originalHeight;
                }
            }
        }
        else if (/^<img\b/.test(tagText)) {
            // It's an <img> tag
            width = originalWidth;
            height = originalHeight;
        }
        // Set default dimensions if none found
        if (width === null)
            width = 1000;
        if (height === null)
            height = 1000;
        // Construct the resize parameters
        let resizeParams = `{width: ${width}`;
        if (height !== null) {
            resizeParams += `, height: ${height}`;
        }
        resizeParams += `}`;
        // Construct the replacement for this specific src or srcset
        const replacement = `${attr}="{% getUrl '${path}' | resize(${resizeParams}) | avif %}"`;
        // Replace only this specific instance in the converted text
        converted = converted.replace(fullMatch, replacement);
    }
    if (isSharpImagesPluginInstalled === null) {
        isSharpImagesPluginInstalled = await checkIfSharpImagesPluginInstalled();
        if (!isSharpImagesPluginInstalled) {
            vscode.window
                .showWarningMessage("Sharp Images plugin is not installed.", "Install Now")
                .then((selection) => {
                if (selection === "Install Now") {
                    vscode.commands.executeCommand("codestitchHelper.setupEleventySharpImages");
                }
            });
        }
    }
    await editor.edit((editBuilder) => {
        editBuilder.replace(range, converted);
    });
}
async function checkIfSharpImagesPluginInstalled() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return false;
    }
    const workspacePath = workspaceFolders[0].uri.fsPath;
    // Check package.json for the plugin dependency
    const packageJsonPath = path_1.default.join(workspacePath, "package.json");
    try {
        const packageJsonData = await fs_1.promises.readFile(packageJsonPath, "utf8");
        const packageJson = JSON.parse(packageJsonData);
        const dependencies = packageJson.dependencies || {};
        const devDependencies = packageJson.devDependencies || {};
        const hasPluginDependency = "@codestitchofficial/eleventy-plugin-sharp-images" in dependencies ||
            "@codestitchofficial/eleventy-plugin-sharp-images" in devDependencies;
        if (!hasPluginDependency) {
            return false;
        }
    }
    catch {
        // package.json not found or not readable
        return false;
    }
    // Check .eleventy.js for plugin configuration
    const eleventyConfigPath = path_1.default.join(workspacePath, ".eleventy.js");
    try {
        const eleventyConfigData = await fs_1.promises.readFile(eleventyConfigPath, "utf8");
        if (!eleventyConfigData.includes("eleventyPluginSharpImages")) {
            return false;
        }
    }
    catch {
        // .eleventy.js not found or not readable
        return false;
    }
    // Plugin is installed and configured
    return true;
}
//# sourceMappingURL=optimizeSharpImages.js.map