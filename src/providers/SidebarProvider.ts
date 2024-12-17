import * as vscode from "vscode";

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "codestitchHelper";

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case "optimizeSite": {
          vscode.window.showInformationMessage("Optimizing site...");
          // Add your site optimization logic here
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1.0">
          <title>CodeStitch Helper</title>
          <style>
            button {
              width: 100%;
              padding: 8px;
              margin: 8px 0;
              background: var(--vscode-button-background);
              color: var(--vscode-button-foreground);
              border: none;
              border-radius: 2px;
              cursor: pointer;
            }
            button:hover {
              background: var(--vscode-button-hoverBackground);
            }
          </style>
        </head>
        <body>
          <button id="optimizeSite">Optimize Site</button>

          <script>
            const vscode = acquireVsCodeApi();
            document.getElementById('optimizeSite').addEventListener('click', () => {
              vscode.postMessage({ command: 'optimizeSite' });
            });
          </script>
        </body>
      </html>
    `;
  }
}
