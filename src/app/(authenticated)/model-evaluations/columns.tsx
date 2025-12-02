"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

export interface MLflowRun {
  run_id: string;
  run_name: string;
  status: "RUNNING" | "SCHEDULED" | "FINISHED" | "FAILED" | "KILLED";
  start_time: number;
  accuracy?: number;
}

const StatusIcon = ({ status }: { status: MLflowRun["status"] }) => {
  switch (status) {
    case "FINISHED":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "FAILED":
    case "KILLED":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "RUNNING":
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    case "SCHEDULED":
      return <Clock className="h-4 w-4 text-amber-500" />;
    default:
      return null;
  }
};

export const createRunColumns = (
  onInspect: (runId: string, runName: string) => void
): ColumnDef<MLflowRun>[] => [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as MLflowRun["status"];
      return (
        <div className="flex items-center gap-2">
          <StatusIcon status={status} />
          <span className="capitalize text-sm">{status.toLowerCase()}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "run_name",
    header: "Run Name",
    cell: ({ row }) => {
      const runName = row.getValue("run_name") as string;
      const runId = row.original.run_id;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{runName || "Unnamed Run"}</span>
          <span className="text-xs text-muted-foreground font-mono">
            {runId.slice(0, 8)}...
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "start_time",
    header: "Start Time",
    cell: ({ row }) => {
      const timestamp = row.getValue("start_time") as number;
      const date = new Date(timestamp);
      return (
        <div className="flex flex-col">
          <span className="text-sm">
            {date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "accuracy",
    header: "Accuracy",
    cell: ({ row }) => {
      const accuracy = row.getValue("accuracy") as number | undefined;
      if (accuracy === undefined || accuracy === null) {
        return <span className="text-muted-foreground text-sm">N/A</span>;
      }
      const percentage = (accuracy * 100).toFixed(2);
      const colorClass =
        accuracy >= 0.9
          ? "text-emerald-600 bg-emerald-50"
          : accuracy >= 0.7
          ? "text-amber-600 bg-amber-50"
          : "text-red-600 bg-red-50";
      return (
        <span className={`px-2 py-1 rounded-md text-sm font-medium ${colorClass}`}>
          {percentage}%
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const runId = row.original.run_id;
      const runName = row.original.run_name || runId;
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onInspect(runId, runName)}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          Inspect Results
        </Button>
      );
    },
  },
];
