"use client"
import { Token, tokenColumns } from "@/app/(authenticated)/new-token/columns";
import { apiFetch } from "@/external/api";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { UserType } from "@/lib/table-data-type";
import { TokenForm } from "../forms/token-form";

export function TokensTable() {
  const { data, isLoading } = useQuery<Token[]>({
    queryKey: [UserType.TOKENS],
    queryFn: () => apiFetch("/tokens/", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }),
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Create Token</h1>
      <div>
        <p className="text-muted-foreground">Here you can see user tokens information</p>
        <DataTable data={data ?? []} columns={tokenColumns} isLoading={isLoading} />
      </div>
      <TokenForm />
    </div>


  );
}