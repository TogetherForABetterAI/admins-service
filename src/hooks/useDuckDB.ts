"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as duckdb from "@duckdb/duckdb-wasm";

export interface MNISTRow {
  input: Uint8Array;
  y_pred: number[];
  y_test: number;
}

interface UseDuckDBResult {
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  data: MNISTRow[];
  loadedFiles: string[];
  loadParquetFiles: (files: File[]) => Promise<void>;
  clearData: () => Promise<void>;
}

export function useDuckDB(): UseDuckDBResult {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MNISTRow[]>([]);
  const [loadedFiles, setLoadedFiles] = useState<string[]>([]);
  
  const dbRef = useRef<duckdb.AsyncDuckDB | null>(null);
  const connRef = useRef<duckdb.AsyncDuckDBConnection | null>(null);
  const registeredFilesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function initDuckDB() {
      try {
        setIsLoading(true);
        setError(null);

        const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
        const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

        const worker_url = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker}");`], {
            type: "text/javascript",
          })
        );
        const worker = new Worker(worker_url);
        const logger = new duckdb.ConsoleLogger();
        
        const db = new duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        
        if (cancelled) {
          await db.terminate();
          return;
        }

        dbRef.current = db;
        
        const conn = await db.connect();
        connRef.current = conn;

        setIsReady(true);
        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to initialize DuckDB");
          setIsLoading(false);
        }
      }
    }

    initDuckDB();

    return () => {
      cancelled = true;
      if (connRef.current) {
        connRef.current.close();
      }
      if (dbRef.current) {
        dbRef.current.terminate();
      }
    };
  }, []);

  const loadParquetFiles = useCallback(async (files: File[]) => {
    if (!dbRef.current || !connRef.current) {
      setError("DuckDB not initialized");
      return;
    }

    if (files.length === 0) {
      setError("No files provided");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const db = dbRef.current;
      const conn = connRef.current;

      const fileNames: string[] = [];
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        await db.registerFileBuffer(file.name, uint8Array);
        registeredFilesRef.current.add(file.name);
        fileNames.push(file.name);
      }

      const fileListStr = fileNames.map(name => `'${name}'`).join(", ");
      const query = `
        SELECT 
          input,
          y_pred,
          y_test
        FROM read_parquet([${fileListStr}])
      `;

      const result = await conn.query(query);

      const rows: MNISTRow[] = [];
      
      const inputColumn = result.getChildAt(0);
      const yPredColumn = result.getChildAt(1);
      const yTestColumn = result.getChildAt(2);
      
      const inputColAny = inputColumn as any;
      const dataBuffer: Uint8Array | undefined = inputColAny?.data?.[0]?.values;
      const offsetBuffer: Int32Array | undefined = inputColAny?.data?.[0]?.valueOffsets;
      
      for (let i = 0; i < result.numRows; i++) {
        let inputArray: Uint8Array;
        
        if (dataBuffer && offsetBuffer && offsetBuffer.length > i + 1) {
          const start = offsetBuffer[i] ?? 0;
          const end = offsetBuffer[i + 1] ?? start;
          inputArray = new Uint8Array(dataBuffer.buffer.slice(
            dataBuffer.byteOffset + start,
            dataBuffer.byteOffset + end
          ));
        } else {
          const inputData = inputColumn?.get(i);
          if (inputData instanceof Uint8Array) {
            inputArray = new Uint8Array(
              inputData.buffer.slice(inputData.byteOffset, inputData.byteOffset + inputData.byteLength)
            );
          } else {
            inputArray = new Uint8Array();
          }
        }
        
        const yPredData = yPredColumn?.get(i);
        const yTestData = yTestColumn?.get(i);

        let yPredArray: number[];
        if (Array.isArray(yPredData)) {
          yPredArray = yPredData.map(Number);
        } else if (yPredData && typeof yPredData === "object" && "toArray" in yPredData) {
          yPredArray = Array.from((yPredData as { toArray: () => number[] }).toArray());
        } else if (yPredData && typeof yPredData === "object") {
          yPredArray = Object.values(yPredData).map(Number);
        } else {
          yPredArray = [];
        }

        const yTest = typeof yTestData === "number" ? yTestData : Number(yTestData);

        rows.push({
          input: inputArray,
          y_pred: yPredArray,
          y_test: yTest,
        });
      }

      setData(rows);
      setLoadedFiles(fileNames);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load parquet files");
      setIsLoading(false);
    }
  }, []);

  const clearData = useCallback(async () => {
    if (dbRef.current) {
      for (const fileName of registeredFilesRef.current) {
        try {
          await dbRef.current.dropFile(fileName);
        } catch {
        }
      }
      registeredFilesRef.current.clear();
    }
    
    setData([]);
    setLoadedFiles([]);
    setError(null);
  }, []);

  return {
    isLoading,
    isReady,
    error,
    data,
    loadedFiles,
    loadParquetFiles,
    clearData,
  };
}
