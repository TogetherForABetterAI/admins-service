"use client";

import { QueryClientProviderWrapper } from "@/components/query-client-provider-wrapper";
import { ModelEvaluationsTable } from "@/components/tables/model-evaluations-table";

export default function ModelEvaluationsPage() {
  return (
    <QueryClientProviderWrapper>
      <h1 className="text-2xl font-bold">Model Evaluations</h1>
      <p
        className="text-muted-foreground"
        style={{ paddingBottom: "calc(var(--spacing) * 16)" }}
      >
        View and inspect MLflow experiment runs and their evaluation results
      </p>
      <ModelEvaluationsTable />
    </QueryClientProviderWrapper>
  );
}
