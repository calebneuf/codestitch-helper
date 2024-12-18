import * as vscode from "vscode";
import { OptimizeWizardProvider } from "../../providers/OptimizeWizardProvider";

export function startOptimizeWizard(
  optimizeWizardProvider: OptimizeWizardProvider
) {
  return () => {
    optimizeWizardProvider.showStep(1);
  };
}
