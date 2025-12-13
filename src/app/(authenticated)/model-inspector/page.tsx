"use client";

import { ParquetViewer } from "@/components/parquet-viewer";
import { FlaskConical } from "lucide-react";

export default function ModelInspectorPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
            <FlaskConical className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold">Model Inspector</h1>
        </div>
        <p className="text-muted-foreground">
          Visualize and analyze MNIST evaluation results from Parquet files. 
          Drag and drop a file to get started.
        </p>
      </div>

      <ParquetViewer />
    </div>
  );
}
