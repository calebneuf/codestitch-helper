import * as vscode from "vscode";
import { OptimizeWizardProvider } from "../../providers/OptimizeWizardProvider";

export function optimizeWizardStep3(
  optimizeWizardProvider: OptimizeWizardProvider
) {
  return () => {
    optimizeWizardProvider.showStep(3);
  };
}
