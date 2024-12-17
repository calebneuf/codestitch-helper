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
exports.downloadSvgAssets = downloadSvgAssets;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const https = __importStar(require("https"));
async function downloadSvgAssets() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage("No workspace folder is open.");
        return;
    }
    // Prompt the user to select the directory to search
    const searchUri = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        openLabel: "Select directory to search for SVG URLs",
        defaultUri: workspaceFolders[0].uri,
    });
    if (!searchUri || searchUri.length === 0) {
        vscode.window.showWarningMessage("No search directory selected.");
        return;
    }
    const searchDirectory = searchUri[0];
    // Prompt the user to select the directory to save SVGs
    const saveUri = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        openLabel: "Select directory to save SVGs",
        defaultUri: workspaceFolders[0].uri,
    });
    if (!saveUri || saveUri.length === 0) {
        vscode.window.showWarningMessage("No save directory selected.");
        return;
    }
    const userUrl = await vscode.window.showInputBox({
        prompt: "Enter the directory to use for the SVG assets in the HTML files. (Empty to use the selected file path)",
        value: "/assets/svgs/", // default value
    });
    if (!userUrl) {
        vscode.window.showInformationMessage("No URL specified. Using the selected file path.");
    }
    const saveDirectory = saveUri[0];
    fs.mkdirSync(saveDirectory.fsPath, { recursive: true });
    const htmlFiles = await vscode.workspace.findFiles(new vscode.RelativePattern(searchDirectory, "**/*.html"), "**/node_modules/**");
    for (const file of htmlFiles) {
        const document = await vscode.workspace.openTextDocument(file);
        const text = document.getText();
        const svgUrlRegex = /https?:\/\/[^'"\s]+\.svg\b/g;
        const matches = [...text.matchAll(svgUrlRegex)];
        let updatedText = text;
        for (const match of matches) {
            const url = match[0];
            // Decode URL-encoded characters
            let decodedUrl = decodeURIComponent(url);
            // Remove query parameters
            decodedUrl = decodedUrl.split("?")[0];
            // Extract and sanitize the filename
            let filename = path.basename(decodedUrl);
            // Replace invalid characters with underscores
            filename = filename.replace(/[<>:"\/\\|?*\s]/g, "_");
            const localFilePath = path.join(saveDirectory.fsPath, filename);
            if (!fs.existsSync(localFilePath)) {
                await downloadFile(url, localFilePath);
            }
            // Ensure the relative path starts with '/'
            const relativePath = "/" +
                path
                    .relative(workspaceFolders[0].uri.fsPath, localFilePath)
                    .replace(/\\/g, "/");
            updatedText = updatedText.replace(new RegExp(url.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "g"), userUrl ? userUrl + filename : relativePath);
        }
        if (updatedText !== text) {
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
            edit.replace(file, fullRange, updatedText);
            await vscode.workspace.applyEdit(edit);
            await document.save();
        }
    }
    vscode.window.showInformationMessage("SVG assets downloaded and references updated.");
}
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https
            .get(url, (response) => {
            response.pipe(file);
            file.on("finish", () => {
                file.close();
                resolve();
            });
        })
            .on("error", (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}
//# sourceMappingURL=downloadSvgAssets.js.map