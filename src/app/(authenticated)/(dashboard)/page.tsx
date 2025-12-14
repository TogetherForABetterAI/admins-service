import { QueryClientProviderWrapper } from "@/components/query-client-provider-wrapper";
import { Dashboard } from "@/components/dashboard";


export default async function Home() {
  return (
    <QueryClientProviderWrapper>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground" style={{ paddingBottom: "calc(var(--spacing) * 16)" }}>Here you can see an overview of users and tokens information</p>
      <Dashboard />
    </QueryClientProviderWrapper>
  );
}