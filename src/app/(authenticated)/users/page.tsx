import { QueryClientProviderWrapper } from "@/components/query-client-provider-wrapper";
import UserForm from "@/components/forms/user-form";
import { UsersTable } from "@/components/tables/users-table";



export default function NewUserPage() {
  return (
    <QueryClientProviderWrapper>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Register New User</h1>
        <p className="text-muted-foreground">Enter the details of the new user you want to create.</p>
      </div>
      <div style={{ paddingBottom: "calc(var(--spacing) * 8)" }}></div>

      <div className="container mx-auto pb-10">
        <UsersTable />
      </div>
    </QueryClientProviderWrapper >
  );
}