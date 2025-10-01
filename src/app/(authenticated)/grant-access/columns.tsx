"use client"

import { ColumnDef } from "@tanstack/react-table"
import z from "zod";


const AdminColumns = z.object({
    email: z.string().email(),
});

export type Admin = z.infer<typeof AdminColumns>;

export const adminColumns: ColumnDef<Admin>[] = [
    {
        accessorKey: "email",
        header: "Email",
    },
]