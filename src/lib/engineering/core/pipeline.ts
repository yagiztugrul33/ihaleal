import type { CalculationStep } from "./types";

export type PipelineContext = {
  steps: CalculationStep[];
  stepCounter: number;
};

export function createPipeline(): PipelineContext {
  return { steps: [], stepCounter: 0 };
}

export function recordStep(
  ctx: PipelineContext,
  step: Omit<CalculationStep, "id">,
): CalculationStep {
  ctx.stepCounter += 1;
  const full: CalculationStep = { id: `step-${ctx.stepCounter}`, ...step };
  ctx.steps.push(full);
  return full;
}
