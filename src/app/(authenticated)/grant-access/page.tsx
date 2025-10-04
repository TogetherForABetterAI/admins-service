import { QueryClientProviderWrapper } from "@/components/query-client-provider-wrapper";
import AdminsTable from "@/components/tables/admins-table";


export default function InputForm() {

  return (
    <QueryClientProviderWrapper>

      <h1 className="text-2xl font-bold">Give access to other admins</h1>
      <p className="text-muted-foreground" style={{ paddingBottom: "calc(var(--spacing) * 8)" }}>Enter the email address of the admin you want to invite.</p>

      <AdminsTable />
    </QueryClientProviderWrapper >
  )
}
