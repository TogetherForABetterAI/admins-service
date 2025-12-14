"use client";
import { User, userColumns } from "@/app/(authenticated)/users/columns";
import { DataTable } from "@/components/data-table";
import { apiFetch } from "@/external/api";
import { UserType } from "@/lib/table-data-type";
import { toShortTimestamp } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import UserForm from "../forms/user-form";

export function UsersTable() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<User[]>({
    queryKey: [UserType.USERS],
    queryFn: () =>
      apiFetch("/users/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
  });

  data?.forEach((user) => {
    user.created_at = toShortTimestamp(user.created_at);
  });

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <div className="relative flex items-center">
          <Search className="absolute left-2 text-gray-400 w-4 h-4" />
          <Input
            className="pl-8 w-96"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <UserForm />
        </div>

      </div>
      <DataTable
        data={data?.filter((user) => user.username.includes(search)) ?? []}
        columns={userColumns}
        isLoading={isLoading}
      />
    </>
  );
}