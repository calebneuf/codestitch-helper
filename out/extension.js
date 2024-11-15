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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const sectionNavigationProvider_1 = require("./providers/sectionNavigationProvider");
const replaceNavTabs_1 = require("./commands/replaceNavTabs");
const selectAll_1 = require("./commands/selectAll");
const openSection_1 = require("./commands/openSection");
const codeLensProvider_1 = require("./providers/codeLensProvider");
const addIconClass_1 = require("./commands/addIconClass");
const convertToNetlifyForm_1 = require("./commands/convertToNetlifyForm");
const optimizeSharpImages_1 = require("./commands/optimizeSharpImages");
function activate(context) {
    console.log("codestitch-helper is now active!");
    const sectionNavProvider = new sectionNavigationProvider_1.SectionNavigationProvider();
    vscode.window.registerTreeDataProvider("codestitchHelper", sectionNavProvider);
    const openSectionDisposable = vscode.commands.registerCommand("codestitchHelper.openSection", (section) => {
        (0, openSection_1.openSection)(section);
    });
    const selectAllDisposable = vscode.commands.registerCommand("codestitchHelper.selectAll", (section) => {
        (0, selectAll_1.selectAll)(section);
    });
    const replaceNavTabsDisposable = vscode.commands.registerCommand("codestitchHelper.replaceNavTabs", (document) => {
        (0, replaceNavTabs_1.replaceNavTabs)(document);
    });
    const addIconClassDisposable = vscode.commands.registerCommand("codestitchHelper.addIconClass", (document, range) => {
        (0, addIconClass_1.addIconClass)(document, range);
    });
    const convertToNetlifyFormDisposable = vscode.commands.registerCommand("codestitchHelper.convertToNetlifyForm", (document) => {
        (0, convertToNetlifyForm_1.convertToNetlifyForm)(document);
    });
    const optimizeSharpImagesDisposable = vscode.commands.registerCommand("codestitchHelper.optimizeSharpImages", (document, range) => {
        (0, optimizeSharpImages_1.optimizeSharpImages)(document, range);
    });
    // Ensure the Explorer view is open
    vscode.commands.executeCommand("workbench.view.explorer"); // No need to focus on a specific view
    // Register CodeLensProvider for both HTML and SCSS
    context.subscriptions.push(vscode.languages.registerCodeLensProvider({ language: "*" }, new codeLensProvider_1.CodeLensProvider()));
    const supportedLanguages = [
        "scss",
        "css",
        "sass",
        "less",
        "njk",
        "nunjucks",
        "html",
    ];
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (supportedLanguages.includes(event.document.languageId)) {
            sectionNavProvider.refresh();
        }
    });
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && supportedLanguages.includes(editor.document.languageId)) {
            sectionNavProvider.refresh();
        }
    });
    vscode.workspace.onDidOpenTextDocument((document) => {
        if (supportedLanguages.includes(document.languageId)) {
            sectionNavProvider.refresh();
        }
    });
    context.subscriptions.push(optimizeSharpImagesDisposable, openSectionDisposable, selectAllDisposable, replaceNavTabsDisposable, addIconClassDisposable, convertToNetlifyFormDisposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map