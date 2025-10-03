import { QueryClientProviderWrapper } from "@/components/query-client-provider-wrapper";
import UserForm from "@/components/forms/user-form";



export default function NewUserPage() {

  return (
    <QueryClientProviderWrapper>
      <UserForm />
    </QueryClientProviderWrapper>
  );
}
