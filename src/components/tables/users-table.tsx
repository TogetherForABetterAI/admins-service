"use client"
import { User, userColumns } from "@/app/(authenticated)/(dashboard)/columns";
import { apiFetch } from "@/external/api";
import { UserType } from "@/lib/table-data-type";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";


export function UsersTable() {
  const queryClient = new QueryClient();

  const { data, isLoading } = useQuery<User[]>({
    queryKey: [UserType.USERS],
    queryFn: () => apiFetch("/users/", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }),
  });
  return (
    <DataTable data={data ?? []} columns={userColumns} isLoading={isLoading} />
  );
}