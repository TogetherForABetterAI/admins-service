"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React from "react"
import { UserType } from "@/lib/table-data-type";
import { useEffect, useState } from "react";
import { userColumns } from "@/app/(authenticated)/(dashboard)/columns";
import { adminColumns } from "@/app/(authenticated)/grant-access/columns";
import { tokenColumns } from "@/app/(authenticated)/new-token/columns";
import { Loader2 } from "lucide-react";

export function DataTable<TData, TValue>(
  { type }: { type: UserType }
) {

  const [data, setData] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const columns: ColumnDef<any, any>[] = (type === "users" ? userColumns : type === "admins" ? adminColumns : tokenColumns) as ColumnDef<any, any>[];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/${type}/get`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched data:", data);
        setData(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [type]);


  const table = useReactTable<any>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })



  if (loading) {
    return <div className="p-16"><Loader2 className="mr-2 h-4 w-4 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto p-16">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
    </div>
  )
}