"use client";

import React, { useCallback, useMemo, useEffect, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDuckDB, type MNISTRow } from "@/hooks/useDuckDB";
import { Upload, FileSpreadsheet, AlertCircle, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

function findMaxIndex(arr: number[]): { index: number; value: number } {
  let maxIdx = 0;
  let maxVal = arr[0] ?? 0;
  for (let i = 1; i < arr.length; i++) {
    const val = arr[i] ?? 0;
    if (val > maxVal) {
      maxVal = val;
      maxIdx = i;
    }
  }
  return { index: maxIdx, value: maxVal };
}

function MnistCanvas({ data }: { data: Uint8Array }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) {
      setHasError(true);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setHasError(true);
      return;
    }

    try {
      const floatView = new Float32Array(data.buffer, data.byteOffset, data.byteLength / 4);
      const numPixels = floatView.length;
      
      let pixelsToRender: Float32Array;
      let width: number;
      let height: number;
      
      if (numPixels === 50176) {
        pixelsToRender = floatView.slice(0, 784);
        width = 28;
        height = 28;
      } else if (numPixels === 784) {
        pixelsToRender = floatView;
        width = 28;
        height = 28;
      } else {
        const side = Math.sqrt(numPixels);
        if (!Number.isInteger(side) || side <= 0) {
          setHasError(true);
          return;
        }
        pixelsToRender = floatView;
        width = side;
        height = side;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      let minVal = pixelsToRender[0] ?? 0;
      let maxVal = pixelsToRender[0] ?? 0;
      for (let i = 1; i < pixelsToRender.length; i++) {
        const v = pixelsToRender[i] ?? 0;
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      }
      const range = maxVal - minVal || 1;
      
      const imageData = ctx.createImageData(width, height);
      
      for (let i = 0; i < pixelsToRender.length; i++) {
        const val = pixelsToRender[i] ?? 0;
        const normalized = (val - minVal) / range;
        const brightness = Math.round(normalized * 255);
        
        const idx = i * 4;
        imageData.data[idx] = brightness;     // R
        imageData.data[idx + 1] = brightness; // G
        imageData.data[idx + 2] = brightness; // B
        imageData.data[idx + 3] = 255;        // A
      }
      
      ctx.putImageData(imageData, 0, 0);
      setHasError(false);
    } catch {
      setHasError(true);
    }
  }, [data]);

  if (hasError || !data || data.length === 0) {
    return (
      <div className="w-[56px] h-[56px] bg-muted rounded flex items-center justify-center">
        <AlertCircle className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="rounded border border-border bg-black"
      style={{
        width: "56px",
        height: "56px",
        imageRendering: "pixelated",
      }}
    />
  );
}

function PredictionCell({ yPred, yTest }: { yPred: number[]; yTest: number }) {
  const prediction = useMemo(() => {
    if (!yPred || yPred.length === 0) return { label: -1, confidence: 0 };
    const { index, value } = findMaxIndex(yPred);
    return { label: index, confidence: value };
  }, [yPred]);

  const isCorrect = prediction.label === yTest;
  const confidencePercent = (prediction.confidence * 100).toFixed(1);

  return (
    <div
      className={cn(
        "px-3 py-1.5 rounded-md font-mono text-sm inline-flex items-center gap-2",
        isCorrect 
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" 
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      )}
    >
      <span className="font-bold">{prediction.label}</span>
      <span className="text-xs opacity-75">({confidencePercent}%)</span>
    </div>
  );
}

const columns: ColumnDef<MNISTRow>[] = [
  {
    id: "index",
    header: "#",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono text-sm">
        {row.index + 1}
      </span>
    ),
    size: 60,
  },
  {
    accessorKey: "input",
    header: "Image",
    cell: ({ row }) => <MnistCanvas data={row.original.input} />,
    size: 80,
  },
  {
    accessorKey: "y_pred",
    header: "Prediction",
    cell: ({ row }) => (
      <PredictionCell yPred={row.original.y_pred} yTest={row.original.y_test} />
    ),
    size: 150,
  },
  {
    accessorKey: "y_test",
    header: "Label",
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-mono text-base px-3 py-1">
        {row.original.y_test}
      </Badge>
    ),
    size: 80,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const yPred = row.original.y_pred;
      const yTest = row.original.y_test;
      
      if (!yPred || yPred.length === 0) return null;
      
      const { index: maxIdx } = findMaxIndex(yPred);
      const isCorrect = maxIdx === yTest;
      
      return (
        <Badge variant={isCorrect ? "success" : "error"}>
          {isCorrect ? "Correct" : "Incorrect"}
        </Badge>
      );
    },
    size: 100,
  },
];

