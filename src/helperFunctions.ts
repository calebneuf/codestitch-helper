import * as vscode from "vscode";
import { excludedDirectories } from "./constants";

export async function findAllStyleFiles() {
  let files = [];
  const patterns = ["**/*.scss", "**/*.less", "**/*.css"];
  const excludePatterns = excludedDirectories.map((dir) => `**/${dir}/**`);
  const excludePattern = `{${excludePatterns.join(",")}}`;

  for (const pattern of patterns) {
    const foundFiles = await vscode.workspace.findFiles(
      pattern,
      excludePattern
    );
    files.push(...foundFiles);
  }

  return files;
}

export async function findContentFiles() {
  let files = [];
  const patterns = ["**/*.{html,njk}"];
  const excludePatterns = excludedDirectories.map((dir) => `**/${dir}/**`);
  const excludePattern = `{${excludePatterns.join(",")}}`;

  for (const pattern of patterns) {
    const foundFiles = await vscode.workspace.findFiles(
      pattern,
      excludePattern
    );
    files.push(...foundFiles);
  }

  return files;
}
