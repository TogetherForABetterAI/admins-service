"use client"

import { ColumnDef } from "@tanstack/react-table"
import z from "zod";


const TokenColumns = z.object({
    user_id: z.string().uuid(),
    username: z.string().min(1),
    token_hash: z.string().min(1),
    created_at: z.string().min(1),
    expires_at: z.string().min(1),
    is_active: z.boolean(),
    usage_count: z.number().int().nonnegative(),
    max_uses: z.number().int().nonnegative(),
});

export type Token = z.infer<typeof TokenColumns>;

export const tokenColumns: ColumnDef<Token>[] = [
    {
        accessorKey: "user_id",
        header: "User ID",
    },
    {
        accessorKey: "username",
        header: "Username",
    },
    {
        accessorKey: "token_hash",
        header: "Token Hash",
    },
    {
        accessorKey: "created_at",
        header: "Created At",
    },
    {
        accessorKey: "expires_at",
        header: "Expires At",
    },
    {
        accessorKey: "is_active",
        header: "Is Active",
    },
    {
        accessorKey: "usage_count",
        header: "Usage Count",
    },
    {
        accessorKey: "max_uses",
        header: "Max Uses",
    },
]
