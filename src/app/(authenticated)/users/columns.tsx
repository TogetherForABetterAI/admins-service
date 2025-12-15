"use client";

import { AuthorizationToggle } from "@/components/authorization-toggle";
import { ColumnDef } from "@tanstack/react-table";
import z from "zod";

const UserColumns = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(1),
  model_type: z.string().min(1),
  inputs_format: z.string().min(1),
  outputs_format: z.string().min(1),
  created_at: z.string().min(1),
  is_authorized: z.boolean(),
});

export type User = z.infer<typeof UserColumns>;

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
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
  {
    accessorKey: "is_authorized",
    header: "Authorized",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <AuthorizationToggle
          userId={user.id}
          isAuthorized={user.is_authorized}
        />
      );
    },
  },
];
