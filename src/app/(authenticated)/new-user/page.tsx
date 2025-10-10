import { QueryClientProviderWrapper } from "@/components/query-client-provider-wrapper";
import UserForm from "@/components/forms/user-form";



export default function NewUserPage() {

  return (
    <QueryClientProviderWrapper>
      <h1 className="text-2xl font-bold">Register New User</h1>
      <p className="text-muted-foreground">Enter the details of the new user you want to create.</p>
      <UserForm />
    </QueryClientProviderWrapper>
  );
}
