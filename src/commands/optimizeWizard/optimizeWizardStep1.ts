import * as vscode from "vscode";
import { OptimizeWizardProvider } from "../../providers/OptimizeWizardProvider";

export function optimizeWizardStep1(
  optimizeWizardProvider: OptimizeWizardProvider
) {
  return () => {
    optimizeWizardProvider.showStep(1);
  };
}
