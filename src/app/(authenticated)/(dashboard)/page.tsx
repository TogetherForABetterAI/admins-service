import { DataTable } from "@/components/data-table";
import { UserType } from "@/lib/user_type";


export default async function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
      <p className="text-muted-foreground">Here you can see users related information</p>
      <DataTable type={UserType.USERS} />
    </div>

  );
}
