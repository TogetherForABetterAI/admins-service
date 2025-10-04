"use client";
import z from "zod";
import { QueryClientProviderWrapper } from "@/components/query-client-provider-wrapper";
import { TokensTable } from "@/components/tables/tokens-table";

export default function NewTokenPage() {

  return (
    <QueryClientProviderWrapper>
      <h1 className="text-2xl font-bold">Manage tokens info</h1>
      <p className="text-muted-foreground" style={{ paddingBottom: "calc(var(--spacing) * 8)" }}>Create new tokens below</p>
      <TokensTable />
    </QueryClientProviderWrapper>

  );
}
