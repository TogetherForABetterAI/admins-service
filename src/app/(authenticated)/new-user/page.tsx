import { QueryClientProviderWrapper } from "@/components/query-client-provider-wrapper";
import UserForm from "@/components/forms/user-form";



export default function NewUserPage() {
  return (
    <QueryClientProviderWrapper>
      <div className="container mx-auto py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Register New User</h1>
          <p className="text-muted-foreground">Enter the details of the new user you want to create.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <UserForm />
        </div>
      </div>
    </QueryClientProviderWrapper>
  );
}