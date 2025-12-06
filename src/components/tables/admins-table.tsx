"use client";

import {
  Admin,
  adminColumns,
} from "@/app/(authenticated)/grant-access/columns";
import { DataTable } from "@/components/data-table";
import { apiFetch } from "@/external/api";
import { UserType } from "@/lib/table-data-type";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { AdminForm } from "../forms/admin-form";
import { Input } from "../ui/input";

export default function InputForm() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery<Admin[]>({
    queryKey: [UserType.ADMINS],
    queryFn: () =>
      apiFetch("/admins/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
  });

  console.log("Admins data:", data);

  return (
    <>
      <AdminForm />
      {isLoading ? (
        <div className="p-16">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </div>
      ) : (
        <>
          <div className="relative flex items-center pb-4">
            <Search className="absolute left-2 text-gray-400 w-4 h-4" />
            <Input
              className="pl-8 w-96"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <DataTable
            data={data?.filter((admin) => admin.email.includes(search)) ?? []}
            columns={adminColumns}
          />
        </>
      )}
    </>
  );
}
