import { DataTable } from "@/components/data-table";
import { UserType } from "@/lib/table-data-type";


export default async function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Manage user info</h1>
      <p className="text-muted-foreground">Here you can see users information</p>
      <DataTable type={UserType.USERS} />


    </div>

  );
}
