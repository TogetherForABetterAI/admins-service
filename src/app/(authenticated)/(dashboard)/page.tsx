import { UserType } from "@/lib/table-data-type";
import { QueryClientProviderWrapper } from "@/components/query-client-provider-wrapper";
import { UsersTable } from "@/components/tables/users-table";


export default async function Home() {


  return (
    <QueryClientProviderWrapper>
      <h1 className="text-2xl font-bold">Manage user info</h1>
      <p className="text-muted-foreground" style={{ paddingBottom: "calc(var(--spacing) * 16)" }}>Here you can see users information</p>
      <UsersTable />
    </QueryClientProviderWrapper>
  );
}
