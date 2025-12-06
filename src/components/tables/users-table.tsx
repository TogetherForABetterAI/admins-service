"use client";
import { User, userColumns } from "@/app/(authenticated)/(dashboard)/columns";
import { apiFetch } from "@/external/api";
import { UserType } from "@/lib/table-data-type";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { useState } from "react";
import { Input } from "../ui/input";
import { Loader2, Search } from "lucide-react";
import { toShortTimestamp } from "@/lib/utils";

export function UsersTable() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<User[]>({
    queryKey: [UserType.USERS],
    queryFn: () =>
      apiFetch("/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
  });

  if (isLoading) {
    return (
      <div className="p-16">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      </div>
    );
  }

  data?.forEach((user) => {
    user.created_at = toShortTimestamp(user.created_at);
  });
  console.log("Users data:", data);

  return (
    <>
      <div className="relative flex items-center pb-4">
        <Search className="absolute left-2 text-gray-400 w-4 h-4" />
        <Input
          className="pl-8 w-96"
          placeholder="Search by username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <DataTable
        data={data?.filter((user) => user.username.includes(search)) ?? []}
        columns={userColumns}
      />
    </>
  );
}
