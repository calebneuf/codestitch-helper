import * as vscode from "vscode";
import { OptimizeWizardProvider } from "../../providers/OptimizeWizardProvider";

export function optimizeWizardStep2(
  optimizeWizardProvider: OptimizeWizardProvider
) {
  return () => {
    optimizeWizardProvider.showStep(2);
  };
}
