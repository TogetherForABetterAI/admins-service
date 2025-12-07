"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { createRunColumns, MLflowRun } from "@/app/(authenticated)/model-evaluations/columns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Search,
  AlertCircle,
  RefreshCw,
  Database,
} from "lucide-react";
import { ArtifactDrawer } from "@/components/artifact-drawer";

const MLFLOW_BASE_URL = process.env.NEXT_PUBLIC_MLFLOW_URL || "http://localhost:5009";

interface MLflowRunsResponse {
  runs: Array<{
    info: {
      run_id: string;
      run_name: string;
      status: "RUNNING" | "SCHEDULED" | "FINISHED" | "FAILED" | "KILLED";
      start_time: number;
      end_time?: number;
      artifact_uri?: string;
      experiment_id: string;
    };
    data: {
      metrics?: Array<{ key: string; value: number; timestamp: number; step: number }>;
      params?: Array<{ key: string; value: string }>;
      tags?: Array<{ key: string; value: string }>;
    };
  }>;
  next_page_token?: string;
}

interface MLflowExperimentsResponse {
  experiments: Array<{
    experiment_id: string;
    name: string;
    artifact_location: string;
    lifecycle_stage: string;
  }>;
}

async function fetchExperiments(): Promise<MLflowExperimentsResponse> {
  const response = await fetch(`${MLFLOW_BASE_URL}/api/2.0/mlflow/experiments/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      max_results: 100,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch experiments: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchRuns(experimentId: string, maxResults: number = 10): Promise<MLflowRun[]> {
  const safeMaxResults = Math.max(1, maxResults || 10);
  
  const response = await fetch(`${MLFLOW_BASE_URL}/api/2.0/mlflow/runs/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      experiment_ids: [experimentId],
      max_results: safeMaxResults,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch runs: ${response.status} ${response.statusText}`);
  }

  const data: MLflowRunsResponse = await response.json();

  return (data.runs || []).map((run) => {
    const accuracyMetric = run.data.metrics?.find((m) => m.key === "accuracy");
    return {
      run_id: run.info.run_id,
      run_name: run.info.run_name,
      status: run.info.status,
      start_time: run.info.start_time,
      accuracy: accuracyMetric?.value,
    };
  });
}

export function ModelEvaluationsTable() {
  const [search, setSearch] = useState("");
  const [selectedExperiment, setSelectedExperiment] = useState("0");
  const [maxResults, setMaxResults] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<{ id: string; name: string } | null>(null);

  const {
    data: experiments,
    isLoading: experimentsLoading,
    error: experimentsError,
  } = useQuery({
    queryKey: ["mlflow-experiments"],
    queryFn: fetchExperiments,
    retry: false,
  });

  const {
    data: runs,
    isLoading: runsLoading,
    error: runsError,
    refetch: refetchRuns,
  } = useQuery({
    queryKey: ["mlflow-runs", selectedExperiment, maxResults],
    queryFn: () => fetchRuns(selectedExperiment, maxResults),
    retry: false,
    enabled: !!selectedExperiment,
  });

  const handleInspect = useCallback((runId: string, runName: string) => {
    setSelectedRun({ id: runId, name: runName });
    setDrawerOpen(true);
  }, []);

  const columns = createRunColumns(handleInspect);

  const isCORSError = (error: Error | null): boolean => {
    if (!error) return false;
    return (
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("CORS")
    );
  };

  const error = experimentsError || runsError;
  const isLoading = experimentsLoading || runsLoading;

  if (error) {
    const corsError = isCORSError(error as Error);
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-red-50/50">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">
          {corsError ? "Connection Error" : "Failed to Load Data"}
        </h3>
        <p className="text-red-600 text-center max-w-md mb-4">
          {corsError ? (
            <>
              Unable to connect to MLflow server. This is likely a CORS issue.
              <br />
              <br />
              <strong>To fix this:</strong> Start MLflow with CORS enabled:
              <code className="block mt-2 p-2 bg-red-100 rounded text-sm font-mono">
                mlflow server --host 0.0.0.0 --port 5009
              </code>
              <span className="block mt-2 text-sm">
                Or set the <code>MLFLOW_ALLOW_ORIGINS</code> environment variable.
              </span>
            </>
          ) : (
            (error as Error).message
          )}
        </p>
        <Button variant="outline" onClick={() => refetchRuns()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Connecting to MLflow server...</p>
        <p className="text-sm text-muted-foreground mt-1">
          {MLFLOW_BASE_URL}
        </p>
      </div>
    );
  }

  const filteredRuns =
    runs?.filter((run) =>
      run.run_name?.toLowerCase().includes(search.toLowerCase()) ||
      run.run_id.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  return (
    <>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex items-center">
            <Search className="absolute left-2 text-gray-400 w-4 h-4" />
            <Input
              className="pl-8 w-64"
              placeholder="Search by run name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedExperiment} onValueChange={setSelectedExperiment}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select experiment" />
              </SelectTrigger>
              <SelectContent>
                {experiments?.experiments?.map((exp) => (
                  <SelectItem key={exp.experiment_id} value={exp.experiment_id}>
                    {exp.name} (ID: {exp.experiment_id})
                  </SelectItem>
                )) ?? (
                  <SelectItem value="0">Default (ID: 0)</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select
              value={maxResults.toString()}
              onValueChange={(v) => setMaxResults(parseInt(v))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchRuns()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredRuns.length} of {runs?.length ?? 0} runs
        </div>
      </div>

      <DataTable data={filteredRuns} columns={columns} />

      <ArtifactDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        runId={selectedRun?.id ?? ""}
        runName={selectedRun?.name ?? ""}
        mlflowBaseUrl={MLFLOW_BASE_URL}
      />
    </>
  );
}