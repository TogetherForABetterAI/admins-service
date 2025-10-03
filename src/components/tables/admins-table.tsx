"use client";

import { DataTable } from "@/components/data-table"
import { UserType } from "@/lib/table-data-type";
import { adminColumns } from "@/app/(authenticated)/grant-access/columns";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { AdminForm } from "../forms/admin-form";

export default function InputForm() {
  const { data, isLoading } = useQuery({
    queryKey: [UserType.ADMINS],
    queryFn: () => fetch("/admins/", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then(res => res.json()),
  });

  return (
    <>
      <h1 className="pl-8 text-2xl font-bold">Give access to other admins</h1>
      <div>
        <p className="text-muted-foreground">Current admins:</p>
        <DataTable columns={adminColumns} data={data} isLoading={isLoading} />
      </div>
      <p className="pl-8 text-muted-foreground">Enter the email address of the admin you want to invite.</p>
      <AdminForm />
    </>
  )
}
