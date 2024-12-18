import * as vscode from "vscode";

export class OptimizeWizardProvider {
  private _panel: vscode.WebviewPanel | undefined;
  private _extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this._extensionUri = extensionUri;
  }

  public showStep(step: number) {
    if (this._panel) {
      this._updateWebview(this._panel.webview, step);
      this._panel.reveal(vscode.ViewColumn.One);
    } else {
      this._panel = vscode.window.createWebviewPanel(
        "optimizeWizard",
        "Optimize Wizard",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [this._extensionUri],
        }
      );

      this._panel.onDidDispose(() => {
        this._panel = undefined;
      });

      this._updateWebview(this._panel.webview, step);

      this._panel.webview.onDidReceiveMessage(async (data) => {
        switch (data.command) {
          case "nextStep":
            if (this._panel) {
              this._updateWebview(this._panel.webview, data.step + 1);
            }
            break;
          case "prevStep":
            if (this._panel) {
              this._updateWebview(this._panel.webview, data.step - 1);
            }
            break;
        }
      });
    }
  }

  private _updateWebview(webview: vscode.Webview, step: number) {
    webview.html = this._getHtmlForStep(webview, step);
  }

  private _getHtmlForStep(webview: vscode.Webview, step: number) {
    const prevButton =
      step > 1 ? `<button id="prevStep">Previous</button>` : "";
    const nextButton = step < 3 ? `<button id="nextStep">Next</button>` : "";

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width,initial-scale=1.0">
          <title>Optimize Wizard - Step ${step}</title>
          <style>
            button {
              padding: 8px;
              margin: 8px;
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
          <h1>Step ${step}</h1>
          ${prevButton}
          ${nextButton}
          <script>
            const vscode = acquireVsCodeApi();
            document.getElementById('nextStep')?.addEventListener('click', () => {
              vscode.postMessage({ command: 'nextStep', step: ${step} });
            });
            document.getElementById('prevStep')?.addEventListener('click', () => {
              vscode.postMessage({ command: 'prevStep', step: ${step} });
            });
          </script>
        </body>
      </html>
    `;
  }
}
