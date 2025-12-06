"use client";
import { Token, tokenColumns } from "@/app/(authenticated)/new-token/columns";
import { DataTable } from "@/components/data-table";
import { apiFetch } from "@/external/api";
import { UserType } from "@/lib/table-data-type";
import { toShortTimestamp } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { TokenForm } from "../forms/token-form";
import { Input } from "../ui/input";

export function TokensTable() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery<Token[]>({
    queryKey: [UserType.TOKENS],
    queryFn: () =>
      apiFetch("/tokens/", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
  });

  data?.forEach((token) => {
    token.token_hash = token.token_hash.slice(0, 16) + "...";
    token.created_at = toShortTimestamp(token.created_at);
    token.expires_at = toShortTimestamp(token.expires_at);
  });

  return (
    <>
      <TokenForm />
      {isLoading ? (
        <div className="p-16">
          {" "}
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </div>
      ) : (
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
            data={
              data?.filter((token) => token.username.includes(search)) ?? []
            }
            columns={tokenColumns}
          />
        </>
      )}
    </>
  );
}