function FileChip({ name, onRemove }: { name: string; onRemove?: () => void }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm">
      <FileSpreadsheet className="w-3.5 h-3.5" />
      <span className="max-w-[150px] truncate">{name}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function ParquetDropzone({ 
  onFilesDrop, 
  isLoading 
}: { 
  onFilesDrop: (files: File[]) => void; 
  isLoading: boolean;
}) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesDrop(acceptedFiles);
      }
    },
    [onFilesDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/octet-stream": [".parquet"],
    },
    multiple: true,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200",
        "hover:border-primary/50 hover:bg-primary/5",
        isDragActive && "border-primary bg-primary/10 scale-[1.02]",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          "p-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20",
          isDragActive && "from-indigo-500/30 to-purple-500/30"
        )}>
          <Upload className={cn(
            "w-8 h-8 text-indigo-500",
            isDragActive && "animate-bounce"
          )} />
        </div>
        <div>
          <p className="text-lg font-medium">
            {isDragActive
              ? "Drop the files here..."
              : "Drag & drop Parquet files"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse your files
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileSpreadsheet className="w-4 h-4" />
          <span>Load multiple .parquet files from MLflow</span>
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 p-4">
          <div className="flex gap-8">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-t flex items-center gap-8">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-14 w-14 rounded" />
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-6 w-10 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MNISTDataTable({ data }: { data: MNISTRow[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const correctCount = useMemo(() => {
    return data.filter((row) => {
      if (!row.y_pred || row.y_pred.length === 0) return false;
      const { index: maxIdx } = findMaxIndex(row.y_pred);
      return maxIdx === row.y_test;
    }).length;
  }, [data]);

  const accuracy = data.length > 0 ? ((correctCount / data.length) * 100).toFixed(2) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg px-4 py-3 border border-indigo-500/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Samples</p>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{data.length.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg px-4 py-3 border border-emerald-500/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Correct</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{correctCount.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-lg px-4 py-3 border border-red-500/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Incorrect</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{(data.length - correctCount).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg px-4 py-3 border border-amber-500/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Accuracy</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{accuracy}%</p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.column.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const yPred = row.original.y_pred;
                const yTest = row.original.y_test;
                let isCorrect = true;
                
                if (yPred && yPred.length > 0) {
                  const { index: maxIdx } = findMaxIndex(yPred);
                  isCorrect = maxIdx === yTest;
                }

                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "transition-colors",
                      !isCorrect && "bg-red-50/50 dark:bg-red-950/20"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            data.length
          )}{" "}
          of {data.length} results
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ParquetViewer() {
  const { isLoading, isReady, error, data, loadedFiles, loadParquetFiles, clearData } = useDuckDB();

  const handleFilesDrop = useCallback(
    async (files: File[]) => {
      await loadParquetFiles(files);
    },
    [loadParquetFiles]
  );

  const handleClear = useCallback(async () => {
    await clearData();
  }, [clearData]);

  if (!isReady && isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-muted-foreground">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Initializing DuckDB engine...</span>
          </div>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-medium text-red-600 dark:text-red-400">Error</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <Button variant="outline" onClick={handleClear}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return <ParquetDropzone onFilesDrop={handleFilesDrop} isLoading={isLoading} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
            <span className="font-medium">
              {loadedFiles.length} {loadedFiles.length === 1 ? "file" : "files"} loaded
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {loadedFiles.map((fileName) => (
              <FileChip key={fileName} name={fileName} />
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      {isLoading ? <TableSkeleton /> : <MNISTDataTable data={data} />}
    </div>
  );
}
