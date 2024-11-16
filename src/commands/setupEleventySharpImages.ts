// commands/setupEleventySharpImages.ts
import * as vscode from 'vscode';
import { promises as fs } from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function setupEleventySharpImages() {
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
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error during setup: ${error.message}`);
    }
}

async function updateEleventyConfig(workspacePath: string, isNetlify: boolean) {
    const eleventyConfigPath = path.join(workspacePath, '.eleventy.js');

    let data: string;
    try {
        data = await fs.readFile(eleventyConfigPath, 'utf8');
    } catch (error: any) {
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
    } else {
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
    } else {
        vscode.window.showErrorMessage('Could not find "module.exports = function (eleventyConfig) {" in .eleventy.js');
        return;
    }

    try {
        await fs.writeFile(eleventyConfigPath, data, 'utf8');
        vscode.window.showInformationMessage('.eleventy.js has been updated with the plugin configuration.');
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error writing to .eleventy.js: ${error.message}`);
    }
}

async function updateNetlifyToml(workspacePath: string) {
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
        data = await fs.readFile(netlifyTomlPath, 'utf8');
        vscode.window.showInformationMessage('netlify.toml found, updating configuration...');
    } catch {
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
        await fs.writeFile(netlifyTomlPath, data, 'utf8');
        vscode.window.showInformationMessage('netlify.toml has been updated with caching configuration.');
    } catch (error: any) {
        vscode.window.showErrorMessage(`Error writing to netlify.toml: ${error.message}`);
    }
}