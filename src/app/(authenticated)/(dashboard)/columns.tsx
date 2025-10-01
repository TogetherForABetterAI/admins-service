"use client"

import { ColumnDef } from "@tanstack/react-table"
import z from "zod";


const UserColumns = z.object({
    user_id: z.string().uuid(),
    email: z.string().email(),
    username: z.string().min(1),
    model_type: z.string().min(1),
    inputs_format: z.string().min(1),
    outputs_format: z.string().min(1),
});

export type User = z.infer<typeof UserColumns>;

export const userColumns: ColumnDef<User>[] = [
    {
        accessorKey: "user_id",
        header: "ID",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "username",
        header: "Username",
    },
    {
        accessorKey: "model_type",
        header: "Model Type",
    },
    {
        accessorKey: "inputs_format",
        header: "Inputs Format",
    },
    {
        accessorKey: "outputs_format",
        header: "Outputs Format",
    },
    {
        accessorKey: "created_at",
        header: "Created At",
    },
]