"use client";
import z from "zod";
import { QueryClientProviderWrapper } from "@/components/query-client-provider-wrapper";
import { TokensTable } from "@/components/tables/tokens-table";

export default function NewTokenPage() {

  return (
    <QueryClientProviderWrapper>
      <TokensTable />
    </QueryClientProviderWrapper>

  );
}
