import { createClient } from "@/auth/server";
import { DataTable } from "@/components/data-table";
import { columns } from "@/app/(authenticated)/(dashboard)/columns";


export default async function Home() {

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession()
  const accessToken = data?.session?.access_token;

  const response = await fetch("http://localhost:80/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    cache: "no-store"
  });
  const users = await response.json();
  console.log(users);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
      <p className="text-muted-foreground">Here you can see users related information</p>
      <div className="container mx-auto p-8">
        <DataTable columns={columns} data={users} />
      </div>
    </div>

  );
}
