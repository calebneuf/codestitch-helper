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
exports.setupEleventySharpImages = setupEleventySharpImages;
// commands/setupEleventySharpImages.ts
const vscode = __importStar(require("vscode"));
const fs_1 = require("fs");
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function setupEleventySharpImages() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder is open.');
        return;
    }
    const workspacePath = workspaceFolders[0].uri.fsPath;
    vscode.window.showInformationMessage('Starting Eleventy Sharp Images setup...');
    try {
        const answer = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: 'Are you using Netlify?',
        });
        if (!answer) {
            vscode.window.showInformationMessage('Setup cancelled.');
            return;
        }
        const isNetlify = answer === 'Yes';
        // Install the Eleventy Sharp Images plugin
        vscode.window.showInformationMessage('Installing @codestitchofficial/eleventy-plugin-sharp-images...');
        await execAsync('npm install @codestitchofficial/eleventy-plugin-sharp-images', { cwd: workspacePath });
        vscode.window.showInformationMessage('Installed @codestitchofficial/eleventy-plugin-sharp-images.');
        // Update .eleventy.js
        vscode.window.showInformationMessage('Updating .eleventy.js configuration...');
        await updateEleventyConfig(workspacePath, isNetlify);
        if (isNetlify) {
            // Install Netlify caching plugin
            vscode.window.showInformationMessage('Installing netlify-plugin-cache...');
            await execAsync('npm install netlify-plugin-cache', { cwd: workspacePath });
            vscode.window.showInformationMessage('Installed netlify-plugin-cache.');
            // Update netlify.toml
            vscode.window.showInformationMessage('Updating netlify.toml configuration...');
            await updateNetlifyToml(workspacePath);
        }
        vscode.window.showInformationMessage('Eleventy Sharp Images setup completed successfully.');
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error during setup: ${error.message}`);
    }
}
async function updateEleventyConfig(workspacePath, isNetlify) {
    const eleventyConfigPath = path.join(workspacePath, '.eleventy.js');
    let data;
    try {
        data = await fs_1.promises.readFile(eleventyConfigPath, 'utf8');
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error reading .eleventy.js: ${error.message}`);
        return;
    }
    if (data.includes('eleventyPluginSharpImages')) {
        vscode.window.showInformationMessage('eleventy-plugin-sharp-images is already configured in .eleventy.js');
        return;
    }
    const pluginImport = `const eleventyPluginSharpImages = require("@codestitchofficial/eleventy-plugin-sharp-images");\n`;
    const pluginConfig = `
    eleventyConfig.addPlugin(eleventyPluginSharpImages, {
        urlPath: "/assets/images",
        outputDir: "public/assets/images",
    });
    `;
    // Insert plugin import after existing imports
    const importRegex = /(^const .+;\n)+/m;
    if (importRegex.test(data)) {
        data = data.replace(importRegex, `$&${pluginImport}`);
    }
    else {
        data = pluginImport + data;
    }
    // Insert plugin configuration after module.exports function declaration
    const moduleExportsRegex = /(module\.exports\s*=\s*function\s*\(\s*eleventyConfig\s*\)\s*\{)/;
    const moduleExportsMatch = moduleExportsRegex.exec(data);
    if (moduleExportsMatch) {
        const insertPos = moduleExportsMatch.index + moduleExportsMatch[0].length;
        let importantNote = '';
        if (isNetlify) {
            importantNote = `
    // Important: Ensure any HTML minification plugins are added after this plugin to avoid processing issues.
    `;
        }
        data = [
            data.slice(0, insertPos),
            importantNote,
            pluginConfig,
            data.slice(insertPos),
        ].join('');
    }
    else {
        vscode.window.showErrorMessage('Could not find "module.exports = function (eleventyConfig) {" in .eleventy.js');
        return;
    }
    try {
        await fs_1.promises.writeFile(eleventyConfigPath, data, 'utf8');
        vscode.window.showInformationMessage('.eleventy.js has been updated with the plugin configuration.');
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error writing to .eleventy.js: ${error.message}`);
    }
}
async function updateNetlifyToml(workspacePath) {
    const netlifyTomlPath = path.join(workspacePath, 'netlify.toml');
    const netlifyConfig = `
[[plugins]]
package = "netlify-plugin-cache"

  [plugins.inputs]
  paths = [
    "public/assets/images", # Processed images - adjust to match your outputDir
    ".cache" # Remote Assets
  ]
`;
    let data = '';
    try {
        data = await fs_1.promises.readFile(netlifyTomlPath, 'utf8');
        vscode.window.showInformationMessage('netlify.toml found, updating configuration...');
    }
    catch {
        vscode.window.showInformationMessage('netlify.toml not found, creating a new one.');
    }
    if (data.includes('package = "netlify-plugin-cache"')) {
        vscode.window.showInformationMessage('netlify-plugin-cache is already configured in netlify.toml');
        return;
    }
    // Ensure there's a newline before appending to maintain proper formatting
    if (data && !data.endsWith('\n')) {
        data += '\n';
    }
    // Append the new plugin configuration
    data += netlifyConfig;
    try {
        await fs_1.promises.writeFile(netlifyTomlPath, data, 'utf8');
        vscode.window.showInformationMessage('netlify.toml has been updated with caching configuration.');
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error writing to netlify.toml: ${error.message}`);
    }
}
//# sourceMappingURL=setupEleventySharpImages.js.map