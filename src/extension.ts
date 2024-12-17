import * as vscode from "vscode";
import { SectionNavigationProvider } from "./providers/sectionNavigationProvider";
import { replaceNavTabs } from "./commands/replaceNavTabs";
import { selectAll } from "./commands/selectAll";
import { openSection } from "./commands/openSection";
import { CodeLensProvider } from "./providers/codeLensProvider";
import { addIconClass } from "./commands/addIconClass";
import { convertToNetlifyForm } from "./commands/convertToNetlifyForm";
import { optimizeSharpImages } from "./commands/optimizeSharpImages";
import {
  navigateToSectionCSS,
  navigateToSectionCSSCommandId,
} from "./commands/navigateToSectionCSS";
import { setupEleventySharpImages } from "./commands/setupEleventySharpImages";
import { optimizeStylesheet } from "./commands/optimizeStylesheet";
import { navigateToCodeStitch } from "./commands/navigateToCodeStitch";
import { reorderSections } from "./commands/reorderSections";
import { CodeSection } from "./utils/sectionUtils";
import { downloadSvgAssets } from "./commands/downloadSvgAssets";
import * as path from "path";
import * as fs from "fs";
import { SidebarProvider } from "./providers/SidebarProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log("codestitch-helper is now active!");

  const sectionNavProvider = new SectionNavigationProvider();
  vscode.window.registerTreeDataProvider(
    "sectionNavigator",
    sectionNavProvider
  );

  const openSectionDisposable = vscode.commands.registerCommand(
    "codestitchHelper.openSection",
    (section: CodeSection) => {
      openSection(section);
    }
  );

  const selectAllDisposable = vscode.commands.registerCommand(
    "codestitchHelper.selectAll",
    (section: CodeSection) => {
      selectAll(section);
    }
  );

  const replaceNavTabsDisposable = vscode.commands.registerCommand(
    "codestitchHelper.replaceNavTabs",
    (document: vscode.TextDocument) => {
      replaceNavTabs(document);
    }
  );

  const addIconClassDisposable = vscode.commands.registerCommand(
    "codestitchHelper.addIconClass",
    (document: vscode.TextDocument, range: vscode.Range) => {
      addIconClass(document, range);
    }
  );

  const convertToNetlifyFormDisposable = vscode.commands.registerCommand(
    "codestitchHelper.convertToNetlifyForm",
    (document: vscode.TextDocument) => {
      convertToNetlifyForm(document);
    }
  );

  const optimizeSharpImagesDisposable = vscode.commands.registerCommand(
    "codestitchHelper.optimizeSharpImages",
    (document: vscode.TextDocument, range: vscode.Range) => {
      optimizeSharpImages(document, range);
    }
  );

  const navigateToSectionCSSDisposable = vscode.commands.registerCommand(
    navigateToSectionCSSCommandId,
    navigateToSectionCSS
  );

  const setupEleventySharpImagesDisposable = vscode.commands.registerCommand(
    "codestitchHelper.setupEleventySharpImages",
    () => {
      setupEleventySharpImages();
    }
  );

  const optimizeStylesheetDisposable = vscode.commands.registerCommand(
    "codestitchHelper.optimizeStylesheet",
    (document: vscode.TextDocument, linkTag: string) => {
      optimizeStylesheet(document, linkTag);
    }
  );

  const navigateToCodeStitchDisposable = vscode.commands.registerCommand(
    "codestitchHelper.navigateToCodeStitch",
    (sectionId: string) => {
      navigateToCodeStitch(sectionId);
    }
  );

  const reorderSectionsDisposable = vscode.commands.registerCommand(
    "codestitchHelper.reorderSections",
    () => {
      reorderSections();
    }
  );

  const downloadSvgAssetsDisposable = vscode.commands.registerCommand(
    "codestitchHelper.downloadSvgAssets",
    downloadSvgAssets
  );

  // Ensure the Explorer view is open
  vscode.commands.executeCommand("workbench.view.explorer"); // No need to focus on a specific view

  // Register CodeLensProvider for both HTML and SCSS
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { language: "*" },
      new CodeLensProvider()
    )
  );

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

  context.subscriptions.push(
    optimizeSharpImagesDisposable,
    openSectionDisposable,
    selectAllDisposable,
    replaceNavTabsDisposable,
    addIconClassDisposable,
    convertToNetlifyFormDisposable,
    navigateToSectionCSSDisposable,
    setupEleventySharpImagesDisposable,
    optimizeStylesheetDisposable,
    navigateToCodeStitchDisposable,
    reorderSectionsDisposable,
    downloadSvgAssetsDisposable
  );

  // Register Sidebar Provider
  const provider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      provider
    )
  );

  // Register optimize site command
  const optimizeSiteDisposable = vscode.commands.registerCommand(
    "codestitchHelper.optimizeSite",
    () => {
      vscode.window.showInformationMessage("Optimizing site...");
      // Add your site optimization logic here
    }
  );
  context.subscriptions.push(optimizeSiteDisposable);
}

export function deactivate() {}
