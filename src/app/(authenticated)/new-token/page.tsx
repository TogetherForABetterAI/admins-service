"use client";
import z from "zod";
import { QueryClientProviderWrapper } from "@/components/query-client-provider-wrapper";
import { TokensTable } from "@/components/tables/tokens-table";
import { TokenForm } from "@/components/forms/token-form";

export default function NewTokenPage() {

  return (
    <QueryClientProviderWrapper>
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Manage tokens info</h1>
          <p className="text-muted-foreground">Create new tokens below</p>
        </div>

        <div className="max-w-lg mx-auto">
          <TokenForm />
        </div>
        <div style={{ paddingBottom: "calc(var(--spacing) * 8)" }}></div>
      </div>
      <div className="container mx-auto pb-10">
        <TokensTable />
      </div>
    </QueryClientProviderWrapper>
  );
}