"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  FolderOpen,
  FileCode,
  RefreshCw,
  Download,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  Folder,
} from "lucide-react";

interface ArtifactDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runId: string;
  runName: string;
  mlflowBaseUrl: string;
}

interface Artifact {
  path: string;
  is_dir: boolean;
  file_size?: number;
}

interface ArtifactListResponse {
  root_uri: string;
  files: Artifact[];
}

export function ArtifactDrawer({
  open,
  onOpenChange,
  runId,
  runName,
  mlflowBaseUrl,
}: ArtifactDrawerProps) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [nestedArtifacts, setNestedArtifacts] = useState<Record<string, Artifact[]>>({});

  const fetchArtifacts = useCallback(
    async (path: string = "") => {
      if (!runId) return;

      if (!path) {
        setLoading(true);
        setError(null);
      }

      try {
        const url = new URL(`${mlflowBaseUrl}/api/2.0/mlflow/artifacts/list`);
        url.searchParams.set("run_id", runId);
        if (path) {
          url.searchParams.set("path", path);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error(`Failed to fetch artifacts: ${response.status}`);
        }

        const data: ArtifactListResponse = await response.json();

        if (path) {
          setNestedArtifacts((prev) => ({
            ...prev,
            [path]: data.files || [],
          }));
        } else {
          setArtifacts(data.files || []);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch artifacts";
        if (!path) {
          setError(message);
        }
        console.error(`Failed to fetch artifacts for ${path || "root"}:`, message);
      } finally {
        if (!path) {
          setLoading(false);
        }
      }
    },
    [runId, mlflowBaseUrl]
  );

  useEffect(() => {
    if (open && runId) {
      fetchArtifacts();
      setExpandedDirs(new Set());
      setNestedArtifacts({});
    }
  }, [open, runId, fetchArtifacts]);

  const toggleDir = async (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (expandedDirs.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
      if (!nestedArtifacts[path]) {
        await fetchArtifacts(path);
      }
    }
    setExpandedDirs(newExpanded);
  };

  const getDownloadUrl = (path: string): string => {
    const url = new URL(`${mlflowBaseUrl}/get-artifact`);
    url.searchParams.set("path", path);
    url.searchParams.set("run_id", runId);
    return url.toString();
  };

  const handleDownload = (path: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const url = getDownloadUrl(path);
    const fileName = path.split("/").pop() || "artifact";
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderArtifactTree = (files: Artifact[], depth: number = 0) => {
    return files.map((artifact) => {
      const isExpanded = expandedDirs.has(artifact.path);
      const nestedFiles = nestedArtifacts[artifact.path] || [];
      const fileName = artifact.path.split("/").pop() || artifact.path;

      if (artifact.is_dir) {
        return (
          <div key={artifact.path}>
            <div
              className="flex items-center gap-3 py-3 px-4 hover:bg-muted/60 cursor-pointer transition-colors border-b border-border/50"
              style={{ paddingLeft: `${depth * 20 + 16}px` }}
              onClick={() => toggleDir(artifact.path)}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {isExpanded ? (
                  <FolderOpen className="h-5 w-5 text-amber-500" />
                ) : (
                  <Folder className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <span className="flex-1 font-medium text-sm">{fileName}</span>
            </div>
            {isExpanded && nestedFiles.length > 0 && (
              <div>{renderArtifactTree(nestedFiles, depth + 1)}</div>
            )}
          </div>
        );
      }

      return (
        <div
          key={artifact.path}
          className="flex items-center gap-3 py-3 px-4 hover:bg-muted/60 cursor-pointer transition-colors border-b border-border/50 group"
          style={{ paddingLeft: `${depth * 20 + 16}px` }}
          onClick={() => handleDownload(artifact.path)}
        >
          <FileCode className="h-5 w-5 text-blue-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{fileName}</p>
            {artifact.file_size !== undefined && (
              <p className="text-xs text-muted-foreground">
                {formatFileSize(artifact.file_size)}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-60 group-hover:opacity-100 transition-opacity gap-2"
            onClick={(e) => handleDownload(artifact.path, e)}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      );
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl lg:max-w-2xl p-0 flex flex-col h-full"
      >
        {/* Fixed Header */}
        <div className="p-6 pb-4 border-b bg-background">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-lg">
              <FolderOpen className="h-5 w-5 text-primary" />
              Run Artifacts
            </SheetTitle>
            <SheetDescription className="mt-2 space-y-1">
              <span className="block font-medium text-foreground">{runName}</span>
              <span className="block text-xs font-mono text-muted-foreground">
                {runId}
              </span>
            </SheetDescription>
          </SheetHeader>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {artifacts.length} {artifacts.length === 1 ? "item" : "items"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchArtifacts()}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Loading artifacts...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                Unable to load artifacts
              </p>
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Check that the MLflow server is accessible and try again.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchArtifacts()}
                className="mt-4 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : artifacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                No artifacts found
              </p>
              <p className="text-xs text-muted-foreground text-center">
                This run doesn't have any artifacts yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {renderArtifactTree(artifacts)}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
