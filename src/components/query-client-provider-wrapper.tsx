"use client"
import { UserType } from "@/lib/table-data-type";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UsersTable } from "./tables/users-table";


export function QueryClientProviderWrapper({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}