import { UserType } from "@/lib/table-data-type";
import { QueryClientProviderWrapper } from "@/components/query-client-provider-wrapper";
import { UsersTable } from "@/components/tables/users-table";


export default async function Home() {


  return (
    <div className="p-8" >
      <h1 className="text-2xl font-bold">Manage user info</h1>
      <p className="text-muted-foreground">Here you can see users information</p>
      <QueryClientProviderWrapper>
        <UsersTable />
      </QueryClientProviderWrapper>
    </div >

  );
}
